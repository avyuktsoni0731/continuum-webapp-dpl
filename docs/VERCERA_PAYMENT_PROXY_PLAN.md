# Vercera Payment Proxy – Implementation Plan

## Goal

- **Vercera** (www.vercera.in) cannot use Razorpay for ticketing/events (domain not approved).
- **Continuum** (www.continuumworks.app) has Razorpay approved.
- Proxy payment creation and verification through Continuum; registration data stays on Vercera (Firestore).

---

## Current Vercera Flow

1. **Create order** – `POST /api/razorpay/create-order`  
   Body: `{ amount, eventId, eventName, email, userId }`  
   Returns: `{ id (orderId), amount, currency }`

2. **Checkout** – Frontend opens Razorpay with `key: NEXT_PUBLIC_RAZORPAY_KEY_ID`, `order_id`, etc.

3. **Verify payment** – `POST /api/razorpay/verify-payment`  
   Body: `{ orderId, paymentId, signature, eventId, eventName, amount, userId, team?, additionalInfo? }`  
   - Verifies signature with Razorpay secret  
   - Writes to Firestore (registrations, teams)  
   Returns: `{ success: true }`

---

## Proxy Flow (after implementation)

1. **Vercera frontend** calls **Continuum** proxy to create order (with shared secret).
2. **Continuum** creates Razorpay order with Continuum’s keys; returns `orderId`, `amount`, `currency`, and **Continuum’s** `keyId` for checkout.
3. **Vercera frontend** opens Razorpay with Continuum’s `keyId` and returned `orderId`. User pays.
4. **Vercera frontend** sends payment response to **Continuum** proxy verify endpoint (with same payload + shared secret).
5. **Continuum** verifies signature with Continuum’s Razorpay secret; then **server-to-server** calls **Vercera** callback URL with a second secret and the same payload.
6. **Vercera** new endpoint receives callback, validates callback secret, writes to Firestore (same logic as current verify-payment, no Razorpay check).

---

## Continuum (this repo) – To implement

### 1. Dependencies

- Add `razorpay` in `package.json` for order creation and server-side verification.

### 2. Environment variables

- `RAZORPAY_KEY_ID` – Continuum’s Razorpay key (for create order).
- `RAZORPAY_KEY_SECRET` – Continuum’s Razorpay secret (for verify).
- `EV_PROXY_SECRET` – Shared secret; Vercera sends this in requests to Continuum (e.g. header `X-EV-Secret` or `Authorization: Bearer <EV_PROXY_SECRET>`).
- `VERCERA_CALLBACK_URL` – e.g. `https://www.vercera.in/api/registration/confirm-paid`.
- `VERCERA_CALLBACK_SECRET` – Secret Continuum sends when calling Vercera (e.g. header `X-Callback-Secret`).

### 3. Proxy API routes (hidden / non-obvious)

Use a single, non-obvious path prefix (e.g. `/api/ev/`) and require `EV_PROXY_SECRET` on every request.

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ev/create-order` | POST | Create Razorpay order; return `id`, `amount`, `currency`, `keyId`. |
| `/api/ev/verify` | POST | Verify Razorpay payment; on success POST to `VERCERA_CALLBACK_URL` with payload; return `{ success: true }` or error. |

**Request auth:**  
- Header: `X-EV-Secret: <EV_PROXY_SECRET>` or `Authorization: Bearer <EV_PROXY_SECRET>`.  
- Reject with 401 if missing or wrong.

**Create-order**  
- Body (same as Vercera): `{ amount, eventId, eventName, email, userId }`.  
- Create Razorpay order (INR, notes with eventId, eventName, userId, email).  
- Response: `{ id, amount, currency, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_ID }`.  
- Expose key for checkout only via response (no need to put in Vercera’s public env).

**Verify**  
- Body (same as Vercera): `{ orderId, paymentId, signature, eventId, eventName, amount, userId, team?, additionalInfo? }`.  
- Verify signature with `RAZORPAY_KEY_SECRET`.  
- On success: `POST VERCERA_CALLBACK_URL` with body = same payload + any needed metadata, header `X-Callback-Secret: VERCERA_CALLBACK_SECRET`.  
- Return `{ success: true }` to Vercera frontend, or error if verify or callback fails.

### 4. Security

- No links to these routes from Continuum’s UI.
- Optional: rate limit by IP or by `EV_PROXY_SECRET`.
- Optional: allowlist `Origin` / `Referer` to `https://www.vercera.in` (and dev origins if needed).

