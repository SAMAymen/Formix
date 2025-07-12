// api/auth/sign-out/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
    }
    
    // Revoke the tokens in the database
    await prisma.account.updateMany({
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Force sign-out error:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}