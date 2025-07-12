import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ hasPermission: false, error: "Not authenticated" }, { status: 401 });
  }
  
  try {
    // Check if user has Google Sheets scope
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
      select: { 
        access_token: true,
        refresh_token: true,
        scope: true
      }
    });
    
    // If no account or refresh token, user doesn't have permission
    if (!account?.refresh_token) {
      return NextResponse.json({ hasPermission: false, reason: "no_refresh_token" });
    }
    
    if (account.scope && account.scope.includes("drive.file")) {
      return NextResponse.json({ hasPermission: true });
    }
    
    return NextResponse.json({ hasPermission: false, reason: "no_sheets_scope" });
  } catch (error: any) {
    console.error("Error checking permissions:", error);
    return NextResponse.json(
      { hasPermission: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}