import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const productName = formData.get('productName') as string
    const companyName = formData.get('companyName') as string
    const contactEmail = formData.get('contactEmail') as string
    const websiteUrl = formData.get('websiteUrl') as string
    const primaryColor = formData.get('primaryColor') as string
    const secondaryColor = formData.get('secondaryColor') as string
    const accentColor = formData.get('accentColor') as string
    const licenseKey = formData.get('licenseKey') as string
    const databaseUrl = formData.get('databaseUrl') as string
    const googleClientId = formData.get('googleClientId') as string
    const googleClientSecret = formData.get('googleClientSecret') as string
    const nextAuthSecret = formData.get('nextAuthSecret') as string
    const nextAuthUrl = formData.get('nextAuthUrl') as string
    
    // Handle file uploads (same as before)
    const logo = formData.get('logo') as File | null
    const favicon = formData.get('favicon') as File | null
    
    let logoUrl = '/tryformix-logo.png'
    let faviconUrl = '/favicon.ico'
    
    // Replace logo if provided
    if (logo) {
      const logoBuffer = Buffer.from(await logo.arrayBuffer())
      const logoPath = path.join(process.cwd(), 'public', 'tryformix-logo.png')
      
      try {
        if (fs.existsSync(logoPath)) {
          await unlink(logoPath)
        }
      } catch (error) {
        console.log('Old logo not found or could not be deleted')
      }
      
      await writeFile(logoPath, logoBuffer)
      logoUrl = '/tryformix-logo.png'
    }
    
    // Replace favicon if provided
    if (favicon) {
      const faviconBuffer = Buffer.from(await favicon.arrayBuffer())
      const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico')
      
      try {
        if (fs.existsSync(faviconPath)) {
          await unlink(faviconPath)
        }
      } catch (error) {
        console.log('Old favicon not found or could not be deleted')
      }
      
      await writeFile(faviconPath, faviconBuffer)
      faviconUrl = '/favicon.ico'
    }
    
    // Update or create system settings
    const settings = await prisma.systemSettings.upsert({
      where: { id: "1" },
      update: {
        siteTitle: productName,
        companyName,
        contactEmail,
        websiteUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        faviconUrl,
        licenseKey,
        databaseUrl,
        googleClientId,
        googleClientSecret,
        nextAuthSecret,
        nextAuthUrl,
        setupCompleted: true
      },
      create: {
        id: "1",
        siteTitle: productName,
        companyName,
        contactEmail,
        websiteUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        faviconUrl,
        licenseKey,
        databaseUrl,
        googleClientId,
        googleClientSecret,
        nextAuthSecret,
        nextAuthUrl,
        setupCompleted: true
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configuration saved successfully',
      settings
    })
    
  } catch (error) {
    console.error('Error saving configuration:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save configuration' 
    }, { status: 500 })
  }
}