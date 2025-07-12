// api/auth/error/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  
  return NextResponse.json(
    { error: error || 'Unknown authentication error' },
    { status: 500 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}