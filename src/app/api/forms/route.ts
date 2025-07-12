// app/api/forms/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from "@/lib/auth";
import { getThemeColors } from '@/lib/colors';
import { colorsToPrisma } from '@/lib/helpers/colors';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Authenticate user
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized - Valid session required" },
      { status: 401 }
    );
  }

  try {
    // Get all forms for the current user with their submissions
    const forms = await prisma.form.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        submissions: true // Include all submissions
      }
    });
    
    return NextResponse.json(forms);
    
  } catch (error) {
    console.error('[FORMS_FETCH_ERROR]', error);
    return NextResponse.json(
      { error: "Failed to fetch forms data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Proper session validation
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized - Valid session required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    
    // Add validation
    if (!body.fields || !Array.isArray(body.fields)) {
      return NextResponse.json(
        { error: "Invalid form structure" },
        { status: 400 }
      );
    }

    // Get user theme from database
    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { theme: true }
    });
    
    // Set default colors based on user theme preference
    const userTheme = user?.theme || 'light';
    const themeMode = userTheme === 'dark' ? 'dark' : 'light';

    const form = await prisma.form.create({
      data: {
        title: body.title || "Untitled Form",
        description: body.description || "",
        fields: body.fields,
        userId: session.user.id,
        colors: colorsToPrisma(getThemeColors(themeMode)),
      }
    });

    return NextResponse.json(form);
    
  } catch (error) {
    console.error('[FORM_CREATION_ERROR]', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}