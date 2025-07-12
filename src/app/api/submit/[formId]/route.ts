// src/app/api/submit/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import type { FieldType } from '@/lib/types'
import { logger } from '@/lib/logger'

// Shared CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: corsHeaders,
    status: 204,
  })
}

async function handleGoogleAuth(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' }
  })

  if (!account?.access_token || !account?.refresh_token) {
    throw new Error('Google account not connected')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.NEXTAUTH_URL!
  )

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  })

  return oauth2Client
}

async function validateSubmissionData(data: unknown): Promise<Record<string, any>> {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      throw new Error('Invalid JSON string format')
    }
  }
  
  if (typeof data !== 'object' || data === null) {
    throw new Error('Submission data must be a JSON object')
  }

  return data as Record<string, any>
}

export async function POST(req: Request, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  const requestId = crypto.randomUUID()
  logger.info(`[${requestId}] Starting submission for form: ${params.formId}`)

  try {
    // Validate form ID
    if (!params.formId) {
      logger.warn(`[${requestId}] Missing form ID in request`)
      return NextResponse.json(
        { success: false, error: 'Form ID is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Fetch form details
    const form = await prisma.form.findUnique({
      where: { id: params.formId },
      include: { user: { select: { id: true } } }
    })

    if (!form?.sheetId) {
      logger.warn(`[${requestId}] Form not found or missing sheet ID`)
      return NextResponse.json(
        { success: false, error: 'Form or spreadsheet not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Parse and validate submission data
    const rawData = await req.json()
    const formData = await validateSubmissionData(rawData)
    logger.info(`[${requestId}] Validated submission data`+ formData)

    // Google Sheets setup
    const auth = await handleGoogleAuth(form.userId)
    const sheets = google.sheets({ version: 'v4', auth })

    // Get spreadsheet metadata
    const { data: spreadsheet } = await sheets.spreadsheets.get({
      spreadsheetId: form.sheetId
    })

    const [firstSheet] = spreadsheet.sheets || []
    const sheetName = firstSheet?.properties?.title || 'Sheet1'

    // Prepare headers from form configuration
    const fields = form.fields as any[]
    const headers = fields.map(f => f.label)

    // Map data to sheet columns
    const rowData = headers.map(header => {
      const field = fields.find(f => f.label === header)
      if (!field) return ''

      // Handle phone number fields
      if (field.type === 'tel') {
        const country = formData[`${field.id}_country`] || ''
        const number = formData[`${field.id}_number`] || ''
        return country ? `${country} ${number}` : number
      }

      return formData[field.id] || ''
    })

    // Check if headers need to be created
    const { data: existingData } = await sheets.spreadsheets.values.get({
      spreadsheetId: form.sheetId,
      range: `${sheetName}!A1:1`
    })

    if (!existingData.values?.length) {
      logger.info(`[${requestId}] Initializing sheet headers`)
      await sheets.spreadsheets.values.append({
        spreadsheetId: form.sheetId,
        range: sheetName,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] }
      })
    }

    // Append data to sheet
    const { data: result } = await sheets.spreadsheets.values.append({
      spreadsheetId: form.sheetId,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowData] }
    })

    logger.info(`[${requestId}] Sheet update result`+ {
      updatedCells: result.updates?.updatedCells,
      range: result.updates?.updatedRange
    })

    // Store submission in database
    const submission = await prisma.submission.create({
      data: {
        formId: params.formId,
        data: formData  // Directly store parsed JSON object
      }
    })

    return NextResponse.json(
      { success: true, submission },
      { status: 201, headers: corsHeaders }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[${requestId}] Submission failed`, { error: errorMessage })

    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes('PERMISSION_DENIED')) {
        return NextResponse.json(
          { success: false, error: 'Missing spreadsheet permissions' },
          { status: 403, headers: corsHeaders }
        )
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Spreadsheet not found' },
          { status: 404, headers: corsHeaders }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500, headers: corsHeaders }
    )
  }
}