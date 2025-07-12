"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/lib/types"
import { FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { ConnectionStatus } from "./ConnectionStatus"
import { useRouter } from "next/navigation"
import { useTheme } from "@/providers/theme-provider"
import { SheetsPermissionCheck } from "@/components/SheetsPermissionCheck"
import { ReauthorizeGoogle } from '@/components/ReauthorizeGoogle';
import { useSession } from "next-auth/react"

interface ConnectSheetProps {
  onConnect: () => Promise<void>
  form: Form
  theme?: string
  isConnecting?: boolean
}

export function ConnectSheet({ onConnect, form, theme: themeProp = 'light', isConnecting: externalIsConnecting }: ConnectSheetProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)
  const [setupStep, setSetupStep] = useState("")
  const [authError, setAuthError] = useState(false)
  const [needsReauth, setNeedsReauth] = useState(false)
  
  const { resolvedTheme } = useTheme()
  const actualTheme = resolvedTheme || themeProp

  const connecting = externalIsConnecting !== undefined ? externalIsConnecting : isConnecting

  // Check for auth redirect params on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sheetsAuth = params.get('sheetsAuth')
    const error = params.get('error')
    
    if (sheetsAuth === 'success') {
      toast({
        title: "Google Sheets authorized",
        description: "You can now connect your form to Google Sheets",
      })
      // Remove query params from URL to prevent issues on refresh
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (error) {
      setAuthError(true)
      toast({
        variant: "destructive",
        title: "Authorization failed",
        description: "Could not get permission for Google Sheets",
      })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [toast])

  // Style classes based on theme
  const cardClasses = actualTheme === 'dark'
    ? "border-gray-700 bg-gray-800"
    : "border-green-100";
    
  const headingClasses = actualTheme === 'dark'
    ? "text-gray-200"
    : "";
    
  const descriptionClasses = actualTheme === 'dark'
    ? "text-gray-400"
    : "text-gray-600";
    
  const linkClasses = actualTheme === 'dark'
    ? "text-emerald-400 hover:text-emerald-300"
    : "text-green-600 hover:underline";
    
  const progressBgClasses = actualTheme === 'dark'
    ? "bg-gray-700"
    : "bg-gray-100";
    
  const iconClasses = actualTheme === 'dark'
    ? "text-emerald-500"
    : "text-green-600";
    
  const buttonClasses = actualTheme === 'dark'
    ? "bg-emerald-700 hover:bg-emerald-600 text-gray-100"
    : "bg-green-600 hover:bg-green-700 text-white";
    
  const outlineButtonClasses = actualTheme === 'dark'
    ? "border-gray-600 hover:bg-gray-700 text-gray-300"
    : "";
    
  const smallTextClasses = actualTheme === 'dark'
    ? "text-gray-500"
    : "text-gray-500";

  const errorClasses = actualTheme === 'dark'
    ? "text-red-400"
    : "text-red-600";

  // Request Google Sheets specific access
  const requestSheetsAccess = async () => {
    // Save current location for redirect after auth
    sessionStorage.setItem("returnUrl", window.location.pathname)
    
    // Get user email from session for login_hint
    const userEmail = session?.user?.email
    
    // Create a custom state parameter to identify this is for sheets access
    const stateParam = encodeURIComponent(JSON.stringify({
      returnPath: window.location.pathname,
      forSheets: true,
      email: userEmail
    }))
    
    // Build params with login_hint
    const params = new URLSearchParams({
      state: stateParam
    })
    
    if (userEmail) {
      params.append('login_hint', userEmail)
    }
    
    // Use a specific sheets auth endpoint
    router.push(`/api/auth/sheets-access?${params.toString()}`)
  }

  // For reconnecting already authenticated user
  const handleReconnectGoogle = async () => {
    sessionStorage.setItem("returnUrl", window.location.pathname)
    const returnUrl = encodeURIComponent(window.location.pathname)
    // Force consent to ensure user can change permissions
    router.push(`/api/auth/signin/google?callbackUrl=${returnUrl}&prompt=consent`)
  }

  const simulateProgress = () => {
    setSetupProgress(0)
    setSetupStep("Creating spreadsheet...")
    const progressSteps = [
      { progress: 50, message: "Creating spreadsheet...", delay: 2000 },
      { progress: 100, message: "Finalizing setup...", delay: 1000 },
    ]
    progressSteps.forEach((step, index) => {
      setTimeout(() => {
        setSetupProgress(step.progress)
        setSetupStep(step.message)
      }, step.delay * (index + 1))
    })
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      simulateProgress()
      await onConnect()
      setSetupProgress(100)
      setSetupStep("Setup complete!")
      setAuthError(false)
      setNeedsReauth(false); // Reset reauth flag on success
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      setSetupProgress(0)
      
      // Check for auth-related errors and reconnectRequired
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      const errorData = (err as any)?.response?.data || {}
      
      if (errorMessage.includes('authentication') || 
          errorMessage.includes('permission') ||
          errorMessage.includes('auth') ||
          errorMessage.includes('access') ||
          errorData.reconnectRequired) {
        setAuthError(true)
        setNeedsReauth(true);  // Set the reauth flag
      } else {
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: errorMessage,
        })
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // If needs reauthorization, show reauth component
  if (needsReauth) {
    return (
      <Card className={cardClasses}>
        <CardContent className="p-6">
          <ReauthorizeGoogle 
            onClose={() => setNeedsReauth(false)}
            returnUrl={window.location.pathname}
          />
        </CardContent>
      </Card>
    );
  }

  // If already connected, show connection details and reconnect button
  if (form.sheetId) {
    return (
      <Card className={cardClasses}>
        <CardContent className="p-6">
          <div className="text-center space-y-4 animate-fadeIn">
            <div className="relative inline-block">
              <CheckCircle2 className={`mx-auto h-12 w-12 ${iconClasses} animate-bounce-once`} />
              <div className="absolute -bottom-1 -right-1">
                <ConnectionStatus theme={actualTheme} />
              </div>
            </div>
            <h3 className={`text-lg font-medium ${headingClasses}`}>Google Sheets Connected</h3>
            <p className={`text-sm ${descriptionClasses}`}>
              Responses will be saved to{" "}
              <a
                href={form.sheetUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                your spreadsheet
              </a>
            </p>
            <Button 
              variant="outline" 
              onClick={handleReconnectGoogle} 
              className={`ml-2 ${outlineButtonClasses}`}
            >
              Reconnect Google
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If not connected, wrap non-connected state in SheetsPermissionCheck
  return (
    <Card className={cardClasses}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {connecting ? (
            <div className="space-y-6 py-4 animate-fadeIn">
              <FileSpreadsheet className={`mx-auto h-12 w-12 ${iconClasses} animate-pulse`} />
              <h3 className={`text-lg font-medium ${headingClasses}`}>{setupStep}</h3>
              <Progress value={setupProgress} className={`h-2 ${progressBgClasses}`} />
              <p className={`text-sm ${descriptionClasses}`}>
                Creating and configuring Google Sheet...
              </p>
            </div>
          ) : (
            <SheetsPermissionCheck>
              <FileSpreadsheet className={`mx-auto h-12 w-12 ${iconClasses}`} />
              <h3 className={`text-lg font-medium ${headingClasses}`}>Create Google Sheet</h3>
              <p className={`text-sm ${descriptionClasses}`}>
                We'll create a new spreadsheet specifically for your form submissions
              </p>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleConnect}
                    className={`flex-1 transition-all duration-200 hover:scale-[1.02] ${buttonClasses}`}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Create Google Sheet
                  </Button>
                  <Button
                    onClick={requestSheetsAccess}
                    variant="outline"
                    size="sm"
                    title="Fix permission issues"
                    className={`px-2 ${actualTheme === 'dark' ? 'text-emerald-400 border-emerald-800' : 'text-green-600 border-green-200'}`}
                  >
                    <AlertCircle className="w-4 h-4" />
                  </Button>
                </div>
                <p className={`pt-2 text-xs ${smallTextClasses}`}>
                  Your form responses will be saved in Google Sheets
                </p>
                <p className={`text-xs ${smallTextClasses}`}>
                  Having trouble? <span 
                    onClick={requestSheetsAccess} 
                    className={`cursor-pointer ${actualTheme === 'dark' ? 'text-emerald-500 hover:text-emerald-400' : 'text-green-600 hover:text-green-700'}`}
                  >
                    Check Drive permissions
                  </span>
                </p>
              </div>
            </SheetsPermissionCheck>
          )}
        </div>
      </CardContent>
    </Card>
  )
}