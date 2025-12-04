// TikTok API integration utilities

// Types
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
}

export interface UserInfo {
  open_id: string;
  display_name: string;
  avatar_url: string;
  follower_count: number;
  likes_count: number;
}

export interface Video {
  id: string;
  create_time: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
}

export interface VideoListResponse {
  videos: Video[];
  cursor?: string;
  has_more: boolean;
}

export class TikTokAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TikTokAPIError';
  }
}

export class RateLimitError extends TikTokAPIError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    if (retryAfter) {
      this.message = `Rate limit exceeded. Retry after ${retryAfter} seconds.`;
    }
  }
}

export class TokenExpiredError extends TikTokAPIError {
  constructor() {
    super('Access token has expired', 401, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

// Environment variables
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!CLIENT_KEY || !CLIENT_SECRET || !APP_URL) {
  throw new Error(
    'Missing required environment variables: TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, or NEXT_PUBLIC_APP_URL'
  );
}

/**
 * Returns TikTok OAuth URL with proper scopes
 * @returns TikTok OAuth authorization URL
 */
export function getAuthorizationUrl(): string {
  const redirectUri = `${APP_URL}/api/auth/callback`;
  const scopes = 'user.info.basic,video.list';
  const state = Math.random().toString(36).substring(2, 15); // Simple state generation
  
  const params = new URLSearchParams({
    client_key: CLIENT_KEY!,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
    state: state,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

/**
 * Exchanges authorization code for access and refresh tokens
 * @param code - Authorization code from TikTok OAuth callback
 * @param codeVerifier - Code verifier from PKCE flow (required for PKCE)
 * @returns Token response with access_token, refresh_token, expires_in, and open_id
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  // Validate inputs
  if (!code || code.trim().length === 0) {
    throw new TikTokAPIError('Authorization code is required', 400, 'MISSING_CODE');
  }
  
  if (!codeVerifier || codeVerifier.trim().length === 0) {
    throw new TikTokAPIError('Code verifier is required for PKCE', 400, 'MISSING_CODE_VERIFIER');
  }
  
  if (!CLIENT_KEY || !CLIENT_SECRET) {
    throw new TikTokAPIError('TikTok client credentials are not configured', 500, 'MISSING_CREDENTIALS');
  }
  
  if (!APP_URL) {
    throw new TikTokAPIError('App URL is not configured', 500, 'MISSING_APP_URL');
  }
  
  const redirectUri = `${APP_URL}/api/auth/callback`;
  
  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    client_secret: CLIENT_SECRET,
    code: code.trim(),
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code_verifier: codeVerifier.trim(),
  });

  // Log request details (without sensitive data)
  console.log('Token exchange request:', {
    redirect_uri: redirectUri,
    client_key: CLIENT_KEY?.substring(0, 4) + '...',
    has_code: !!code,
    code_length: code?.length,
    has_code_verifier: !!codeVerifier,
    code_verifier_length: codeVerifier?.length,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  // Get response text first to handle both JSON and non-JSON responses
  const responseText = await response.text();
  let errorData: any;
  
  try {
    errorData = JSON.parse(responseText);
  } catch (e) {
    errorData = { error: 'Invalid JSON response', raw_response: responseText.substring(0, 500) };
  }

  if (!response.ok) {
    console.error('Token exchange failed:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      error_data: errorData,
      full_response: responseText.substring(0, 1000),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(retryAfter ? parseInt(retryAfter) : undefined);
    }
    
    // Extract error details from TikTok API response
    const errorMessage = errorData?.error?.message || 
                        errorData?.error_description || 
                        errorData?.error || 
                        errorData?.message ||
                        `HTTP ${response.status}: ${response.statusText}`;
    
    throw new TikTokAPIError(
      `Failed to exchange code for tokens: ${errorMessage}. Full response: ${JSON.stringify(errorData)}`,
      response.status,
      errorData?.error?.code || errorData?.error_code
    );
  }

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse token response JSON:', {
      response_text: responseText.substring(0, 500),
      error: e,
    });
    throw new TikTokAPIError(
      `Invalid JSON response from token endpoint: ${responseText.substring(0, 200)}`,
      response.status
    );
  }

  // Handle TikTok API response structure
  // Response can be: { data: { access_token, ... } } or { access_token, ... }
  const tokenData = data.data || data;
  
  if (!tokenData || !tokenData.access_token) {
    console.error('Unexpected token response structure:', {
      full_response: data,
      has_data: !!data.data,
      has_access_token: !!tokenData?.access_token,
    });
    throw new TikTokAPIError(
      `Unexpected token response structure: ${JSON.stringify(data)}`,
      response.status
    );
  }
  
  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    open_id: tokenData.open_id,
  };
}

/**
 * Refreshes an access token using a refresh token
 * @param refreshToken - Refresh token from previous authentication
 * @returns New token response with updated access_token, refresh_token, expires_in, and open_id
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: CLIENT_KEY!,
      client_secret: CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(retryAfter ? parseInt(retryAfter) : undefined);
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new TikTokAPIError(
      `Failed to refresh access token: ${JSON.stringify(error)}`,
      response.status
    );
  }

  const data = await response.json();
  
  return {
    access_token: data.data.access_token,
    refresh_token: data.data.refresh_token,
    expires_in: data.data.expires_in,
    open_id: data.data.open_id,
  };
}

/**
 * Fetches user information from TikTok API
 * @param accessToken - Valid access token
 * @returns User information including open_id, display_name, avatar_url, follower_count, and likes_count
 */
export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  // TikTok API v2 requires fields parameter to specify what data to return
  const params = new URLSearchParams({
    fields: 'open_id,display_name,avatar_url,follower_count,likes_count',
  });

  const response = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(retryAfter ? parseInt(retryAfter) : undefined);
    }
    if (response.status === 401) {
      throw new TokenExpiredError();
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('TikTok API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      error: error,
    });
    throw new TikTokAPIError(
      `Failed to fetch user info: ${JSON.stringify(error)}`,
      response.status
    );
  }

  const data = await response.json();
  
  // Handle TikTok API response structure
  // The response can be: { data: { user: {...} } } or { data: {...} }
  const user = data.data?.user || data.data;
  
  if (!user) {
    console.error('Unexpected TikTok API response structure:', data);
    throw new TikTokAPIError(
      `Unexpected response structure from TikTok API: ${JSON.stringify(data)}`,
      500
    );
  }
  
  return {
    open_id: user.open_id,
    display_name: user.display_name || user.displayName || '',
    avatar_url: user.avatar_url || user.avatarUrl || '',
    follower_count: user.follower_count || user.followerCount || 0,
    likes_count: user.likes_count || user.likesCount || 0,
  };
}

/**
 * Fetches user videos from TikTok API with pagination support
 * @param accessToken - Valid access token
 * @param cursor - Optional cursor for pagination
 * @returns Video list response with videos array, cursor, and has_more flag
 */
export async function fetchUserVideos(
  accessToken: string,
  cursor?: string
): Promise<VideoListResponse> {
  const params = new URLSearchParams({
    fields: 'id,create_time,view_count,like_count,comment_count,share_count',
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(
    `https://open.tiktokapis.com/v2/video/list/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(retryAfter ? parseInt(retryAfter) : undefined);
    }
    if (response.status === 401) {
      throw new TokenExpiredError();
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new TikTokAPIError(
      `Failed to fetch user videos: ${JSON.stringify(error)}`,
      response.status
    );
  }

  const data = await response.json();
  const videoList = data.data.videos || [];
  
  return {
    videos: videoList.map((video: any) => ({
      id: video.id,
      create_time: video.create_time,
      view_count: video.view_count,
      like_count: video.like_count,
      comment_count: video.comment_count,
      share_count: video.share_count,
    })),
    cursor: data.data.cursor,
    has_more: data.data.has_more || false,
  };
}
