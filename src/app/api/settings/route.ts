import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        emailNotificationsEnabled: true,
        marketingNotificationsEnabled: true,
        theme: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      marketingNotificationsEnabled: user.marketingNotificationsEnabled,
      theme: user.theme
    })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { emailNotificationsEnabled, marketingNotificationsEnabled, theme } = await request.json()
    
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        emailNotificationsEnabled,
        marketingNotificationsEnabled,
        theme
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}