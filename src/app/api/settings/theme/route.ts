import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  // Default theme for non-logged in users
  if (!session?.user?.email) {
    return NextResponse.json({ theme: 'light' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        theme: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ theme: 'light' })
    }
    
    return NextResponse.json({ theme: user.theme })
  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json({ theme: 'light' })
  }
}


export async function POST(request: Request) {
  const { theme } = await request.json()
  
  // Validate theme value
  if (!['light', 'dark', 'system'].includes(theme)) {
    return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
  }
  
  // Set cookie for all users (with 1 year expiry)
  const cookieStore = await cookies() as any
  cookieStore.set("theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  })
  
  const session = await getServerSession(authOptions)
  
  // For non-logged in users, just return success after setting cookie
  if (!session?.user?.email) {
    return NextResponse.json({ success: true })
  }

  try {
    // Update theme in database for logged-in users
    const response = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        theme
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating theme:', error)
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}