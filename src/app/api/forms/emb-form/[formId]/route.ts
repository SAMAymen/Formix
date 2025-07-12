import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FieldType } from '@/lib/types'
import { logger } from '@/lib/logger';

export async function GET(request: Request, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });

  try {
    const form = await prisma.form.findUnique({
      where: { id: params.formId },
      select: {
        id: true,
        title: true,
        fields: true,
        sheetId: true
      }
    });

    logger.info(`Form fetched: ${JSON.stringify(form)}`);
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    const fieldsArray = form.fields as any[];
    
    const typedFields = fieldsArray.map(field => {
      // Simplified columnSpan handling
      const columnSpan = field.columnSpan ? 
        (isNaN(Number(field.columnSpan)) ? 1 : Math.max(1, Number(field.columnSpan))) :
        1;
      
      // Create base field with required properties
      const typedField: FieldType = {
        id: field.id,
        type: field.type,
        label: field.label,
        required: field.required ?? false,
        options: field.options || [],
        columnSpan
      };
      
      // Handle specific field types
      if (field.type === 'checkbox') {
        typedField.checkboxOptions = field.checkboxOptions || [];
        typedField.checkboxLabel = field.checkboxLabel || field.label;
      }
      
      if (field.type === 'radio') {
        typedField.radioOptions = field.radioOptions || field.options || [];
        typedField.radioLabel = field.radioLabel || field.label;
      }
      
      if (field.type === 'cta') {
        typedField.ctaText = field.ctaText || field.label || 'Submit';
      }
      
      // Add other optional properties
      if (field.min !== undefined) typedField.min = field.min;
      if (field.max !== undefined) typedField.max = field.max;
      if (field.rows !== undefined) typedField.rows = field.rows;
      if (field.helpText !== undefined) typedField.helpText = field.helpText;
      if (field.placeholder !== undefined) typedField.placeholder = field.placeholder;
      
      return typedField;
    });
    
    const transformed = {
      ...form,
      fields: typedFields
    };
    
    return new NextResponse(JSON.stringify(transformed), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Error in form API:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    status: 204
  });
}