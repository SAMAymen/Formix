import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  let returnPath = '/';
  let reauthorization = false;
  
  // Parse state parameter
  try {
    if (state) {
      const parsedState = JSON.parse(decodeURIComponent(state));
      returnPath = parsedState.returnPath || '/';
      reauthorization = parsedState.reauthorization || false;
    }
  } catch (e) {
    console.error('Error parsing state:', e);
  }
  
  // Handle authorization errors
  if (error) {
    console.error('Google auth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${returnPath}?error=sheets_auth_failed`);
  }
  
  // Get user session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?callbackUrl=${encodeURIComponent(returnPath)}`);
  }

  // If we have a code, exchange it for tokens
  if (code) {
    try {
      // Exchange code for tokens using the Google token endpoint
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/sheets-callback`,
        }),
      });

      const tokens = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokens.error}`);
      }

      // Update the account with new tokens
      const account = await prisma.account.findFirst({
        where: { userId: session.user.id, provider: 'google' }
      });

      if (account) {
        await prisma.account.update({
          where: { id: account.id },
          data: {
            access_token: tokens.access_token,
            expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
            refresh_token: tokens.refresh_token || account.refresh_token,
            scope: tokens.scope || account.scope,
          },
        });
      }

      // At the end, redirect with a flag for reauthorization if needed:
      const redirectUrl = `${process.env.NEXTAUTH_URL}${returnPath}?sheetsAuth=success${reauthorization ? '&reauth=true' : ''}`;
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error('Token exchange error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${returnPath}?error=token_exchange_failed`);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${returnPath}?error=invalid_request`);
}