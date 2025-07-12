import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst({
      where: { id: "1" }
    })
    
    if (settings) {
      const responseData = {
        success: true, 
        config: {
          productName: settings.siteTitle,
          companyName: settings.companyName,
          contactEmail: settings.contactEmail,
          websiteUrl: settings.websiteUrl,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          accentColor: settings.accentColor,
          databaseUrl: settings.databaseUrl,
          googleClientId: settings.googleClientId,
          googleClientSecret: settings.googleClientSecret,
          nextAuthSecret: settings.nextAuthSecret,
          nextAuthUrl: settings.nextAuthUrl,
          licenseKey: settings.licenseKey,
          logoUrl: settings.logoUrl,
          faviconUrl: settings.faviconUrl
        }
      }
      return NextResponse.json(responseData)
    } else {
      // Create default settings if none exist
      const defaultSettings = await prisma.systemSettings.create({
        data: {
          id: "1",
          siteTitle: "Formix",
          companyName: "",
          contactEmail: "",
          websiteUrl: "",
          primaryColor: "#16a34a",
          secondaryColor: "#15803d",
          accentColor: "#86efac",
          logoUrl: "/tryformix-logo.png",
          faviconUrl: "/favicon.ico",
          setupCompleted: false,
          licenseKey: "",
          databaseUrl: "",
          googleClientId: "",
          googleClientSecret: "",
          nextAuthSecret: "",
          nextAuthUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        config: {
          productName: defaultSettings.siteTitle,
          companyName: defaultSettings.companyName,
          contactEmail: defaultSettings.contactEmail,
          websiteUrl: defaultSettings.websiteUrl,
          primaryColor: defaultSettings.primaryColor,
          secondaryColor: defaultSettings.secondaryColor,
          accentColor: defaultSettings.accentColor,
          databaseUrl: defaultSettings.databaseUrl,
          googleClientId: defaultSettings.googleClientId,
          googleClientSecret: defaultSettings.googleClientSecret,
          nextAuthSecret: defaultSettings.nextAuthSecret,
          nextAuthUrl: defaultSettings.nextAuthUrl,
          licenseKey: defaultSettings.licenseKey,
          logoUrl: defaultSettings.logoUrl,
          faviconUrl: defaultSettings.faviconUrl
        }
      })
    }
  } catch (error) {
    console.error('API: Error fetching config:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch configuration' 
    }, { status: 500 })
  }
}