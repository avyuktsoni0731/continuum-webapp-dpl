# Beta Access Control Setup

This guide explains how to restrict access to the installation flow so only your beta testers can use it.

## 🎯 How It Works

1. **Access Gate**: The `/install` page shows an access code input screen
2. **Code Validation**: Users must enter a valid access code to continue
3. **Session Storage**: Once granted, access persists for the session
4. **Environment Variables**: Access codes are stored in environment variables

## ⚙️ Setup Instructions

### **Step 1: Enable Beta Mode**

Add to your `.env.local`:

```bash
# Enable beta access control
NEXT_PUBLIC_BETA_ENABLED=true

# Option 1: Single access code (simpler)
NEXT_PUBLIC_BETA_ACCESS_CODE=beta-continuum-2026

# Option 2: Multiple access codes (comma-separated)
NEXT_PUBLIC_BETA_ACCESS_CODES=beta-continuum-2026,test-code-123,another-code-456
```

### **Step 2: Generate Access Codes**

You can use any format you like. Examples:

```bash
# Simple codes
NEXT_PUBLIC_BETA_ACCESS_CODE=beta-2026

# UUID-style codes
NEXT_PUBLIC_BETA_ACCESS_CODE=beta-550e8400-e29b-41d4-a716-446655440000

# Custom codes per tester
NEXT_PUBLIC_BETA_ACCESS_CODES=john-2026,sarah-2026,team-alpha-2026
```

### **Step 3: Share Codes with Beta Testers**

Send access codes to your beta testers via:
- Email
- Slack/Discord
- Private message
- Invite links with code in query param (optional)

### **Step 4: Test It**

1. Visit `/install` - should show access gate
2. Enter incorrect code - should show error
3. Enter correct code - should show install page
4. Refresh page - should still have access (session persists)
5. Open new tab - should require code again (new session)

## 🔒 Security Notes

### **Current Implementation (Client-Side)**

⚠️ **Important**: The current implementation validates codes on the client-side for UX. This means:
- Codes are visible in the browser bundle (environment variables)
- Tech-savvy users could bypass this
- Good for: Basic beta testing, preventing casual access
- Not good for: Highly sensitive data, production security

### **For Better Security (Recommended for Production)**

Add server-side validation:

1. **Create API endpoint** (`/api/beta/verify`):
   ```typescript
   // app/api/beta/verify/route.ts
   export async function POST(req: Request) {
     const { code } = await req.json();
     
     // Validate against server-side secret
     const validCode = process.env.BETA_ACCESS_CODE; // Server-side only!
     
     if (code === validCode) {
       return Response.json({ valid: true });
     }
     
     return Response.json({ valid: false }, { status: 401 });
   }
   ```

2. **Update `BetaAccessGate`** to call API instead of client-side validation

3. **Keep codes server-side only** (not in `NEXT_PUBLIC_*`)

## 🎨 How It Looks

### **Access Gate Screen:**
- Lock icon
- "Private Beta" heading
- Access code input field
- "Continue" button
- Link to waitlist (for requesting access)
- Error message if code is invalid

### **After Access Granted:**
- Shows full install page
- Access persists for the session
- User can install Continuum normally

## 🔄 Flow

```
User visits /install
    ↓
Is beta enabled?
    ↓ Yes
Show access gate
    ↓
User enters code
    ↓
Validate code
    ↓ Valid
Grant access
    ↓
Show install page
    ↓
Store in sessionStorage
    ↓
Next page visits (same session) → Skip gate
```

## 📋 Environment Variables

| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `NEXT_PUBLIC_BETA_ENABLED` | boolean | Enable/disable beta mode | `true` |
| `NEXT_PUBLIC_BETA_ACCESS_CODE` | string | Single access code | `beta-2026` |
| `NEXT_PUBLIC_BETA_ACCESS_CODES` | string | Multiple codes (comma-separated) | `code1,code2,code3` |

**Note**: Use either `NEXT_PUBLIC_BETA_ACCESS_CODE` OR `NEXT_PUBLIC_BETA_ACCESS_CODES`, not both.

## 🚀 Production Deployment

### **Vercel/Netlify:**

1. Add environment variables in dashboard:
   ```
   NEXT_PUBLIC_BETA_ENABLED=true
   NEXT_PUBLIC_BETA_ACCESS_CODE=your-secret-code
   ```

2. Deploy

3. Share access codes with beta testers

### **Disable Beta Mode (Make Public):**

Simply set:
```bash
NEXT_PUBLIC_BETA_ENABLED=false
```

Or remove the variable entirely. The install page will be publicly accessible.

## 🎯 Usage Tips

### **Per-Tester Codes:**
Use different codes for each tester to track who's accessing:
```bash
NEXT_PUBLIC_BETA_ACCESS_CODES=john-2026,sarah-2026,mike-2026
```

### **Time-Limited Codes:**
Change codes periodically:
```bash
# Week 1
NEXT_PUBLIC_BETA_ACCESS_CODE=beta-week1-2026

# Week 2
NEXT_PUBLIC_BETA_ACCESS_CODE=beta-week2-2026
```

### **Revoke Access:**
Simply change the codes - old codes will stop working immediately.

## ❓ FAQ

**Q: Can users bypass this?**  
A: Tech-savvy users could bypass client-side validation. For production, add server-side validation.

**Q: How do I revoke access?**  
A: Change the access codes in environment variables and redeploy.

**Q: Can I see who's using what code?**  
A: Not with current implementation. Add analytics/logging to track.

**Q: Does it work across devices?**  
A: No, access is per-session per-browser. Users need to enter code on each device.

**Q: Can I add email verification?**  
A: Yes! Create an allowlist API that validates email addresses instead of codes.

## 🔐 Advanced: Email Allowlist (Optional)

Instead of codes, you could validate against an email allowlist:

1. Create `/api/beta/check-email`
2. Send user email (from waitlist or signup)
3. Check against allowed emails list
4. Grant access if email is in list

This is more secure and easier to manage than codes!

## ✅ You're Done!

Your installation flow is now protected! Only users with valid access codes can install Continuum.
