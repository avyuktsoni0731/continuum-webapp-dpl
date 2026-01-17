# Backend Integration Guide

This document explains how the frontend integrates with your backend and what you need to configure.

## 🔗 Integration Flow

```
User visits: /install
    ↓
Clicks "Add to Slack"
    ↓
Redirects to: ${API_URL}/slack/install?redirect_uri=${FRONTEND_URL}/install/success
    ↓
Slack OAuth authorization
    ↓
Backend redirects to: ${API_URL}/slack/oauth/callback
    ↓
Backend processes workspace creation
    ↓
Backend redirects to: redirect_uri?workspace_id={uuid}
    (or your configured success page)
    ↓
Frontend success page shows
    ↓
User can click "Connect Integrations" → /setup?workspace_id={uuid}
    ↓
User connects Jira/GitHub via backend OAuth endpoints
```

## 📋 What's Already Set Up

### ✅ Frontend Pages Created

1. **`/install`** - Main installation page
   - "Add to Slack" button
   - Includes `redirect_uri` parameter pointing to `/install/success`

2. **`/install/success`** - Success page after installation
   - Shows if `workspace_id` is in URL
   - Optionally shows integration cards
   - Links to `/setup` page if workspace_id present

3. **`/setup`** - Integration setup page
   - Requires `workspace_id` query parameter
   - Shows Jira and GitHub connection options
   - Links to backend OAuth endpoints

## ⚙️ Backend Configuration Needed

### 1. Support `redirect_uri` Parameter

Your backend `/slack/install` endpoint should:

```python
# Accept redirect_uri query parameter
redirect_uri = request.query_params.get("redirect_uri")

# After OAuth success, redirect to:
redirect(f"{redirect_uri}?workspace_id={workspace_id}")
```

**If your backend doesn't support `redirect_uri` yet:**
- The frontend will still work
- Users will be redirected to your backend's success page
- They can manually visit `/setup?workspace_id={uuid}` to connect integrations

### 2. Update Success Redirect

Your backend should redirect to the frontend success page:

**Current (backend):**
```
/slack/oauth/callback → backend success page
```

**Recommended:**
```
/slack/oauth/callback → ${FRONTEND_URL}/install/success?workspace_id={uuid}
```

Or use the `redirect_uri` parameter if supported.

### 3. CORS Configuration

Make sure your backend allows requests from your frontend domain:

```python
CORS_ORIGINS = [
    "https://continuumworks.app",  # Your frontend domain
    "http://localhost:3000",        # Local development
]
```

## 🔧 Environment Variables

### Frontend (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=https://api.continuumworks.app
```

### Backend (should already have)

```bash
APP_URL=https://api.continuumworks.app
SLACK_REDIRECT_URI=https://api.continuumworks.app/slack/oauth/callback
JIRA_REDIRECT_URI=https://api.continuumworks.app/auth/jira/callback
GITHUB_REDIRECT_URI=https://api.continuumworks.app/auth/github/callback

# Optional: Frontend URL for redirects
FRONTEND_URL=https://continuumworks.app
```

## 📝 Backend Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/slack/install` | GET | Start OAuth flow | ✅ Used |
| `/slack/oauth/callback` | GET | Handle OAuth | ✅ Backend handles |
| `/auth/jira/authorize` | GET | Connect Jira | ✅ Used in setup page |
| `/auth/github/authorize` | GET | Connect GitHub | ✅ Used in setup page |
| `/setup` | GET | Backend setup page | ⚠️ Optional (we have frontend) |

## 🎯 What You Need to Do

### Option 1: Use Frontend Pages (Recommended)

1. **Update Backend Redirect:**
   ```python
   # In your OAuth callback handler
   frontend_url = os.getenv("FRONTEND_URL", "https://continuumworks.app")
   redirect_url = f"{frontend_url}/install/success?workspace_id={workspace_id}"
   return RedirectResponse(url=redirect_url)
   ```

2. **Support `redirect_uri` Parameter (Optional but Recommended):**
   ```python
   # In /slack/install endpoint
   redirect_uri = request.query_params.get("redirect_uri")
   # Store and use after OAuth success
   ```

3. **Test the Flow:**
   - Visit `/install`
   - Complete OAuth
   - Should redirect to `/install/success`
   - Should see integration options

### Option 2: Keep Backend Pages (Current)

If you prefer to keep your backend's success/setup pages:

1. **Remove `redirect_uri` from install buttons:**
   - Change links to just `${API_URL}/slack/install`
   - Users will stay on backend pages

2. **Link to Frontend Setup:**
   - Add a button in your backend setup page: "Or use our web setup"
   - Link to: `/setup?workspace_id={uuid}`

## 🔍 Testing Checklist

- [ ] Visit `/install` - should load
- [ ] Click "Add to Slack" - should redirect to backend
- [ ] Complete OAuth - should redirect back
- [ ] Success page shows (frontend or backend)
- [ ] `/setup?workspace_id={uuid}` loads with integration options
- [ ] Jira/GitHub connect buttons work
- [ ] OAuth redirects work correctly

## ❓ FAQ

**Q: Should I use frontend or backend success pages?**  
A: Frontend pages provide better UX and match your branding. Backend pages are simpler but less customizable.

**Q: What if backend doesn't support `redirect_uri`?**  
A: No problem! The frontend pages work independently. Users can manually visit `/setup?workspace_id={uuid}` after installation.

**Q: Can I use both?**  
A: Yes! You can have backend success page redirect to frontend setup page after showing success message.

**Q: What about the backend `/setup` page?**  
A: The frontend `/setup` page is a replacement/alternative. You can use either:
- Frontend: `/setup?workspace_id={uuid}` (matches your design)
- Backend: `${API_URL}/setup?workspace_id={uuid}` (simpler)

## 🎉 You're All Set!

The frontend is ready to work with your backend. Choose one of the options above and test the flow!
