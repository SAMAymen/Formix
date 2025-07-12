import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(request: NextRequest, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formId = params.formId;
    const { colors } = await request.json();
    
    // Security validation
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { userId: true }
    });
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    if (form.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Update only the colors field
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: { 
        colors: colors  // Store colors as a top-level field
      }
    });
    
    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error('Error updating colors:', error);
    return NextResponse.json(
      { error: 'Failed to update colors' },
      { status: 500 }
    );
  }
}