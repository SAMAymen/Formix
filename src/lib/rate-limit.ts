import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Create Redis client if using Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiting options
const RATE_LIMIT_MAX = 10; // Maximum requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // Window size in ms (1 minute)

export async function rateLimit(request: NextRequest) {
  // Get client IP from headers instead of directly accessing 'ip'
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  
  const key = `rate-limit:${ip}`;
  
  try {
    // Get current count
    let count = await redis.get<number>(key) || 0;
    
    // Increment count
    count++;
    
    // Set with expiry
    if (count === 1) {
      await redis.set(key, count, { ex: RATE_LIMIT_WINDOW / 1000 });
    } else {
      await redis.incr(key);
    }
    
    // Set headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - count).toString());
    
    // If exceeded, return 429
    if (count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }
    
    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return NextResponse.next();
  }
}