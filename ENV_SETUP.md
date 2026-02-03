# Environment Variables for Auth & Billing

Add these to your `.env.local` file for the auth and billing integration to work.

## Required for Auth

```env
# NextAuth (required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-at-least-32-chars

# Backend API (used by both client and server)
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000
```

## Required for Google OAuth

Create a project in [Google Cloud Console](https://console.cloud.google.com/), enable the Google+ API, and create OAuth 2.0 credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs (and your production URL when deploying).

## Production

For production, set:

- `NEXTAUTH_URL` to your frontend URL (e.g. `https://continuumworks.app`)
- `NEXT_PUBLIC_API_URL` and `API_URL` to your backend URL (e.g. `https://api.continuumworks.app`)

## Backend CORS

Ensure your backend allows your frontend origin in CORS (e.g. `http://localhost:3000` for dev, `https://continuumworks.app` for prod).
