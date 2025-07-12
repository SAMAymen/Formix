import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Begin transaction to handle all deletion operations
    await prisma.$transaction(async (tx) => {
      // 1. Archive all user's forms (soft delete)
      await tx.form.updateMany({
        where: { userId: session.user.id },
        data: { isArchived: true }
      });
      
      // 2. Remove Google OAuth tokens
      await tx.account.updateMany({
        where: { 
          userId: session.user.id,
          provider: "google"
        },
        data: {
          access_token: null,
          refresh_token: null,
          expires_at: null
        }
      });
      
      // 3. Mark user as deactivated and anonymize data
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          isDeactivated: true,
          email: `deactivated-${session.user.id}@deleted.formix.app`,
          googleAuthUser: null,
          emailNotificationsEnabled: false,
          marketingNotificationsEnabled: false
        }
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}