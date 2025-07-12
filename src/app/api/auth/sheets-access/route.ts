import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // First check if the user is logged in
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    // Save the sheets-access request in session storage and redirect to login
    const url = new URL(req.url);
    const state = url.searchParams.get('state');
    
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?callbackUrl=${encodeURIComponent('/api/auth/sheets-access')}${state ? `&state=${state}` : ''}`);
  }
  
  // Parse state parameter if present
  let returnPath = '/';
  let reauthorization = false;
  const url = new URL(req.url);
  const state = url.searchParams.get('state');
  const loginHint = url.searchParams.get('login_hint'); // Extract login_hint parameter
  
  try {
    if (state) {
      const parsedState = JSON.parse(decodeURIComponent(state));
      returnPath = parsedState.returnPath || '/';
      reauthorization = parsedState.reauthorization || false;
    }
  } catch (e) {
    console.error('Error parsing state:', e);
  }

  // Check if the user has an existing Google account to pass along
  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google"
    },
    select: {
      scope: true
    }
  });

  // Construct OAuth URL with necessary drive and sheets scopes
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    // 'https://www.googleapis.com/auth/spreadsheets'
  ];

  // Add existing scopes to preserve them
  if (existingAccount?.scope) {
    const existingScopes = existingAccount.scope.split(' ');
    for (const scope of existingScopes) {
      if (!scopes.includes(scope) && !scope.includes('spreadsheets') && !scope.includes('drive')) {
        scopes.push(scope);
      }
    }
  }

  // Force refresh when reauthorizing
  const promptParam = reauthorization ? 'consent' : existingAccount ? 'consent' : 'consent';

  // Update the state parameter with reauthorization info
  const newState = encodeURIComponent(JSON.stringify({
    returnPath,
    reauthorization
  }));

  // Build OAuth URL with all required parameters
  const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  oauthUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID!);
  oauthUrl.searchParams.append('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/sheets-callback`);
  oauthUrl.searchParams.append('response_type', 'code');
  oauthUrl.searchParams.append('scope', scopes.join(' '));
  oauthUrl.searchParams.append('access_type', 'offline');
  oauthUrl.searchParams.append('prompt', promptParam);
  oauthUrl.searchParams.append('state', newState);
  oauthUrl.searchParams.append('include_granted_scopes', 'true');
  
  // Add login_hint if provided to skip account selection
  if (loginHint) {
    oauthUrl.searchParams.append('login_hint', loginHint);
  }
  
  return NextResponse.redirect(oauthUrl.toString());
}