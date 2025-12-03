# Supabase Quick Setup

## Step 1: Copy the SQL Script

Open `supabase-schema.sql` and copy the entire contents.

## Step 2: Run in Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query** button
4. Paste the entire SQL script
5. Click **Run** (or press `Cmd/Ctrl + Enter`)

## Step 3: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'tiktok_accounts', 'metrics')
ORDER BY table_name;
```

You should see all three tables:
- `users`
- `tiktok_accounts`
- `metrics`

## Step 4: Add Connection String to .env

1. In Supabase Dashboard → **Settings** → **Database**
2. Copy your **Connection string** (use Connection Pooling for production)
3. Add to `.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## Done! ✅

Your database is ready. Start your app with `npm run dev` and test the OAuth flow.

