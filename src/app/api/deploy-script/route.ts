// app/api/deploy-script/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getGoogleAuthClient, GoogleAuthError } from "@/lib/google-token";

// Validate environment variables
const REQUIRED_ENV = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXTAUTH_URL"];
if (REQUIRED_ENV.some(key => !process.env[key])) {
  throw new Error(`Missing required environment variables`);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check for user authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required", redirectToLogin: true },
        { status: 401 }
      );
    }

    // Extract form data
    const body = await req.json().catch(() => ({}));
    const { formId, sheetName } = body;
    
    if (!formId || !sheetName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the form exists
    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Get user's Google account
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" }
    });
    
    if (!account) {
      return NextResponse.json(
        {
          error: "Google account required",
          message: "Please connect your Google account",
          redirectToLogin: true,
          reconnectRequired: true
        },
        { status: 401 }
      );
    }
    
    // Check if we have a refresh token
    if (!account?.refresh_token) {
      return NextResponse.json(
        {
          error: "Google Drive access required",
          message: "Please reconnect your Google account with Drive permissions",
          redirectToLogin: true,
          reconnectRequired: true
        },
        { status: 401 }
      );
    }
    
    // Force a token refresh by setting expires_at to now
    await prisma.account.update({
      where: { id: account.id },
      data: { expires_at: Math.floor(Date.now() / 1000) - 1 }
    });

    // Get auth client with fresh tokens
    const auth = await getGoogleAuthClient(session.user.id);

    // Verify access token exists
    if (!auth.credentials.access_token) {
      return NextResponse.json(
        {
          error: "Invalid Google authentication",
          message: "Your Google authorization needs to be updated. Please sign in again with Google.",
          redirectToLogin: true,
          reconnectRequired: true
        },
        { status: 401 }
      );
    }
    
    try {
      // Create spreadsheet
      const sheetsAPI = google.sheets({ version: "v4", auth });
      const spreadsheet = await sheetsAPI.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Form_${sheetName}_${formId.substring(0, 8)}_${crypto.randomBytes(4).toString("hex")}`,
            locale: "en_US",
            timeZone: "America/New_York",
          },
          sheets: [{
            properties: {
              title: sheetName,
              gridProperties: { rowCount: 1000, columnCount: 26 },
            },
          }],
        },
      });

      if (!spreadsheet.data.spreadsheetId) {
        throw new Error("Failed to create spreadsheet");
      }

      // Update form with sheet details
      await prisma.form.update({
        where: { id: formId },
        data: {
          sheetId: spreadsheet.data.spreadsheetId,
          sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheet.data.spreadsheetId}`,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        data: {
          formId,
          sheetId: spreadsheet.data.spreadsheetId,
          sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheet.data.spreadsheetId}`,
        },
        message: "Google spreadsheet created successfully",
      });
      
    } catch (apiError: any) {
      // Handle specific API errors
      if (apiError.response?.status === 403) {
        return NextResponse.json(
          {
            error: "Google permission denied",
            message: "Google Drive permissions are required to create spreadsheets. Please sign in with Google and approve the permissions request.",
            redirectToLogin: true,
            reconnectRequired: true
          },
          { status: 403 }
        );
      }
      
      if (apiError.response?.status === 401) {
        return NextResponse.json(
          {
            error: "Google authentication expired",
            message: "Your Google sign-in has expired. Please sign in again with Google.",
            redirectToLogin: true,
            reconnectRequired: true
          },
          { status: 401 }
        );
      }
      
      // Handle general API errors
      const isAuthError = 
        apiError.message?.includes("authentication") || 
        apiError.message?.includes("credentials") ||
        apiError.message?.includes("expired") || 
        apiError.message?.includes("permission");
      
      if (isAuthError) {
        return NextResponse.json(
          {
            error: "Google authentication issue",
            message: "We encountered an issue with your Google account. Please try signing in again.",
            redirectToLogin: true,
            reconnectRequired: true
          },
          { status: 401 }
        );
      }
      
      // General error fallback
      return NextResponse.json(
        { 
          error: apiError.message || "Failed to create spreadsheet",
          message: "There was an error creating your Google spreadsheet. Please try again later."
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in deploy-script:', error);
    
    if (error instanceof GoogleAuthError && error.requiresReauth) {
      return NextResponse.json({ 
        success: false, 
        reconnectRequired: true,
        message: 'Google authorization expired. Please reconnect your account.'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: false,
      message: (error as Error).message || 'Failed to deploy sheet integration'
    }, { status: 500 });
  }
}