import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForTokens, fetchUserInfo, RateLimitError, TokenExpiredError } from '@/lib/tiktok';
import { encrypt } from '@/lib/encryption';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cookieStore = await cookies();

  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors from TikTok
    if (error) {
      const errorDescription = searchParams.get('error_description') || error;
      console.error('TikTok OAuth error:', {
        error,
        error_description: errorDescription,
        error_code: searchParams.get('error_code'),
        log_id: searchParams.get('log_id'),
      });
      
      // Map specific TikTok errors to user-friendly messages
      let errorParam = 'oauth_denied';
      if (error === 'invalid_client_key' || errorDescription?.includes('client_key')) {
        errorParam = 'invalid_client_key';
      } else if (error === 'invalid_redirect_uri' || errorDescription?.includes('redirect_uri')) {
        errorParam = 'invalid_redirect_uri';
      }
      
      return NextResponse.redirect(
        new URL(`/connect?error=${errorParam}`, appUrl)
      );
    }

    // Verify code is present
    if (!code) {
      console.error('No authorization code received');
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
      tokenResponse = await exchangeCodeForTokens(code, codeVerifier);
    } catch (error) {
      console.error('Token exchange failure:', error);
      if (error instanceof RateLimitError) {
        return NextResponse.redirect(
          new URL('/connect?error=rate_limit', appUrl)
        );
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

    // Encrypt tokens
    const encryptedAccessToken = await encrypt({
      token: tokenResponse.access_token,
    });
    const encryptedRefreshToken = tokenResponse.refresh_token
      ? await encrypt({ token: tokenResponse.refresh_token })
      : null;

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

