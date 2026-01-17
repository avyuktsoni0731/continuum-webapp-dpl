# Install Page Setup Guide

Your Slack installation pages are ready! Here's what I created and what you need to do:

## 📁 Files Created

1. **`app/install/page.tsx`** - Main installation page
   - Beautiful landing page for installing Continuum
   - Matches your website's design aesthetic
   - "Add to Slack" button that links to your backend

2. **`app/install/success/page.tsx`** - Success page after installation
   - Shows success confirmation
   - Optionally connects Jira/GitHub if workspace_id is provided
   - Provides next steps and example commands

3. **Updated `components/navbar.tsx`** - Added "Install" link to navbar

## ⚙️ Environment Setup

Add this to your `.env.local` file:

```bash
# Backend API URL (defaults to https://api.continuumworks.app if not set)
NEXT_PUBLIC_API_URL=https://api.continuumworks.app
```

**Important:** Replace with your actual backend URL if different!

## 🚀 What You Need to Do

### 1. Update Backend Redirect (If Needed)

Your backend should redirect to the success page after installation. Update your backend's success redirect:

**Current:** Probably redirects to backend success page  
**Should redirect to:** `https://yourdomain.com/install/success?workspace_id={uuid}`

Or if you prefer to keep it on the backend, that's fine too - the frontend page is optional.

### 2. Test the Installation Flow

1. Visit `http://localhost:3000/install` (or your production URL)
2. Click "Add to Slack"
3. Complete OAuth flow
4. Should redirect to success page (or your backend's success page)

### 3. Link from Landing Page (Optional)

You can add an "Install" button to your landing page hero or CTA section. Example:

```tsx
<Link href="/install" className="...">
  Install Continuum
</Link>
```

Or update the "Reserve your spot" button to also link to install page.

## 🎨 Design Features

### **Install Page (`/install`):**
- ✅ Matches your landing page design (dark theme, same fonts)
- ✅ Animated sections with Framer Motion
- ✅ "Add to Slack" button with Slack purple branding
- ✅ Benefits section explaining what they get
- ✅ Quick setup steps (3 steps)
- ✅ Final CTA section

### **Success Page (`/install/success`):**
- ✅ Success confirmation with checkmark icon
- ✅ "Open Slack" button
- ✅ Optional integration cards (Jira/GitHub) if workspace_id present
- ✅ Example commands to try
- ✅ Matches site design consistency

## 🔗 Integration Flow

### **Current Flow:**
1. User visits `/install`
2. Clicks "Add to Slack" → Redirects to `${API_URL}/slack/install`
3. User authorizes in Slack
4. Backend redirects to `/slack/oauth/callback` (backend)
5. Backend processes → Redirects to success page (or stays on backend)

### **Recommended Flow:**
Update your backend's success redirect to point to frontend:

```
https://yourdomain.com/install/success?workspace_id={uuid}
```

This way users see your beautiful success page with integration options!

## 📝 Optional Enhancements

### **Add Install Button to Landing Page**

You could update the hero CTA to include an install option:

```tsx
<div className="flex gap-4">
  <Link href="/install" className="...">
    Install Now
  </Link>
  <button onClick={...}>Reserve Your Spot</button>
</div>
```

### **Update Navbar Link**

Already done! "Install" is now in the navbar.

### **Add Analytics Tracking**

Track install button clicks:

```tsx
import { trackEvent } from "@/lib/analytics";

<a
  href={`${API_URL}/slack/install`}
  onClick={() => trackEvent("install_button_click", { location: "install_page" })}
>
```

## ✅ Testing Checklist

- [ ] Visit `/install` page - should load and look good
- [ ] Click "Add to Slack" - should redirect to backend OAuth
- [ ] Complete installation - should redirect back
- [ ] Success page loads (if workspace_id provided, shows integration cards)
- [ ] All animations work smoothly
- [ ] Mobile responsive design works
- [ ] Navbar "Install" link works

## 🎉 You're Done!

Your installation pages are ready! Users can now:

1. Visit `/install` to install Continuum
2. See a beautiful, branded installation experience
3. Complete OAuth flow
4. See success page with next steps

The pages maintain your site's design consistency and provide a smooth user experience! 🚀
