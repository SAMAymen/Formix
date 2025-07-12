'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function GoogleTokenMonitor() {
  const { data: session, status } = useSession()
  const [showReauth, setShowReauth] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    if (status !== 'authenticated') return
    
    // Check if token is about to expire (within 15 mins)
    const sessionUser = session?.user as any
    if (!sessionUser?.expiresAt) return
    
    const expiresAt = sessionUser.expiresAt * 1000 // Convert to milliseconds
    const fifteenMinsFromNow = Date.now() + 15 * 60 * 1000
    
    if (expiresAt < fifteenMinsFromNow) {
      setShowReauth(true)
    }
    
    // Set up periodic checks
    const checkInterval = setInterval(() => {
      const timeRemaining = expiresAt - Date.now()
      if (timeRemaining < 15 * 60 * 1000) {
        setShowReauth(true)
        clearInterval(checkInterval)
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(checkInterval)
  }, [session, status])
  
  const handleReauthorize = () => {
    const returnUrl = encodeURIComponent(window.location.pathname)
    router.push(`/login?reason=reauth&service=google&returnUrl=${returnUrl}`)
  }
  
  if (!showReauth) return null
  
  return (
    <Dialog open={showReauth} onOpenChange={setShowReauth}>
      <DialogContent className="sm:max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-amber-100 p-3 mb-4">
            <RefreshCw className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            Google Authorization Expiring
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Your Google authorization is about to expire. Please re-authorize to maintain access to your Google Sheets and forms.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowReauth(false)}
            >
              Later
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={handleReauthorize}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Re-authorize Google
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}