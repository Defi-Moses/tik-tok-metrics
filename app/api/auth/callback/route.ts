import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForTokens, fetchUserInfo, RateLimitError, TokenExpiredError } from '@/lib/tiktok';
import { encrypt } from '@/lib/encryption';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Shared handler for OAuth callback processing
 * Handles both GET (standard OAuth redirect) and POST (some OAuth implementations)
 */
async function handleOAuthCallback(searchParams: URLSearchParams, requestUrl: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cookieStore = await cookies();

  try {
    // Extract query parameters per TikTok documentation
    // Documentation: https://developers.tiktok.com/doc/login-kit-web
    const code = searchParams.get('code'); // Authorization code
    const scopes = searchParams.get('scopes'); // Comma-separated scopes granted (note: plural in callback)
    const state = searchParams.get('state'); // CSRF state token
    const error = searchParams.get('error'); // Error code if authorization failed
    const errorDescription = searchParams.get('error_description'); // Human-readable error description

    // Log all query parameters for debugging
    const allParams = Object.fromEntries(searchParams.entries());
    console.log('OAuth callback received:', {
      url: requestUrl,
      params: allParams,
      hasCode: !!code,
      hasScopes: !!scopes,
      scopes: scopes,
      hasError: !!error,
      hasState: !!state,
    });

    // Handle OAuth errors from TikTok per documentation
    if (error) {
      const errorDesc = errorDescription || error;
      const errorCode = searchParams.get('error_code');
      const logId = searchParams.get('log_id');
      
      console.error('TikTok OAuth error:', {
        error,
        error_description: errorDesc,
        error_code: errorCode,
        log_id: logId,
        all_params: allParams,
      });
      
      // Map specific TikTok errors to user-friendly messages
      let errorParam = 'oauth_denied';
      if (error === 'invalid_client_key' || errorDesc?.includes('client_key')) {
        errorParam = 'invalid_client_key';
      } else if (error === 'invalid_redirect_uri' || errorDesc?.includes('redirect_uri')) {
        errorParam = 'invalid_redirect_uri';
      }
      
      return NextResponse.redirect(
        new URL(`/connect?error=${errorParam}`, appUrl)
      );
    }

    // Verify code is present
    if (!code) {
      // Check if we have any parameters at all - if not, might be redirect URI mismatch
      const hasAnyParams = searchParams.toString().length > 0;
      
      // Check for stored state and code verifier to help diagnose
      const storedState = cookieStore.get('tiktok_oauth_state')?.value;
      const storedCodeVerifier = cookieStore.get('tiktok_oauth_code_verifier')?.value;
      
      console.error('No authorization code received. Full callback details:', {
        url: requestUrl,
        all_params: allParams,
        search_params_string: searchParams.toString(),
        has_any_params: hasAnyParams,
        expected_redirect_uri: `${appUrl}/api/auth/callback`,
        received_state: state,
        stored_state: storedState,
        state_matches: state === storedState,
        has_stored_code_verifier: !!storedCodeVerifier,
      });
      
      // If no parameters at all, likely redirect URI mismatch
      if (!hasAnyParams) {
        console.error('No query parameters received - likely redirect URI mismatch');
        return NextResponse.redirect(
          new URL('/connect?error=invalid_redirect_uri', appUrl)
        );
      }
      
      // If we have an error parameter, it was already handled above
      // Otherwise, no code means authorization was cancelled or failed silently
      return NextResponse.redirect(
        new URL('/connect?error=no_code', appUrl)
      );
    }

    // Verify CSRF state
    const storedState = cookieStore.get('tiktok_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      console.error('Invalid CSRF state:', { storedState, receivedState: state });
      return NextResponse.redirect(
        new URL('/connect?error=invalid_state', appUrl)
      );
    }

    // Clear the state cookie
    cookieStore.delete('tiktok_oauth_state');

    // Get code verifier from cookie (required for PKCE)
    const codeVerifier = cookieStore.get('tiktok_oauth_code_verifier')?.value;
    if (!codeVerifier) {
      console.error('Code verifier not found in cookies');
      return NextResponse.redirect(
        new URL('/connect?error=invalid_state', appUrl)
      );
    }

    // Clear the code verifier cookie after retrieving it
    cookieStore.delete('tiktok_oauth_code_verifier');

    // Exchange code for tokens
    let tokenResponse;
    try {
      console.log('Attempting token exchange:', {
        code_length: code.length,
        code_preview: code.substring(0, 20) + '...',
        has_code_verifier: !!codeVerifier,
        code_verifier_length: codeVerifier?.length,
      });
      tokenResponse = await exchangeCodeForTokens(code, codeVerifier);
      console.log('Token exchange successful:', {
        has_access_token: !!tokenResponse.access_token,
        has_refresh_token: !!tokenResponse.refresh_token,
        open_id: tokenResponse.open_id,
      });
    } catch (error) {
      console.error('Token exchange failure:', {
        error: error instanceof Error ? error.message : String(error),
        error_name: error instanceof Error ? error.name : typeof error,
        error_stack: error instanceof Error ? error.stack : undefined,
        code_length: code?.length,
        has_code_verifier: !!codeVerifier,
      });
      if (error instanceof RateLimitError) {
        return NextResponse.redirect(
          new URL('/connect?error=rate_limit', appUrl)
        );
      }
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Full error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      return NextResponse.redirect(
        new URL('/connect?error=token_exchange_failed', appUrl)
      );
    }

    // Fetch user info from TikTok
    let tiktokUserInfo;
    try {
      tiktokUserInfo = await fetchUserInfo(tokenResponse.access_token);
    } catch (error) {
      console.error('Failed to fetch TikTok user info:', error);
      if (error instanceof RateLimitError) {
        return NextResponse.redirect(
          new URL('/connect?error=rate_limit', appUrl)
        );
      }
      if (error instanceof TokenExpiredError) {
        return NextResponse.redirect(
          new URL('/connect?error=token_expired', appUrl)
        );
      }
      return NextResponse.redirect(
        new URL('/connect?error=user_fetch_failed', appUrl)
      );
    }

    // Validate token response
    if (!tokenResponse.access_token) {
      console.error('Token exchange returned no access token:', tokenResponse);
      return NextResponse.redirect(
        new URL('/connect?error=token_exchange_failed', appUrl)
      );
    }

    if (!tokenResponse.refresh_token) {
      console.warn('Token exchange returned no refresh token. Token refresh will not be possible.', {
        has_access_token: !!tokenResponse.access_token,
        expires_in: tokenResponse.expires_in,
        open_id: tokenResponse.open_id,
      });
    }

    // Encrypt tokens
    const encryptedAccessToken = await encrypt({
      token: tokenResponse.access_token,
    });
    const encryptedRefreshToken = tokenResponse.refresh_token
      ? await encrypt({ token: tokenResponse.refresh_token })
      : null;

    console.log('Tokens encrypted and ready to store:', {
      has_access_token: !!encryptedAccessToken,
      has_refresh_token: !!encryptedRefreshToken,
      expires_in: tokenResponse.expires_in,
      open_id: tokenResponse.open_id,
    });

    // Upsert user in database
    try {
      // First, check if TikTok account exists
      const existingAccount = await query(
        `SELECT id, "userId" FROM tiktok_accounts WHERE "tiktokUserId" = $1`,
        [tokenResponse.open_id]
      );

      if (existingAccount.rows.length > 0) {
        // Update existing account
        await query(
          `UPDATE tiktok_accounts 
           SET "accessToken" = $1, 
               "refreshToken" = $2,
               username = $3,
               "connectedAt" = NOW()
           WHERE "tiktokUserId" = $4`,
          [
            encryptedAccessToken,
            encryptedRefreshToken,
            tiktokUserInfo.display_name,
            tokenResponse.open_id,
          ]
        );
      } else {
        // Create new user and account
        // Note: In a real app, you might want to link to an existing user session
        // For now, we'll create a new user entry
        const userResult = await query(
          `INSERT INTO users (email, "createdAt", "updatedAt")
           VALUES ($1, NOW(), NOW())
           ON CONFLICT (email) DO UPDATE SET "updatedAt" = NOW()
           RETURNING id`,
          [`${tokenResponse.open_id}@tiktok.local`]
        );

        const userId = userResult.rows[0].id;

        await query(
          `INSERT INTO tiktok_accounts 
           ("userId", "tiktokUserId", username, "accessToken", "refreshToken", "connectedAt")
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT ("tiktokUserId") DO UPDATE SET
             "accessToken" = EXCLUDED."accessToken",
             "refreshToken" = EXCLUDED."refreshToken",
             username = EXCLUDED.username,
             "connectedAt" = NOW()`,
          [
            userId,
            tokenResponse.open_id,
            tiktokUserInfo.display_name,
            encryptedAccessToken,
            encryptedRefreshToken,
          ]
        );
      }
    } catch (dbError) {
      console.error('Database error during user upsert:', dbError);
      return NextResponse.redirect(
        new URL('/connect?error=database_error', appUrl)
      );
    }

    // Redirect to connect page with success message
    return NextResponse.redirect(
      new URL('/connect?success=tiktok_connected', appUrl)
    );
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/connect?error=unexpected_error', appUrl)
    );
  }
}

export async function GET(request: NextRequest) {
  return handleOAuthCallback(request.nextUrl.searchParams, request.nextUrl.toString());
}

export async function POST(request: NextRequest) {
  // Handle POST requests (some OAuth implementations use POST for callback)
  // Extract parameters from either query string or form data
  const contentType = request.headers.get('content-type') || '';
  
  let searchParams: URLSearchParams;
  
  if (contentType.includes('application/x-www-form-urlencoded')) {
    // Parse form data
    const formData = await request.formData();
    searchParams = new URLSearchParams();
    // Convert iterator to array to avoid TypeScript compilation issues
    const formDataEntries = Array.from(formData.entries());
    for (const [key, value] of formDataEntries) {
      searchParams.set(key, value.toString());
    }
    // Also merge query params if any
    request.nextUrl.searchParams.forEach((value, key) => {
      if (!searchParams.has(key)) {
        searchParams.set(key, value);
      }
    });
  } else {
    // Use query params (fallback)
    searchParams = request.nextUrl.searchParams;
  }
  
  return handleOAuthCallback(searchParams, request.nextUrl.toString());
}

