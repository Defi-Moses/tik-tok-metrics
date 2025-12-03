# Supabase Setup Guide

This guide will help you set up Supabase as your database for the TikTok Metrics app.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: Your project name (e.g., "tik-tok-metrics")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

## Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection String**
3. Copy the **Connection pooling** URI (recommended for serverless) or **Direct connection** URI
4. It will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Set Environment Variable

Add the connection string to your `.env` file:

```bash
DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
```

**Important**: 
- Use **Connection pooling** URI for production/serverless (Vercel)
- Use **Direct connection** URI for local development
- Never commit your `.env` file to git!

## Step 4: Run Database Migration

### Option A: Using Supabase SQL Editor (Easiest)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of `migrations/002_actual_schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Option B: Using psql Command Line

```bash
# Install psql if needed (macOS)
brew install postgresql

# Run migration
psql "your-connection-string-here" < migrations/002_actual_schema.sql
```

### Option C: Using Database Client

1. Get connection details from Supabase Dashboard → Settings → Database
2. Connect using pgAdmin, DBeaver, TablePlus, or similar
3. Execute `migrations/002_actual_schema.sql`

## Step 5: Verify Tables Created

Run this query in Supabase SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'tiktok_accounts', 'metrics');
```

You should see all three tables listed.

## Step 6: Test Connection

Start your development server:

```bash
npm run dev
```

If everything is configured correctly, the app should start without database errors.

## Connection String Formats

### Connection Pooling (Recommended for Vercel/Serverless)
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Direct Connection (For Local Development)
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use different passwords** for development and production
3. **Use Connection Pooling** in production (better for serverless)
4. **Rotate passwords** periodically
5. **Use Row Level Security (RLS)** if you add user authentication later

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
- Make sure `.env` file exists in project root
- Verify `DATABASE_URL` is set correctly
- Restart your dev server after adding environment variables

### Error: "Connection refused" or "Connection timeout"
- Check your Supabase project is active (not paused)
- Verify connection string is correct
- Check if your IP needs to be whitelisted (Settings → Database → Connection Pooling)

### Error: "password authentication failed"
- Verify password in connection string matches your database password
- Reset password in Supabase Dashboard if needed

### Error: "relation does not exist"
- Run the migration file (`002_actual_schema.sql`)
- Verify tables were created using SQL Editor

## Production Setup

For production (Vercel):

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your Supabase connection string
3. Use **Connection Pooling** URI for better performance
4. Set environment for: Production, Preview, Development

## Next Steps

After setting up Supabase:
1. ✅ Database connection configured
2. ✅ Migration run successfully
3. ✅ Test OAuth flow (`/connect` page)
4. ✅ Test data fetching (`/api/cron` endpoint)

See `QUICKSTART.md` for testing instructions.

