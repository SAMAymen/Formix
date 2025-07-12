"use client"

import { useState, useEffect, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FileSpreadsheet, ChevronRight, Medal, LockOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/providers/theme-provider"
import { useSession } from "next-auth/react"

interface SheetsPermissionCheckProps {
  children: ReactNode;
  onPermissionGranted?: () => void;
}

export function SheetsPermissionCheck({ 
  children, 
  onPermissionGranted 
}: SheetsPermissionCheckProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { resolvedTheme } = useTheme()
  const { data: session } = useSession()
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking')
  const [isChecking, setIsChecking] = useState(true)
  
  // Check for sheets permission on mount and when URL parameters change
  useEffect(() => {
    checkSheetsPermission()
    
    // Also check for auth redirect params
    const params = new URLSearchParams(window.location.search)
    const sheetsAuth = params.get('sheetsAuth')
    const error = params.get('error')
    
    if (sheetsAuth === 'success') {
      toast({
        title: "🎉 Sheets access unlocked!",
        description: "You can now save form responses to Google Sheets",
      })
      // Remove query params and recheck permissions
      window.history.replaceState({}, document.title, window.location.pathname)
      checkSheetsPermission()
      if (onPermissionGranted) {
        onPermissionGranted()
      }
    } else if (error) {
      toast({
        variant: "destructive",
        title: "Connection incomplete",
        description: "We couldn't connect to Google Sheets. Please try again.",
      })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [toast, onPermissionGranted])
  
  // Function to check if user has sheets permission
  const checkSheetsPermission = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/check-sheets-permission')
      const data = await response.json()
      
      if (data.hasPermission) {
        setPermissionStatus('granted')
        if (onPermissionGranted) {
          onPermissionGranted()
        }
      } else {
        setPermissionStatus('denied')
      }
    } catch (error) {
      console.error('Error checking permission:', error)
      setPermissionStatus('denied')
    } finally {
      setIsChecking(false)
    }
  }
  
  // Request Google Sheets permissions
  const requestSheetsAccess = () => {
    // Save current location for redirect after auth
    sessionStorage.setItem("returnUrl", window.location.pathname)
    
    // Add the user's email as a parameter
    const userEmail = session?.user?.email
    
    // Create a custom state parameter to identify this is for sheets access
    const stateParam = encodeURIComponent(JSON.stringify({
      returnPath: window.location.pathname,
      forSheets: true,
      email: userEmail // Store email in state to preserve it during the flow
    }))
    
    // Use the sheets auth endpoint with login_hint to skip account selection
    const params = new URLSearchParams({
      state: stateParam
    })
    
    if (userEmail) {
      params.append('login_hint', userEmail)
    }
    
    router.push(`/api/auth/sheets-access?${params.toString()}`)
  }
  
  // If checking or permission granted, render children
  if (permissionStatus === 'checking' && isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin mr-2">
          <FileSpreadsheet className={`h-5 w-5 ${resolvedTheme === 'dark' ? 'text-emerald-500' : 'text-green-600'}`} />
        </div>
        <span className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Checking Google Sheets access...
        </span>
      </div>
    )
  }
  
  if (permissionStatus === 'granted') {
    return <>{children}</>
  }
  
  // Show current account if available
  const currentAccount = session?.user?.email ? (
    <div className={`text-xs mt-1 mb-2 ${resolvedTheme === 'dark' ? 'text-emerald-400/70' : 'text-green-700/70'}`}>
      Using account: {session.user.email}
    </div>
  ) : null
  
  // If permission denied, show permission request UI with gamification
  const cardBgClasses = resolvedTheme === 'dark'
    ? "border-emerald-800 bg-emerald-900/20"
    : "border-green-200 bg-green-50/80";
    
  const titleClasses = resolvedTheme === 'dark'
    ? "text-emerald-300"
    : "text-green-800";
    
  const descriptionClasses = resolvedTheme === 'dark'
    ? "text-emerald-300/80"
    : "text-green-700";
    
  const buttonClasses = resolvedTheme === 'dark'
    ? "bg-emerald-700 hover:bg-emerald-600 text-white"
    : "bg-green-600 hover:bg-green-700 text-white";
    
  const medalClasses = resolvedTheme === 'dark'
    ? "text-amber-500"
    : "text-amber-500";
  
  return (
    <div className={`rounded-lg border p-6 text-center ${cardBgClasses} animate-fadeIn`}>
      <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20">
        <LockOpen className={`h-8 w-8 ${resolvedTheme === 'dark' ? 'text-emerald-400' : 'text-green-600'}`} />
      </div>
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <h3 className={`font-bold text-lg ${titleClasses}`}>Unlock Sheets Integration</h3>
        <Medal className={`h-5 w-5 ${medalClasses}`} />
      </div>
      
      <p className={`mb-3 text-sm ${descriptionClasses}`}>
        Connect your form to Google Sheets to automatically save responses
      </p>
      
      {currentAccount}
      
      <div className="flex flex-col gap-2 items-center">
        <div className="mb-4 w-full max-w-xs bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
        </div>
        
        <Button 
          onClick={requestSheetsAccess} 
          className={`${buttonClasses} w-full max-w-xs transition-all duration-200 hover:scale-[1.02]`}
        >
          <span>Enable Sheets Integration</span>
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
        
        <p className={`mt-2 text-xs ${descriptionClasses} opacity-80`}>
          You'll be redirected to Google to grant access
        </p>
      </div>
    </div>
  )
}