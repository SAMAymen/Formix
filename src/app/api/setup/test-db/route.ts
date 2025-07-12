import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { databaseUrl } = await req.json();
    
    if (!databaseUrl) {
      return NextResponse.json(
        { success: false, error: 'Database URL is required' },
        { status: 400 }
      );
    }
    
    // Create a new PrismaClient with the provided connection string
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    
    // Test connection by running a simple query
    await prisma.$connect();
    
    // Disconnect after successful test
    await prisma.$disconnect();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Failed to connect to database' 
      },
      { status: 500 }
    );
  }
}