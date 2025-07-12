'use client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const errorMessages: Record<string, string> = {
  Configuration: 'There was a configuration error. Please contact support.',
  AccessDenied: 'You don\'t have permission to access this resource.',
  Verification: 'The verification token has expired or is invalid.',
  OAuthSignin: 'Error processing OAuth sign in. Please try again.',
  OAuthCallback: 'Error processing OAuth callback. Please try again.',
  OAuthCreateAccount: 'Could not create OAuth user in the database.',
  EmailCreateAccount: 'Could not create email user in the database.',
  Callback: 'Error processing callback. Please try again.',
  OAuthAccountNotLinked: 'Please sign in with your original provider.',
  SessionRequired: 'Please sign in to access this content.',
  Default: 'An unknown authentication error occurred.',
}

// Component that uses useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-4 p-8">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error ? errorMessages[error] || errorMessages.Default : 'Unknown error'}
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/login'}
          >
            Return to Login
          </Button>
          <Button 
            variant="secondary"
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}