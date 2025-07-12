import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from "@/lib/auth";
import { getDefaultColors } from '@/app/(dashboard)/forms/[formId]/_components/settings/FormThemeCustomizer';
import { colorsToPrisma } from '@/lib/helpers/colors';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Valid session required" },
        { status: 401 }
      );
    }

    // Get user theme from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { theme: true }
    });
    
    // Set default colors based on user theme preference
    const userTheme = user?.theme || 'light';
    const themeMode = userTheme === 'dark' || 
      (userTheme === 'system' && false) ? 'dark' : 'light';
    
    // Create form with default colors
    const form = await prisma.form.create({
      data: {
        title: data.title || "Untitled Form",
        fields: data.fields || [],
        userId: session.user.id,
        colors: colorsToPrisma(getDefaultColors(themeMode)), // Add default colors as JSON
      },
    });
    
    return NextResponse.json(form);
  } catch (error) {
    console.error('[FORM_CREATE_ERROR]', error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}
