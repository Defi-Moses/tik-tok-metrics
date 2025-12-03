# Database Migrations

This directory contains SQL migration files for setting up the database schema.

## Running Migrations

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of `002_actual_schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

See `SUPABASE_SETUP.md` for detailed Supabase setup instructions.

### Option 2: Using psql Command Line

```bash
# Run migration with your connection string
psql "your-database-connection-string" < migrations/002_actual_schema.sql
```

### Option 3: Using a Database Client

1. Connect to your database using your preferred client (e.g., pgAdmin, DBeaver, TablePlus)
2. Execute the SQL file `002_actual_schema.sql`

## Migration Files

- `001_initial_schema.sql` - Legacy schema (not used by current codebase)
- `002_actual_schema.sql` - **Use this one!** Creates the actual schema with `users`, `tiktok_accounts`, and `metrics` tables

## Schema Overview

### users
Stores user accounts with email addresses.

### tiktok_accounts
Stores TikTok account connections with encrypted access and refresh tokens.

### metrics
Stores daily metrics snapshots for each TikTok account. Includes follower count, likes, videos, and recorded timestamp.

