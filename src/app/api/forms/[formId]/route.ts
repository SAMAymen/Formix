// app/api/forms/[formId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      )
    }

    const form = await prisma.form.findUnique({
      where: {
        id: params.formId,
        userId: session.user.id,
        isArchived: false
      },
      select: {
        id: true,
        title: true,
        fields: true,
        sheetId: true,
        sheetUrl: true,
        colors: true, // Add this line to include colors
        submitButtonText: true, // Also include this for completeness
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    })

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(form)

  } catch (error) {
    console.error('[FORM_FETCH_ERROR]', error)
    return NextResponse.json(
      { error: "Database error - Check server logs" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    
    const updateData = {
      title: body.title,
      fields: body.fields,
      colors: body.colors, // Add this line to include colors
      ...(body.sheetId && {
        sheetId: body.sheetId,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${body.sheetId}`
      }),
      updatedAt: new Date()
    };

    const updatedForm = await prisma.form.update({
      where: { id: params.formId },
      data: updateData
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error('[FORM_UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      )
    }

    const archivedForm = await prisma.form.update({
      where: {
        id: params.formId,
        userId: session.user.id
      },
      data: {
        isArchived: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, data: archivedForm })

  } catch (error) {
    console.error('[FORM_ARCHIVE_ERROR]', error)
    return NextResponse.json(
      { error: "Database error - Check server logs" },
      { status: 500 }
    )
  }
}