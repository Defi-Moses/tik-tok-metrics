import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * TikTok OAuth Authorization Endpoint
 * 
 * Following official TikTok Login Kit for Web documentation:
 * https://developers.tiktok.com/doc/login-kit-web
 * 
 * This endpoint initiates the OAuth 2.0 authorization flow by:
 * 1. Generating a CSRF state token
 * 2. Generating PKCE code verifier and challenge (security enhancement)
 * 3. Redirecting user to TikTok's authorization page
 */

/**
 * Generate a cryptographically random code verifier for PKCE
 * Must be 43-128 characters long, using unreserved characters
 */
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate code challenge from code verifier using S256 method
 * This is a base64url-encoded SHA256 hash of the code verifier
 */
function generateCodeChallenge(codeVerifier: string): string {
  return crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
}

export async function GET(request: NextRequest) {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!clientKey) {
      console.error('TikTok client key not configured');
      return NextResponse.redirect(
        new URL('/connect?error=configuration_error', appUrl)
      );
    }

    // Generate CSRF state token
    // Following TikTok docs: "a randomly generated alphanumeric string constructed using a random-number generator"
    // Using crypto.randomBytes for better security than Math.random()
    const state = crypto.randomBytes(32).toString('hex');

    // Generate PKCE code verifier and challenge (security best practice)
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Store state and code verifier in cookies (httpOnly, secure in production)
    const cookieStore = await cookies();
    cookieStore.set('tiktok_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });
    
    cookieStore.set('tiktok_oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    // Build TikTok authorization URL following official documentation
    // URL: https://www.tiktok.com/v2/auth/authorize/
    // Parameters must be in application/x-www-form-urlencoded format
    const redirectUri = `${appUrl}/api/auth/callback`;
    const scope = 'user.info.basic,video.list';
    const responseType = 'code';

    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    
    // Required parameters per documentation
    authUrl.searchParams.set('client_key', clientKey);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('response_type', responseType);
    authUrl.searchParams.set('state', state);
    
    // PKCE parameters (security enhancement)
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    
    // Optional parameter: disable_auto_auth (0 = skip auth page for valid sessions, 1 = always show)
    // Not setting this to use default behavior

    // Log authorization URL for debugging (without sensitive data)
    console.log('Redirecting to TikTok OAuth:', {
      redirect_uri: redirectUri,
      client_key: clientKey.substring(0, 4) + '...',
      has_state: !!state,
      has_code_challenge: !!codeChallenge,
      full_url: authUrl.toString(),
    });

    // Redirect to TikTok authorization page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error initiating TikTok OAuth:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      new URL('/connect?error=oauth_init_failed', appUrl)
    );
  }
}

