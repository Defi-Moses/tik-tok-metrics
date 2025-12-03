# Quick Start Guide - Running & Testing

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Your `.env` file needs these variables. Currently you have TikTok credentials, but you need to add:

```bash
# Add these to your .env file
TIKTOK_CLIENT_KEY=awi1hq5inmipe3cx
TIKTOK_CLIENT_SECRET=T1a3XrC6sTgrU7oZX2S9qitdleE1yXdj

# REQUIRED: Add these
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-random-secret-here-generate-a-strong-string

# OPTIONAL: For production cron security
CRON_SECRET=optional-secret-for-cron-endpoint
```

**Generate a JWT_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 3: Set Up Database

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab → Select your Postgres database
4. Click **Query** tab
5. Copy the contents of `migrations/002_actual_schema.sql`
6. Paste and execute it

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link your project
vercel link

# Pull environment variables (includes database URL)
vercel env pull .env.local

# Run migration (requires psql installed)
psql $POSTGRES_URL < migrations/002_actual_schema.sql
```

### Option C: Using a Database Client

1. Get your Postgres connection string from Vercel dashboard
2. Connect using pgAdmin, DBeaver, TablePlus, or similar
3. Execute `migrations/002_actual_schema.sql`

## Step 4: Start Development Server

```bash
npm run dev
```

The app should start at `http://localhost:3000`

## Step 5: Test OAuth Signup Flow

### 5.1 Navigate to Connect Page

Open your browser and go to:
```
http://localhost:3000/connect
```

### 5.2 Connect TikTok Account

1. Click the **"Connect TikTok Account"** button
2. You'll be redirected to TikTok's authorization page
3. Log in and authorize the app
4. You'll be redirected back to `/connect?success=tiktok_connected`

### 5.3 Verify Connection

Check that:
- ✅ Success message appears on the connect page
- ✅ Your TikTok account shows in the list
- ✅ Database has encrypted tokens (check `tiktok_accounts` table)

**To check database:**
- Go to Vercel Dashboard → Storage → Postgres → Query tab
- Run: `SELECT id, username, "tiktokUserId", "connectedAt" FROM tiktok_accounts;`
- Verify tokens are encrypted (should be long JWT strings, not plain text)

## Step 6: Test Data Fetching

### 6.1 Manually Trigger Cron Job

Open a new terminal and run:

```bash
# Simple request (if CRON_SECRET not set)
curl http://localhost:3000/api/cron

# Or with authentication (if CRON_SECRET is set)
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron
```

### 6.2 Check the Response

You should see JSON like:
```json
{
  "message": "Cron job completed",
  "totalAccounts": 1,
  "processed": 1,
  "errors": 0,
  "errorsByAccount": []
}
```

### 6.3 Verify Data Was Saved

Check the `metrics` table:
```sql
SELECT * FROM metrics ORDER BY "recordedAt" DESC LIMIT 5;
```

You should see:
- `accountId` matching your TikTok account
- `followers` count
- `likes` (total from all videos)
- `videos` count
- `recordedAt` timestamp

### 6.4 Check Dashboard

1. Go to `http://localhost:3000` (main dashboard)
2. You should see your account with stats
3. Click on the account to see detailed metrics

## Step 7: Test Token Refresh (Optional)

To test automatic token refresh:

1. **Manually expire a token** (for testing):
   ```sql
   -- This simulates an expired token by corrupting it slightly
   -- In production, tokens expire naturally after their expiration time
   UPDATE tiktok_accounts 
   SET "accessToken" = 'expired-token-test' 
   WHERE username = 'your-username';
   ```

2. **Trigger cron again**:
   ```bash
   curl http://localhost:3000/api/cron
   ```

3. **Check logs** - you should see token refresh messages in the console

4. **Verify** - new encrypted tokens should be in database

## Troubleshooting

### Issue: "Missing required environment variables"

**Solution:** Make sure your `.env` file has:
- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `JWT_SECRET`

### Issue: Database connection errors

**Solution:** 
1. Verify `DATABASE_URL` is set in `.env` file
2. Check Supabase dashboard → Settings → Database for connection string
3. Make sure migration was run successfully (see `SUPABASE_SETUP.md`)
4. Verify connection string format is correct

### Issue: OAuth redirect fails

**Solution:**
1. Check `NEXT_PUBLIC_APP_URL` matches your current URL
2. Verify TikTok app redirect URI matches: `http://localhost:3000/api/auth/callback`
3. Check TikTok Developer Portal → Your App → OAuth Settings

### Issue: Cron job returns errors

**Solution:**
1. Check server logs in terminal running `npm run dev`
2. Verify tokens are encrypted properly in database
3. Check TikTok API rate limits (you might need to wait)
4. Verify TikTok app has correct scopes: `user.info.basic,video.list`

### Issue: No data in metrics table

**Solution:**
1. Check cron job response for errors
2. Verify TikTok account has videos (empty accounts won't have metrics)
3. Check server logs for API errors
4. Verify TikTok API credentials are correct

## Quick Test Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set (`.env` file)
- [ ] Database migration run (`002_actual_schema.sql`)
- [ ] Server running (`npm run dev`)
- [ ] Can access `/connect` page
- [ ] OAuth flow completes successfully
- [ ] Account appears in database (`tiktok_accounts` table)
- [ ] Tokens are encrypted (not plain text)
- [ ] Cron job runs successfully (`/api/cron`)
- [ ] Metrics saved to database (`metrics` table)
- [ ] Dashboard shows account with stats

## Next Steps

Once everything works locally:

1. **Deploy to Vercel:**
   ```bash
   vercel
   ```

2. **Set production environment variables** in Vercel dashboard

3. **Run migration on production database**

4. **Update TikTok app redirect URI** to production URL

5. **Test production OAuth flow**

6. **Verify cron job runs automatically** (check Vercel dashboard → Cron Jobs)

