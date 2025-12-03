# Testing TikTok OAuth Without Database

If your database connection is failing (Supabase paused), you can still test the TikTok OAuth flow up to the point where it tries to save to the database.

## What Works Without Database

✅ **OAuth Flow**
- Authorization redirect to TikTok
- User authorization
- Token exchange
- Fetching user info from TikTok API

❌ **What Breaks**
- Saving account to database
- Viewing connected accounts
- Storing metrics

## Testing Steps

### Step 1: Add Your Account as Test User

1. Go to [TikTok Developer Portal](https://developers.tiktok.com)
2. Select your app → "App Permissions" → "Test Users"
3. Add your TikTok username or email
4. Save

### Step 2: Test OAuth Flow

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to connect page:**
   ```
   http://localhost:3000/connect
   ```

3. **Click "Connect TikTok Account"**
   - Should redirect to TikTok authorization page
   - Authorize the app
   - Should redirect back to your app

### Step 3: Check Server Logs

Watch your terminal for errors. You should see:

**Success indicators:**
- `Token exchange successful`
- `User info fetched: { display_name: "...", ... }`
- Then a database error (expected if DB is paused)

**Failure indicators:**
- `Failed to exchange code for tokens` - Token exchange failed
- `Failed to fetch TikTok user info` - API call failed
- `Database error` - Expected if Supabase is paused

## Understanding the Error Flow

### If OAuth Succeeds But Database Fails

You'll see in logs:
```
✅ Token exchange successful
✅ User info fetched successfully
❌ Database error: getaddrinfo ENOTFOUND db.xxxxx.supabase.co
```

**This means:**
- ✅ OAuth is working correctly
- ✅ TikTok API calls are working
- ❌ Database connection is the issue

### If TikTok API Fails

You'll see:
```
✅ Token exchange successful
❌ Failed to fetch TikTok user info: [error details]
```

**Possible causes:**
- Missing `fields` parameter (should be fixed now)
- Invalid access token
- API rate limiting
- Account permissions issue

## Quick Fix: Test with Mock Database

If you want to test the full flow without fixing Supabase, you can temporarily mock the database:

### Option 1: Comment Out Database Calls

In `app/api/auth/callback/route.ts`, temporarily comment out the database operations:

```typescript
// Upsert user in database
try {
  // TEMPORARILY COMMENTED FOR TESTING
  // const existingAccount = await query(...);
  // ... rest of database code
  
  console.log('✅ OAuth successful! User would be saved:', {
    open_id: tokenResponse.open_id,
    username: tiktokUserInfo.display_name,
  });
} catch (dbError) {
  console.log('Database error (expected if Supabase paused):', dbError);
  // Still redirect to success for testing
}
```

### Option 2: Use In-Memory Storage

Create a simple in-memory store for testing:

```typescript
// Temporary in-memory store
const testAccounts: any[] = [];

// Replace database query with:
testAccounts.push({
  id: tokenResponse.open_id,
  tiktokUserId: tokenResponse.open_id,
  username: tiktokUserInfo.display_name,
  connectedAt: new Date(),
});
```

## Fixing the Database Issue

The `ENOTFOUND` error means Supabase is paused or the connection string is wrong.

### Step 1: Reactivate Supabase

1. Go to [supabase.com](https://supabase.com)
2. Log in to your account
3. Find your project
4. If paused, click "Restore" or "Resume"
5. Wait 2-3 minutes for it to fully start

### Step 2: Verify Connection String

1. In Supabase Dashboard → Settings → Database
2. Copy the **Direct connection** URI
3. Update `.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Step 3: Test Connection

```bash
# Restart your dev server
npm run dev
```

Check logs - database errors should be gone.

## Testing Checklist

- [ ] Added TikTok account as Test User
- [ ] Logged into TikTok with test account
- [ ] Started dev server (`npm run dev`)
- [ ] Navigated to `/connect`
- [ ] Clicked "Connect TikTok Account"
- [ ] Authorized on TikTok
- [ ] Checked server logs for errors
- [ ] Verified token exchange succeeded
- [ ] Verified user info fetch succeeded
- [ ] Fixed database connection (if needed)
- [ ] Verified account saved to database

## Expected Behavior

### With Working Database:
1. OAuth flow completes
2. Token exchange succeeds
3. User info fetched
4. Account saved to database
5. Redirected to `/connect?success=tiktok_connected`
6. Account appears in connected accounts list

### With Paused Database:
1. OAuth flow completes
2. Token exchange succeeds
3. User info fetched
4. Database error occurs
5. Redirected to `/connect?error=database_error`
6. Error message displayed

## Debugging Tips

### Check Server Logs

Look for these patterns:

**Good signs:**
```
Token exchange successful
User info fetched: { display_name: "...", ... }
```

**Bad signs:**
```
Failed to exchange code for tokens
Failed to fetch TikTok user info
```

### Check Browser Console

Open browser DevTools → Console, look for:
- Network errors
- JavaScript errors
- Redirect issues

### Check Network Tab

In DevTools → Network:
- Look for `/api/auth/callback` request
- Check response status
- Check for redirects

## Common Issues

### Issue: "client_key" Error

**Solution:** Add account as Test User in Developer Portal

### Issue: Token Exchange Fails

**Possible causes:**
- Wrong `code_verifier` (PKCE issue)
- Expired authorization code
- Invalid client secret

**Solution:** Check server logs for specific error

### Issue: User Info Fetch Fails

**Possible causes:**
- Missing `fields` parameter (should be fixed)
- Invalid access token
- API permissions issue

**Solution:** Check error message in logs

### Issue: Database Connection Fails

**Solution:** Reactivate Supabase and verify connection string

## Next Steps

1. **Fix Database Connection** - Reactivate Supabase
2. **Test Full Flow** - Connect account end-to-end
3. **Verify Data** - Check that account appears in dashboard
4. **Test Metrics** - Run cron job to fetch metrics

