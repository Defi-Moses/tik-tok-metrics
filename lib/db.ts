import postgres from 'postgres';
import type {
  User,
  DailySnapshot,
  CreateUserInput,
  UpdateUserInput,
  CreateDailySnapshotInput,
  UpdateDailySnapshotInput,
} from '@/types';

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres connection
// Supabase uses connection pooling, so we configure it appropriately
const sql = postgres(connectionString, {
  max: 1, // Use 1 connection for serverless environments
  idle_timeout: 20,
  connect_timeout: 10,
});

// Database connection helper
export async function query(text: string, params?: any[]) {
  try {
    const result = await sql.unsafe(text, params || []);
    return {
      rows: result,
      rowCount: result.length,
    };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// ==================== USER QUERIES ====================

/**
 * Get a user by TikTok user ID
 */
export async function getUserByTikTokId(tiktokUserId: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users
    WHERE tiktok_user_id = ${tiktokUserId}
    LIMIT 1
  `;
  return (result[0] as User) || null;
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  return (result[0] as User) || null;
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await sql`
    INSERT INTO users (
      tiktok_user_id,
      display_name,
      avatar_url,
      access_token,
      refresh_token,
      token_expires_at
    ) VALUES (
      ${input.tiktok_user_id},
      ${input.display_name ?? null},
      ${input.avatar_url ?? null},
      ${input.access_token},
      ${input.refresh_token},
      ${input.token_expires_at ?? null}
    )
    RETURNING *
  `;
  return result[0] as User;
}

/**
 * Update a user by ID
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.display_name !== undefined) {
    updates.push(`display_name = $${paramIndex++}`);
    values.push(input.display_name);
  }
  if (input.avatar_url !== undefined) {
    updates.push(`avatar_url = $${paramIndex++}`);
    values.push(input.avatar_url);
  }
  if (input.access_token !== undefined) {
    updates.push(`access_token = $${paramIndex++}`);
    values.push(input.access_token);
  }
  if (input.refresh_token !== undefined) {
    updates.push(`refresh_token = $${paramIndex++}`);
    values.push(input.refresh_token);
  }
  if (input.token_expires_at !== undefined) {
    updates.push(`token_expires_at = $${paramIndex++}`);
    values.push(input.token_expires_at);
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  const result = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return (result.rows[0] as unknown as User) || null;
}

/**
 * Delete a user by ID
 */
export async function deleteUser(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM users
    WHERE id = ${id}
  `;
  return result.length > 0;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  const result = await sql`
    SELECT * FROM users
    ORDER BY created_at DESC
  `;
  return result as unknown as User[];
}

// ==================== DAILY SNAPSHOT QUERIES ====================

/**
 * Get a daily snapshot by ID
 */
export async function getDailySnapshotById(id: string): Promise<DailySnapshot | null> {
  const result = await sql`
    SELECT * FROM daily_snapshots
    WHERE id = ${id}
    LIMIT 1
  `;
  return (result[0] as DailySnapshot) || null;
}

/**
 * Get daily snapshots for a user
 */
export async function getDailySnapshotsByUserId(
  userId: string,
  limit?: number,
  offset?: number
): Promise<DailySnapshot[]> {
  if (limit !== undefined && offset !== undefined) {
    const result = await sql`
      SELECT * FROM daily_snapshots
      WHERE user_id = ${userId}
      ORDER BY snapshot_date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    return result as unknown as DailySnapshot[];
  } else {
    const result = await sql`
      SELECT * FROM daily_snapshots
      WHERE user_id = ${userId}
      ORDER BY snapshot_date DESC
    `;
    return result as unknown as DailySnapshot[];
  }
}

/**
 * Get a daily snapshot by user ID and date
 */
export async function getDailySnapshotByUserAndDate(
  userId: string,
  snapshotDate: Date
): Promise<DailySnapshot | null> {
  const result = await sql`
    SELECT * FROM daily_snapshots
    WHERE user_id = ${userId}
      AND snapshot_date = ${snapshotDate}
    LIMIT 1
  `;
  return (result[0] as DailySnapshot) || null;
}

/**
 * Create a new daily snapshot
 */
export async function createDailySnapshot(
  input: CreateDailySnapshotInput
): Promise<DailySnapshot> {
  const result = await sql`
    INSERT INTO daily_snapshots (
      user_id,
      snapshot_date,
      follower_count,
      total_likes,
      total_views,
      total_comments,
      total_shares,
      video_count
    ) VALUES (
      ${input.user_id},
      ${input.snapshot_date},
      ${input.follower_count ?? 0},
      ${input.total_likes ?? 0},
      ${input.total_views ?? 0},
      ${input.total_comments ?? 0},
      ${input.total_shares ?? 0},
      ${input.video_count ?? 0}
    )
    RETURNING *
  `;
  return result[0] as DailySnapshot;
}

/**
 * Update a daily snapshot by ID
 */
export async function updateDailySnapshot(
  id: string,
  input: UpdateDailySnapshotInput
): Promise<DailySnapshot | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.follower_count !== undefined) {
    updates.push(`follower_count = $${paramIndex++}`);
    values.push(input.follower_count);
  }
  if (input.total_likes !== undefined) {
    updates.push(`total_likes = $${paramIndex++}`);
    values.push(input.total_likes);
  }
  if (input.total_views !== undefined) {
    updates.push(`total_views = $${paramIndex++}`);
    values.push(input.total_views);
  }
  if (input.total_comments !== undefined) {
    updates.push(`total_comments = $${paramIndex++}`);
    values.push(input.total_comments);
  }
  if (input.total_shares !== undefined) {
    updates.push(`total_shares = $${paramIndex++}`);
    values.push(input.total_shares);
  }
  if (input.video_count !== undefined) {
    updates.push(`video_count = $${paramIndex++}`);
    values.push(input.video_count);
  }

  if (updates.length === 0) {
    return getDailySnapshotById(id);
  }

  values.push(id);
  const result = await query(
    `UPDATE daily_snapshots SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return (result.rows[0] as unknown as DailySnapshot) || null;
}

/**
 * Upsert a daily snapshot (insert or update if exists)
 */
export async function upsertDailySnapshot(
  input: CreateDailySnapshotInput
): Promise<DailySnapshot> {
  const result = await sql`
    INSERT INTO daily_snapshots (
      user_id,
      snapshot_date,
      follower_count,
      total_likes,
      total_views,
      total_comments,
      total_shares,
      video_count
    ) VALUES (
      ${input.user_id},
      ${input.snapshot_date},
      ${input.follower_count ?? 0},
      ${input.total_likes ?? 0},
      ${input.total_views ?? 0},
      ${input.total_comments ?? 0},
      ${input.total_shares ?? 0},
      ${input.video_count ?? 0}
    )
    ON CONFLICT (user_id, snapshot_date)
    DO UPDATE SET
      follower_count = EXCLUDED.follower_count,
      total_likes = EXCLUDED.total_likes,
      total_views = EXCLUDED.total_views,
      total_comments = EXCLUDED.total_comments,
      total_shares = EXCLUDED.total_shares,
      video_count = EXCLUDED.video_count
    RETURNING *
  `;
  return result[0] as DailySnapshot;
}

/**
 * Delete a daily snapshot by ID
 */
export async function deleteDailySnapshot(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM daily_snapshots
    WHERE id = ${id}
  `;
  return result.length > 0;
}

/**
 * Get daily snapshots within a date range for a user
 */
export async function getDailySnapshotsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DailySnapshot[]> {
  const result = await sql`
    SELECT * FROM daily_snapshots
    WHERE user_id = ${userId}
      AND snapshot_date >= ${startDate}
      AND snapshot_date <= ${endDate}
    ORDER BY snapshot_date ASC
  `;
  return result as unknown as DailySnapshot[];
}

// Export sql for raw queries if needed
// Note: Use sql template literal for type-safe queries, or query() for parameterized queries
export { sql };