---

## Vercera (website-vercera-5.0) – To implement

### 1. Environment variables

- `NEXT_PUBLIC_PAYMENT_PROXY_URL` = `https://www.continuumworks.app` (or your Continuum domain).
- `EV_PROXY_SECRET` = same value as on Continuum (shared secret).
- `VERCERA_CALLBACK_SECRET` = same value as `VERCERA_CALLBACK_SECRET` on Continuum (for callback auth).

### 2. Checkout page changes

- **Create order:**  
  Instead of `fetch('/api/razorpay/create-order', ...)`  
  use `fetch(\`${process.env.NEXT_PUBLIC_PAYMENT_PROXY_URL}/api/ev/create-order\`, { headers: { 'X-EV-Secret': process.env.EV_PROXY_SECRET }, ... })`.  
  (Secret must be in a server-only env or passed via a small Vercera API route that forwards to Continuum with the secret.)

- **Razorpay checkout:**  
  Use `keyId` from create-order response (Continuum’s key) and `order_id` from response `id`.

- **Verify:**  
  Instead of `fetch('/api/razorpay/verify-payment', ...)`  
  use proxy verify URL with `X-EV-Secret` and same body.  
  (Again, secret should not be in client; use a Vercera API route that forwards to Continuum with the secret.)

So: **Vercera frontend** should call **Vercera’s own** `/api/razorpay/create-order` and `/api/razorpay/verify-payment`; those routes are changed to **forward** to Continuum’s proxy (adding the secret server-side) and return the response. That way the secret never hits the client.

### 3. New callback endpoint on Vercera

- **Route:** `POST /api/registration/confirm-paid`  
- **Auth:** Require header `X-Callback-Secret: VERCERA_CALLBACK_SECRET`.  
- **Body:** Same as current verify-payment (orderId, paymentId, eventId, eventName, amount, userId, team?, additionalInfo?).  
- **Logic:** Same Firestore write as in current `verify-payment` (registrations + teams), but **skip** Razorpay signature verification (already done by Continuum).  
- Return `{ success: true }` or 4xx/5xx.

---

## Summary

| Where | What |
|-------|------|
| **Continuum** | Add `/api/ev/create-order` and `/api/ev/verify`; Razorpay create + verify; callback to Vercera with secret. |
| **Vercera** | (1) Change create-order and verify-payment to forward to Continuum with secret. (2) Add `/api/registration/confirm-paid` to receive callback and write to Firestore. |

This keeps payment processing on Continuum’s approved domain and keeps all registration data and Firestore writes on Vercera.

---

## Continuum env (example)

Add to `.env.local` or deployment:

```env
# Razorpay (Continuum’s approved account)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx

# Proxy auth (shared with Vercera)
EV_PROXY_SECRET=<generate-a-long-random-string>

# Callback to Vercera after successful verify
VERCERA_CALLBACK_URL=https://www.vercera.in/api/registration/confirm-paid
VERCERA_CALLBACK_SECRET=<generate-another-long-random-string>
```

Vercera must set the same `EV_PROXY_SECRET` and `VERCERA_CALLBACK_SECRET` on their side.

---

## Vercera callback payload

`POST /api/registration/confirm-paid` will receive:

- **Header:** `X-Callback-Secret: <VERCERA_CALLBACK_SECRET>`
- **Body:** `{ orderId, paymentId, eventId, eventName, amount, userId, team?, teamName?, memberEmails?, additionalInfo? }`

Reuse the same Firestore write logic as in current `verify-payment` (solo + team registrations, duplicate checks, etc.); only omit Razorpay signature verification.
