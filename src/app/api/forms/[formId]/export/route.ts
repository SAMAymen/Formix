import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Field {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

function isFieldArray(value: unknown): value is Field[] {
  return Array.isArray(value) && value.every(item => {
    const field = item as Field
    return typeof field === 'object' && typeof field.id === 'string' &&
      typeof field.label === 'string' && typeof field.type === 'string'
  })
}

export async function GET(request: NextRequest, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')
  const formId = params.formId

  if (!format || !['csv', 'json'].includes(format) || !formId) {
    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { title: true, fields: true }
    })

    if (!form || !isFieldArray(form.fields)) {
      return NextResponse.json({ error: 'Invalid form configuration' }, { status: 400 })
    }

    const fields = form.fields as Field[]
    const submissions = await prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' }
    })

    const headers = ['Timestamp', ...fields.map(f => f.label)]

    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...submissions.map(sub => {
          const data = sub.data as Record<string, any>
          return [
            new Date(sub.createdAt).toISOString(),
            ...fields.map(f => `"${(data[f.label]?.toString() || '').replace(/"/g, '""')}"`)
          ].join(',');
        })
      ].join('\n')

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${form.title}_submissions.csv"`
        }
      })
    }

    const jsonData = submissions.map(sub => ({
      timestamp: sub.createdAt.toISOString(),
      ...Object.fromEntries(
        fields.map(f => [
          f.label,
          (sub.data as Record<string, any>)[f.label] || null
        ])
      )
    }))

    return new Response(JSON.stringify(jsonData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${form.title}_submissions.json"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 })
  }
}