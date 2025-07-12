import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { rateLimit } from './lib/rate-limit';

// Helper function to handle CORS
function handleCORS(request: NextRequest, response = NextResponse.next()) {
  // Instead of allowing any origin, use a whitelist approach
  const allowedOrigins =process.env.NEXTAUTH_URL
    ? [process.env.NEXTAUTH_URL]
    : ['https://tryformix.vercel.app'];

  const origin = request.headers.get('origin');
  const isAllowed = !origin || allowedOrigins.includes(origin) || 
                    process.env.NODE_ENV === 'development';
  
  // Add CORS headers with more restrictive settings
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowed ? origin || '*' : process.env.NEXTAUTH_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Location',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };
  
  // Add headers to response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Handle double slash in URL path
  if (request.nextUrl.pathname.includes('//')) {
    const correctedPath = request.nextUrl.pathname.replace(/\/+/g, '/');
    const url = new URL(correctedPath, request.url);
    
    const redirectResponse = NextResponse.redirect(url);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      redirectResponse.headers.set(key, value);
    });
    
    return redirectResponse;
  }
  
  // Handle OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: response.headers,
    });
  }
  
  // Add security headers
  return addSecurityHeaders(response);
}

function addSecurityHeaders(response: NextResponse) {
  // Determine the base URL of the application
  const baseUrl = process.env.NEXTAUTH_URL || 'https://tryformix.vercel.app';
  
  // Content Security Policy as a single line with no line breaks
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googleusercontent.com; connect-src 'self' https://apis.google.com https://accounts.google.com " + baseUrl + " https://*.vercel.app; frame-src 'self' https://accounts.google.com; font-src 'self' data: http://localhost:3000 https://*.vercel.app;"
  );
  
  // Additional security headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

// Main middleware function that handles both auth and non-auth routes
async function middleware(request: NextRequest) {
  // Exclude NextAuth routes from additional processing
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // Apply rate limiting for submission endpoints
  if (request.nextUrl.pathname.startsWith('/api/submit')) {
    try {
      const rateLimitResponse = await rateLimit(request);
      if (rateLimitResponse.status === 429) {
        return rateLimitResponse;
      }
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Continue with the request if rate limiting fails
    }
  }
  
  // Apply CORS and security headers
  return handleCORS(request);
}

// Export the middleware function wrapped with auth for protected routes
const authMiddleware = withAuth(
  // For routes that need authentication
  function authProtected(request) {
    return handleCORS(request);
  },
  {
    // Auth config options here
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login',
    }
  }
);

// Export configuration for both auth and non-auth routes
export const config = {
  matcher: [
    // CORS routes (explicitly exclude auth routes)
    '/api/((?!auth/).)*',
    '/client.js',
    
    // Auth protected routes
    "/dashboard/:path*",
    "/settings/:path*",
    
    // General protection excluding specific paths
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};

// Export the correct functions
export { middleware };
export default authMiddleware;