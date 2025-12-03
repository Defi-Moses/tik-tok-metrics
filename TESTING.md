# Testing Guide

## What Has Been Implemented

### ✅ Security & Token Management
1. **Token Encryption**: Tokens are encrypted using JWT before storing in database
2. **Token Decryption**: Created `lib/token-utils.ts` with functions to decrypt tokens when needed
3. **Token Refresh**: Automatic token refresh when tokens expire during API calls
4. **CSRF Protection**: OAuth flow includes CSRF state validation

### ✅ OAuth Flow
1. **OAuth Initiation**: `/api/auth/tiktok` route with proper scopes (`user.info.basic,video.list`)
2. **OAuth Callback**: `/api/auth/callback` handles token exchange and user creation
3. **Token Storage**: Encrypted tokens stored in `tiktok_accounts` table

### ✅ Data Fetching
1. **Cron Job**: `/api/cron` route fetches stats for all connected accounts
2. **Rate Limiting**: Built-in delays and rate limit error handling
3. **Pagination**: Fetches all videos with proper pagination
4. **Error Handling**: Handles token expiration, rate limits, and API errors

### ✅ Database Schema
1. **Migration File**: Created `migrations/002_actual_schema.sql` matching the codebase
2. **Tables**: `users`, `tiktok_accounts`, `metrics`

## Environment Variables Required

Make sure your `.env` file has:

```bash
# TikTok API Configuration
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret

# Next.js Environment
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL

# JWT Secret for token encryption (generate a strong random string)
JWT_SECRET=your-secret-key-change-in-production-use-random-string

# Optional: Cron Secret for securing cron endpoint
CRON_SECRET=optional-cron-secret-for-production
```

## Database Setup

1. **Set up Supabase** (see `SUPABASE_SETUP.md` for detailed instructions):
   - Create a Supabase project
   - Get your connection string
   - Add `DATABASE_URL` to `.env` file

2. **Run the migration** to create the correct schema:
   - Use Supabase SQL Editor (easiest)
   - Or use psql command line
   - Run `migrations/002_actual_schema.sql`

3. **Verify tables exist**:
   - `users` - stores user accounts
   - `tiktok_accounts` - stores TikTok account connections with encrypted tokens
   - `metrics` - stores daily snapshots of account stats

## Testing the Signup Workflow

### Step 1: Test OAuth Connection
1. Start your development server: `npm run dev`
2. Navigate to `/connect`
3. Click "Connect TikTok Account"
4. You should be redirected to TikTok's authorization page
5. Authorize the app
6. You should be redirected back to `/connect?success=tiktok_connected`

### Step 2: Verify Token Storage
1. Check your database - the `tiktok_accounts` table should have:
   - A new row with your TikTok account
   - Encrypted `accessToken` and `refreshToken` (should be JWT strings, not plain tokens)
   - `username` field populated

### Step 3: Verify Security
- ✅ Tokens should be encrypted (JWT format, not plain text)
- ✅ CSRF state cookie should be set during OAuth flow
- ✅ State validation happens in callback

## Testing Data Fetching

### Step 1: Manual Cron Trigger
You can manually trigger the cron job to test data fetching:

```bash
# Using curl
curl http://localhost:3000/api/cron

# Or with authentication (if CRON_SECRET is set)
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron
```

### Step 2: Verify Data Fetching
1. The cron job should:
   - Fetch all TikTok accounts from database
   - Decrypt tokens for each account
   - Fetch user info from TikTok API
   - Fetch all videos (with pagination)
   - Calculate metrics (total likes, views, comments, shares)
   - Save snapshot to `metrics` table

### Step 3: Check Results
1. Check `metrics` table - should have a new row with:
   - `accountId` matching your TikTok account
   - `followers` count
   - `likes` (total from all videos)
   - `videos` count
   - `recordedAt` timestamp

### Step 4: Test Token Refresh
1. Wait for token to expire (or manually expire it in database)
2. Trigger cron job again
3. Should automatically refresh token and continue fetching data
4. Check database - new encrypted tokens should be stored

## Testing Security

### ✅ Token Encryption
- Tokens in database should be JWT strings, not plain text
- Use `lib/token-utils.ts` functions to decrypt when needed

### ✅ Token Refresh
- When API returns 401 (TokenExpiredError), tokens are automatically refreshed
- New tokens are encrypted and stored back in database

### ✅ Rate Limiting
- Cron job includes 2-second delays between accounts
- If rate limit hit, waits 60 seconds before continuing
- Errors are logged but don't stop processing other accounts

## Production Deployment Checklist

1. **Environment Variables**:
   - Set `NEXT_PUBLIC_APP_URL` to your production domain
   - Set `JWT_SECRET` to a strong random string
   - Set `CRON_SECRET` for cron endpoint security
   - Set TikTok credentials

2. **Database**:
   - Run migration `002_actual_schema.sql` on production database
   - Verify all tables exist

3. **Vercel Cron**:
   - `vercel.json` is configured to run cron at 2 AM daily
   - Verify cron is enabled in Vercel dashboard

4. **TikTok App Configuration**:
   - Redirect URI should be: `https://your-domain.vercel.app/api/auth/callback`
   - Scopes: `user.info.basic,video.list`

## What's Missing from Your Checklist

### Step 1: ✅ TikTok Developer Setup - DONE
- OAuth redirect configured
- Scopes requested

### Step 2: ✅ Project Scaffolding - DONE
- Next.js app created
- Database schema created

### Step 3: ✅ OAuth Flow - DONE
- Connect page exists
- OAuth routes implemented
- Token encryption implemented
- Token refresh logic implemented

### Step 4: ✅ Data Fetching Logic - DONE
- TikTok API client created
- fetchUserProfile() implemented
- fetchUserVideos() implemented with pagination
- calculateMetrics() implemented
- saveSnapshot() implemented

### Step 5: ✅ Cron Job - DONE
- `/api/cron` route implemented
- Loops through all users
- Rate limiting and delays added
- Error handling and logging added
- `vercel.json` configured

### Step 6: ✅ Dashboard Frontend - DONE
- Main dashboard page exists
- User detail page exists
- 7-day calculation implemented
- Charts implemented (recharts)

### Step 7: ✅ Account Management - DONE
- Disconnect functionality exists
- Connected accounts view exists
- Token expiration handled gracefully

### Step 8: ⚠️ Polish & Production - PARTIAL
- ✅ Error boundaries exist
- ✅ Logging implemented
- ✅ Rate limit handling with retries
- ✅ Security review (token encryption, CSRF)
- ⚠️ TikTok app review submission - **YOU NEED TO DO THIS**
- ✅ Production deployment ready

## Next Steps

1. **Test the signup workflow** as described above
2. **Test data fetching** by manually triggering the cron job
3. **Verify security** - check that tokens are encrypted
4. **Submit TikTok app for review** - required for production use
5. **Deploy to production** and configure Vercel Cron

