# TikTok OAuth Setup & Troubleshooting Guide

## Common Errors and Solutions

### Error: "client_key" - We couldn't log in with TikTok

This error occurs when your TikTok app is in **Development Mode** and the account trying to authenticate hasn't been added as a Test User.

#### Solution: Add Test Users

1. **Go to TikTok Developer Portal**
   - Visit [https://developers.tiktok.com](https://developers.tiktok.com)
   - Log in with your TikTok Developer account

2. **Navigate to Your App**
   - Click "My Apps" in the top navigation
   - Select your app (Client Key: `awi1hq5inmipe3cx`)

3. **Add Test Users**
   - Go to **"App Permissions"** → **"Test Users"**
   - Click **"Add Test User"**
   - Enter the TikTok username or email of the account you want to test with
   - You can add up to **10 test users** per app

4. **Try Again**
   - Make sure you're logged out of TikTok
   - Log back in with the test user account
   - Attempt to connect the account again through your app

### Error: Redirect URI Mismatch

The redirect URI must **exactly match** what's configured in your TikTok Developer Portal.

#### Current Redirect URI
```
http://localhost:3000/api/auth/callback
```

#### How to Verify/Update in TikTok Developer Portal

1. Go to your app in [TikTok Developer Portal](https://developers.tiktok.com)
2. Navigate to **"Basic Information"** or **"Platform Settings"**
3. Find **"Redirect URI"** or **"Callback URL"**
4. Ensure it exactly matches: `http://localhost:3000/api/auth/callback`
5. If it doesn't match, add/update it and save

**Important Notes:**
- The redirect URI is case-sensitive
- No trailing slashes
- Must include the full path: `/api/auth/callback`
- For production, you'll need to add your production URL (e.g., `https://yourdomain.com/api/auth/callback`)

### Error: "code_challenge" Missing

This should be fixed now with PKCE implementation, but if you see this error:

- Make sure you're using the latest code
- Clear your browser cookies and try again
- Check that the OAuth flow is using PKCE (code_challenge and code_verifier)

## Development vs Production Mode

### Development Mode (Current)
- ✅ Only test users can authenticate
- ✅ Up to 10 test users
- ✅ Good for testing and development
- ❌ Limited to test users only

### Production Mode (After Approval)
- ✅ Any TikTok user can authenticate
- ✅ No test user limit
- ✅ Requires app review and approval
- ⏳ Can take several days/weeks for approval

## Step-by-Step Setup Checklist

- [ ] TikTok Developer account created
- [ ] App created in TikTok Developer Portal
- [ ] Client Key and Client Secret obtained
- [ ] Redirect URI configured: `http://localhost:3000/api/auth/callback`
- [ ] Test users added (for Development Mode)
- [ ] Environment variables set in `.env`:
  - `TIKTOK_CLIENT_KEY`
  - `TIKTOK_CLIENT_SECRET`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- [ ] App running on `http://localhost:3000`
- [ ] Test user logged into TikTok
- [ ] Attempting to connect account

## Testing the OAuth Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to connect page:**
   ```
   http://localhost:3000/connect
   ```

3. **Click "Connect TikTok Account"**

4. **You should be redirected to TikTok authorization page**

5. **After authorizing, you'll be redirected back to:**
   ```
   http://localhost:3000/api/auth/callback?code=...
   ```

6. **Then redirected to:**
   ```
   http://localhost:3000/connect?success=tiktok_connected
   ```

## Troubleshooting Steps

If OAuth still fails:

1. **Check Environment Variables**
   ```bash
   # Verify these are set in .env
   TIKTOK_CLIENT_KEY=awi1hq5inmipe3cx
   TIKTOK_CLIENT_SECRET=T1a3XrC6sTgrU7oZX2S9qitdleE1yXdj
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **Verify Redirect URI in TikTok Portal**
   - Must be exactly: `http://localhost:3000/api/auth/callback`

3. **Check Test Users**
   - Account must be added as test user
   - Must be logged into TikTok with test user account

4. **Clear Browser Data**
   - Clear cookies for localhost
   - Try in incognito/private mode

5. **Check Server Logs**
   - Look for errors in terminal
   - Check for database connection issues

6. **Verify App Status**
   - App should be in "Development" mode
   - App should not be suspended or deleted

## Production Setup

When ready for production:

1. **Update Redirect URI**
   - Add production URL: `https://yourdomain.com/api/auth/callback`
   - Update `NEXT_PUBLIC_APP_URL` in production environment

2. **Submit for Review**
   - Go to TikTok Developer Portal
   - Submit app for review
   - Wait for approval (can take days/weeks)

3. **Switch to Production Mode**
   - Once approved, switch app to Production Mode
   - Any TikTok user can now authenticate

## Additional Resources

- [TikTok Developer Documentation](https://developers.tiktok.com/doc/)
- [TikTok OAuth Error Handling](https://developers.tiktok.com/doc/oauth-error-handling)
- [TikTok Login Kit](https://developers.tiktok.com/doc/login-kit-desktop/)

