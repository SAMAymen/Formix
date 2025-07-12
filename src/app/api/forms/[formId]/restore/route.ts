import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'


// app/api/forms/[formId]/restore/route.ts

export async function POST(req: NextRequest, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const restoredForm = await prisma.form.update({
      where: {
        id: params.formId,
        userId: session.user.id
      },
      data: {
        isArchived: false
      }
    })

    return NextResponse.json(restoredForm)

  } catch (error) {
    console.error('[FORM_RESTORE_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to restore form" },
      { status: 500 }
    )
  }
}