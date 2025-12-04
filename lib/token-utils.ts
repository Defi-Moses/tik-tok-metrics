// Token utility functions for decrypting and refreshing TikTok tokens

import { decrypt } from './encryption';
import { refreshAccessToken, TokenExpiredError } from './tiktok';
import { encrypt } from './encryption';
import { query } from './db';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accountId: string;
}

/**
 * Gets and decrypts a TikTok access token for an account
 * @param accountId - The TikTok account ID
 * @returns Decrypted access token and refresh token
 */
export async function getDecryptedTokens(accountId: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  // Get account with encrypted tokens
  const accountResult = await query(
    `SELECT "accessToken", "refreshToken" FROM tiktok_accounts WHERE id = $1`,
    [accountId]
  );

  if (accountResult.rows.length === 0) {
    throw new Error(`Account ${accountId} not found`);
  }

  const encryptedAccessToken = accountResult.rows[0].accessToken;
  const encryptedRefreshToken = accountResult.rows[0].refreshToken;

  if (!encryptedAccessToken || !encryptedRefreshToken) {
    throw new Error(`Account ${accountId} has no tokens`);
  }

  // Decrypt tokens
  try {
    const accessTokenPayload = await decrypt(encryptedAccessToken);
    const refreshTokenPayload = await decrypt(encryptedRefreshToken);

    return {
      accessToken: accessTokenPayload.token,
      refreshToken: refreshTokenPayload.token,
    };
  } catch (error) {
    console.error(`Failed to decrypt tokens for account ${accountId}:`, error);
    throw new Error(`Failed to decrypt tokens for account ${accountId}`);
  }
}

/**
 * Gets a valid access token, refreshing if expired
 * This should be called when an API request fails with TokenExpiredError
 * @param accountId - The TikTok account ID
 * @param refreshToken - The refresh token
 * @returns New access token
 */
export async function refreshTokenForAccount(
  accountId: string,
  refreshToken: string
): Promise<string> {
  try {
    console.log(`Attempting to refresh token for account ${accountId}`);
    const tokenResponse = await refreshAccessToken(refreshToken);

    // Encrypt new tokens
    const encryptedAccessToken = await encrypt({
      token: tokenResponse.access_token,
    });
    const encryptedRefreshToken = await encrypt({
      token: tokenResponse.refresh_token,
    });

    // Update database with new tokens
    await query(
      `UPDATE tiktok_accounts 
       SET "accessToken" = $1, "refreshToken" = $2
       WHERE id = $3`,
      [encryptedAccessToken, encryptedRefreshToken, accountId]
    );

    console.log(`Successfully refreshed token for account ${accountId}`, {
      expires_in: tokenResponse.expires_in,
      has_new_refresh_token: !!tokenResponse.refresh_token,
    });
    return tokenResponse.access_token;
  } catch (error) {
    console.error(`Failed to refresh token for account ${accountId}:`, {
      error: error instanceof Error ? error.message : String(error),
      error_name: error instanceof Error ? error.name : typeof error,
      error_stack: error instanceof Error ? error.stack : undefined,
      account_id: accountId,
      has_refresh_token: !!refreshToken,
    });
    
    // Provide more specific error message
    if (error instanceof Error) {
      if (error.message.includes('invalid') || error.message.includes('expired')) {
        throw new Error(`Refresh token is invalid or expired for account ${accountId}. Please reconnect your account.`);
      }
      throw new Error(`Failed to refresh token for account ${accountId}: ${error.message}`);
    }
    throw new Error(`Failed to refresh token for account ${accountId}`);
  }
}

/**
 * Gets a valid access token for an account, automatically refreshing if needed
 * This function will attempt to use the current token, and if it's expired,
 * it will automatically refresh it using the refresh token.
 * @param accountId - The TikTok account ID
 * @returns Valid access token
 */
export async function getValidAccessToken(accountId: string): Promise<string> {
  const { accessToken, refreshToken } = await getDecryptedTokens(accountId);
  
  // For now, just return the access token
  // The calling code should handle TokenExpiredError and call refreshTokenForAccount
  // In the future, we could add token expiration checking here
  return accessToken;
}


/**
 * Gets all TikTok accounts that need data fetching
 * @returns Array of account IDs
 */
export async function getAllTikTokAccounts(): Promise<
  Array<{ id: string; tiktokUserId: string; username: string }>
> {
  const result = await query(
    `SELECT id, "tiktokUserId", username 
     FROM tiktok_accounts 
     WHERE "accessToken" IS NOT NULL AND "refreshToken" IS NOT NULL
     ORDER BY "connectedAt" DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    tiktokUserId: row.tiktokUserId,
    username: row.username,
  }));
}

