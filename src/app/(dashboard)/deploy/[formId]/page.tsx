// app/deploy/[formId]/page.tsx
'use client'
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Copy, ExternalLink, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Form } from '@/lib/types'

export default function DeployPage(props: { params: Promise<{ formId: string }> }) {
  const params = use(props.params);
  const { toast } = useToast()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`/api/forms/${params.formId}`)
        if (!response.ok) throw new Error('Failed to load form data')
        const data = await response.json()
        setForm(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load deployment information')
        toast({
          title: 'Loading failed',
          description: 'Could not load form configuration',
          variant: 'destructive'
        })
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchFormData()
  }, [params.formId, router, toast])

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <Card className="border-red-100 bg-red-50">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium">Deployment Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const steps = [
    {
      title: "Open Script Editor",
      content: "Click the button below to open the Google Apps Script editor",
      action: form.scriptId ? (
        <Button asChild>
          <a 
            href={`https://script.google.com/d/${form.scriptId}/edit`} 
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Script Editor
          </a>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading Script Info...
        </Button>
      )
    },
    {
      title: "Deploy as Web App",
      content: "In the script editor: Deploy > Manage Deployments > Web App",
      subSteps: [
        'Execute as: "Me"',
        'Who has access: "Anyone"'
      ]
    },
    {
      title: "Copy Deployment ID",
      content: "After deployment, copy the deployment ID from the dialog"
    },
    {
      title: "Paste Deployment ID",
      content: "Return here and paste the ID in the field below"
    }
  ]

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Final Deployment Steps</h1>
        <p className="text-gray-600">
          Complete these steps to enable Google Sheets integration for:
        </p>
        <p className="font-medium text-green-700">{form.title}</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={index} className="border-green-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="font-medium text-green-700">{index + 1}</span>
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">{step.content}</p>
              {step.subSteps && (
                <ul className="list-disc pl-6 text-sm text-gray-600">
                  {step.subSteps.map((sub, i) => (
                    <li key={i}>{sub}</li>
                  ))}
                </ul>
              )}
              {step.action}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => router.push(`/preview/${params.formId}`)}
        >
          I've Completed All Steps - Test My Form
        </Button>
      </div>
    </div>
  )
}