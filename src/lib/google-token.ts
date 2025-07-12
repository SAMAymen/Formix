// lib/google-token.ts

import { prisma } from '@/lib/prisma';

/**
 * Custom error class for authentication issues
 */
export class GoogleAuthError extends Error {
  public requiresReauth: boolean;
  
  constructor(message: string, requiresReauth = false) {
    super(message);
    this.name = 'GoogleAuthError';
    this.requiresReauth = requiresReauth;
  }
}

/**
 * Refreshes a Google OAuth token
 */
export async function refreshGoogleToken(account: any) {
  try {
    // Direct token refresh using Google's token endpoint
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: account.refresh_token,
        grant_type: 'refresh_token'
      })
    });

    // Get response as text first to properly parse errors
    const responseText = await refreshResponse.text();
    let refreshData;
    
    try {
      refreshData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse token response:', responseText);
      throw new GoogleAuthError('Invalid response from authentication server', false);
    }

    // Check for specific errors in the response
    if (!refreshResponse.ok) {
      console.error('Token refresh API error:', refreshData);
      
      // Check for specific error conditions that require reauthorization
      if (
        refreshData.error === 'invalid_grant' || 
        refreshData.error_description?.includes('Token has been expired or revoked')
      ) {
        // This indicates the refresh token itself is invalid
        throw new GoogleAuthError('Google refresh token expired or revoked', true);
      }
      
      throw new GoogleAuthError(`Failed to refresh token: ${refreshData.error_description || refreshData.error}`, false);
    }

    // Log the actual expires_in value from Google
    console.log('Token refresh response expires_in:', refreshData.expires_in);

    // Success: Update the database with new token and add a buffer time
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: refreshData.access_token,
        expires_at: Math.floor(Date.now() / 1000) + (refreshData.expires_in - 300) // 5 minute buffer
      }
    });

    console.log('Token refreshed successfully. Expires in', refreshData.expires_in, 'seconds');
    
    return {
      access_token: refreshData.access_token,
      refresh_token: account.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + refreshData.expires_in
    };
  } catch (error: any) {
    console.error('Token refresh failed:', error);
    
    // Rethrow custom auth errors so they bubble up properly
    if (error instanceof GoogleAuthError) {
      throw error;
    }
    
    // For other errors, wrap in our custom error type
    throw new GoogleAuthError(
      error.message || 'Google authentication error',
      error.message?.includes('expired') || error.message?.includes('revoked')
    );
  }
}

/**
 * Gets a valid Google token, refreshing if necessary
 */
export async function getValidGoogleToken(userId: string) {
  try {
    // Find user's Google account
    const account = await prisma.account.findFirst({
      where: { 
        userId: userId, 
        provider: 'google' 
      }
    });

    if (!account || !account.refresh_token) {
      throw new GoogleAuthError('No Google account connected or missing refresh token', true);
    }

    // Log token status
    console.log('Token status:', {
      hasAccessToken: !!account.access_token,
      expiresAt: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : 'none',
      currentTime: new Date().toISOString(),
      isExpiredOrClose: !account.expires_at || 
        Date.now() > (account.expires_at * 1000 - 15 * 60 * 1000) // 15 minutes buffer
    });

    // Check if token is expired or will expire soon
    const isTokenExpiredOrClose = !account.expires_at || 
      Date.now() > (account.expires_at * 1000 - 15 * 60 * 1000); // 15 minutes buffer

    if (isTokenExpiredOrClose) {
      console.log('Token expired or expires soon, refreshing...');
      // Attempt to refresh token
      const refreshedToken = await refreshGoogleToken(account);
      return refreshedToken;
    }

    return {
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expires_at: account.expires_at
    };
  } catch (error: any) {
    // Rethrow GoogleAuthError instances
    if (error instanceof GoogleAuthError) {
      throw error;
    }
    
    // Wrap other errors
    throw new GoogleAuthError(error.message || 'Failed to get valid Google token', false);
  }
}

/**
 * Creates a configured Google OAuth2 client with valid tokens
 */
export async function getGoogleAuthClient(userId: string) {
  try {
    const { google } = await import('googleapis');
    
    // Get valid tokens
    const tokens = await getValidGoogleToken(userId);
    
    // Create OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.NEXTAUTH_URL + "/api/auth/callback/google"
    );
    
    // Set credentials
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at ? tokens.expires_at * 1000 : undefined
    });
    
    return oauth2Client;
  } catch (error: any) {
    if (error instanceof GoogleAuthError) {
      throw error;
    }
    throw new GoogleAuthError(error.message || 'Failed to initialize Google client', false);
  }
}