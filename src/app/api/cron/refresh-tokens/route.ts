import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Check for cron authentication header
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  
  if (!authHeader || `Bearer ${expectedToken}` !== authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Find accounts with refresh tokens that might need refreshing
    const accounts = await prisma.account.findMany({
      where: {
        provider: 'google',
        refresh_token: { not: null },
        // Tokens expiring in the next day
        expires_at: {
          lt: Math.floor(Date.now() / 1000) + 86400
        }
      },
      select: {
        id: true,
        refresh_token: true,
        providerAccountId: true
      }
    });
    
    const results = await Promise.allSettled(
      accounts.map(async (account) => {
        try {
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              refresh_token: account.refresh_token!,
              grant_type: 'refresh_token'
            })
          });
          
          const data = await response.json();
          
          if (response.ok && data.access_token) {
            // Update token in database
            await prisma.account.update({
              where: { id: account.id },
              data: {
                access_token: data.access_token,
                expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600)
              }
            });
            return { id: account.id, success: true };
          } else {
            return { id: account.id, success: false, error: data.error };
          }
        } catch (error) {
          return { id: account.id, success: false, error };
        }
      })
    );
    
    return NextResponse.json({
      processed: results.length,
      successful: results.filter(r => r.status === 'fulfilled' && r.value.success).length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}