# `ops.continuumworks.app` (same Next.js app)

The app serves **Continuum Ops** at **`/ops`**. The same deployment can also answer on a subdomain so users see Ops as a dedicated surface.

## What the code does

1. **`middleware.ts`**  
   If the request `Host` is `ops.*` (e.g. `ops.continuumworks.app`) or `ops.localhost`, and the path is `/`, the browser is **redirected** to `/ops` on that same host (e.g. `https://ops.continuumworks.app/ops`).

2. **Auth**  
   `/ops` is protected the same way as `/dashboard/*` (NextAuth middleware).

## DNS & hosting (Vercel example)

1. **Add the subdomain to your project**  
   Vercel → Project → Settings → Domains → add `ops.continuumworks.app`.

2. **DNS**  
   At your DNS provider, add a record for `ops` pointing to Vercel (usually **CNAME** `ops` → `cname.vercel-dns.com` or the value Vercel shows).

3. **Same project**  
   No separate deployment: `continuumworks.app` and `ops.continuumworks.app` both hit this Next.js app.

## Auth cookies across subdomains (important)

For sessions to work on both `www.continuumworks.app` and `ops.continuumworks.app`, NextAuth usually needs a **shared cookie domain**:

- Set **`NEXTAUTH_URL`** to your primary public URL (often `https://www.continuumworks.app` or apex).
- Configure the session cookie **`domain`** to the parent domain, e.g. **`.continuumworks.app`**, so the cookie is sent to `ops.continuumworks.app` as well.

Exact env keys depend on your NextAuth version and `next-auth` config (see [NextAuth.js cookies](https://next-auth.js.org/configuration/options#cookies)). Test login on both the main site and `ops.*` after changing this.

## Local testing

1. Map a hostname to localhost, e.g. in `hosts` file:  
   `127.0.0.1 ops.localhost`
2. Open `http://ops.localhost:3000/` — you should be redirected to `http://ops.localhost:3000/ops`.

If `ops.localhost` does not resolve, use only the path **`/ops`** on `localhost` during development.
