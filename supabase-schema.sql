-- TikTok Metrics App - Database Schema
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tiktok_accounts table
CREATE TABLE IF NOT EXISTS tiktok_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "tiktokUserId" VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255),
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "connectedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create metrics table (snapshots)
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "accountId" UUID NOT NULL REFERENCES tiktok_accounts(id) ON DELETE CASCADE,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  likes BIGINT DEFAULT 0,
  videos INTEGER DEFAULT 0,
  "recordedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tiktok_accounts_user_id ON tiktok_accounts("userId");
CREATE INDEX IF NOT EXISTS idx_tiktok_accounts_tiktok_user_id ON tiktok_accounts("tiktokUserId");
CREATE INDEX IF NOT EXISTS idx_metrics_account_id ON metrics("accountId");
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON metrics("recordedAt");

-- Create immutable function for date extraction (required for index)
CREATE OR REPLACE FUNCTION immutable_date(timestamptz)
RETURNS DATE AS $$
  SELECT ($1 AT TIME ZONE 'UTC')::DATE;
$$ LANGUAGE SQL IMMUTABLE;

-- Create unique index for one metric per account per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_account_date_unique
ON metrics("accountId", immutable_date("recordedAt"));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

