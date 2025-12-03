// Shared types for the application

export interface User {
  id: string;
  tiktok_user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  access_token: string; // encrypted
  refresh_token: string; // encrypted
  token_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DailySnapshot {
  id: string;
  user_id: string;
  snapshot_date: Date;
  follower_count: number;
  total_likes: number;
  total_views: number;
  total_comments: number;
  total_shares: number;
  video_count: number;
  created_at: Date;
}

export interface CreateUserInput {
  tiktok_user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  access_token: string;
  refresh_token: string;
  token_expires_at?: Date | null;
}

export interface UpdateUserInput {
  display_name?: string | null;
  avatar_url?: string | null;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date | null;
}

export interface CreateDailySnapshotInput {
  user_id: string;
  snapshot_date: Date;
  follower_count?: number;
  total_likes?: number;
  total_views?: number;
  total_comments?: number;
  total_shares?: number;
  video_count?: number;
}

export interface UpdateDailySnapshotInput {
  follower_count?: number;
  total_likes?: number;
  total_views?: number;
  total_comments?: number;
  total_shares?: number;
  video_count?: number;
}

