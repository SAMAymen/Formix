'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ColorPicker } from '@/components/custom/ColorPicker'
import { Loader2, CheckCircle, Database, Key, Globe, Palette, Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image'

function generateRandomString(length = 32) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export default function SetupWizard() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [dbConnected, setDbConnected] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  
  const [config, setConfig] = useState({
    productName: "Formix",
    companyName: "",
    contactEmail: "",
    websiteUrl: "",
    primaryColor: "#16a34a",
    secondaryColor: "#15803d",
    accentColor: "#86efac",
    databaseUrl: "",
    googleClientId: "",
    googleClientSecret: "",
    nextAuthSecret: generateRandomString(32),
    nextAuthUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    licenseKey: "",
  })

  // Fetch existing configuration on component mount
  useEffect(() => {
    const fetchExistingConfig = async () => {
      try {
        const response = await fetch('/api/setup/get-config')
        if (response.ok) {
          const data = await response.json()
          if (data.config) {
            setConfig(prevConfig => ({
              ...prevConfig,
              ...data.config
            }))
            
            // Set logo and favicon previews if they exist
            if (data.config.logoUrl) {
              setLogoPreview(data.config.logoUrl)
            }
            if (data.config.faviconUrl) {
              setFaviconPreview(data.config.faviconUrl)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching existing config:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchExistingConfig()
  }, [])
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setFaviconPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  
  const testDatabaseConnection = async () => {
    setTestingConnection(true)
    try {
      const response = await fetch('/api/setup/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl: config.databaseUrl })
      })
      
      const result = await response.json()
      if (response.ok && result.success) {
        toast({
          title: "Database connection successful",
          description: "Your database connection is working properly.",
        })
        setDbConnected(true)
      } else {
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: result.error || "Failed to connect to database. Please check your connection string.",
        })
        setDbConnected(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Failed to test database connection.",
      })
      setDbConnected(false)
    } finally {
      setTestingConnection(false)
    }
  }
  
  const saveSetup = async () => {
    setLoading(true)
    try {
      // Create form data for file uploads
      const formData = new FormData()
      
      // Add config data
      Object.entries(config).forEach(([key, value]) => {
        formData.append(key, value)
      })
      
      // Add files if present
      if (logoFile) formData.append('logo', logoFile)
      if (faviconFile) formData.append('favicon', faviconFile)
      
      const response = await fetch('/api/setup/save', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        toast({
          title: "Setup complete!",
          description: "Your Formix installation is now configured.",
        })
        setIsComplete(true)
      } else {
        toast({
          variant: "destructive",
          title: "Setup failed",
          description: result.error || "Failed to save configuration. Please try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <Input 
                  value={config.productName}
                  onChange={e => setConfig({...config, productName: e.target.value})}
                  placeholder="Formix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <Input 
                  value={config.companyName}
                  onChange={e => setConfig({...config, companyName: e.target.value})}
                  placeholder="Your Company, Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input 
                  type="email"
                  value={config.contactEmail}
                  onChange={e => setConfig({...config, contactEmail: e.target.value})}
                  placeholder="support@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website URL</label>
                <Input 
                  type="url"
                  value={config.websiteUrl}
                  onChange={e => setConfig({...config, websiteUrl: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Branding</h2>
            
            <Tabs defaultValue="colors">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="logos">Logos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="colors" className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <ColorPicker 
                    value={config.primaryColor}
                    onChange={color => setConfig({...config, primaryColor: color})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secondary Color</label>
                  <ColorPicker 
                    value={config.secondaryColor}
                    onChange={color => setConfig({...config, secondaryColor: color})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Accent Color</label>
                  <ColorPicker 
                    value={config.accentColor}
                    onChange={color => setConfig({...config, accentColor: color})}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="logos" className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Logo (SVG, PNG or JPG, max 2MB)</label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file" 
                      accept=".svg,.png,.jpg,.jpeg"
                      onChange={handleLogoChange}
                    />
                    {logoPreview && (
                      <div className="w-16 h-16 p-1 border rounded flex items-center justify-center bg-white">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Favicon (ICO, PNG, SVG, max 1MB)</label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file" 
                      accept=".ico,.png,.svg"
                      onChange={handleFaviconChange}
                    />
                    {faviconPreview && (
                      <div className="w-8 h-8 p-1 border rounded flex items-center justify-center bg-white">
                        <img 
                          src={faviconPreview} 
                          alt="Favicon preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Database Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  MongoDB Database URL
                </label>
                <Textarea 
                  value={config.databaseUrl}
                  onChange={e => setConfig({...config, databaseUrl: e.target.value})}
                  placeholder="mongodb+srv://username:password@cluster.mongodb.net/formix?retryWrites=true&w=majority"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  MongoDB connection string for your database.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={testDatabaseConnection} 
                  type="button" 
                  variant="outline"
                  disabled={!config.databaseUrl || testingConnection}
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      {dbConnected ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Database className="mr-2 h-4 w-4" />
                      )}
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Authentication Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Google Client ID
                </label>
                <Input 
                  value={config.googleClientId}
                  onChange={e => setConfig({...config, googleClientId: e.target.value})}
                  placeholder="your-client-id.apps.googleusercontent.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Create at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Google Client Secret
                </label>
                <Input 
                  value={config.googleClientSecret}
                  onChange={e => setConfig({...config, googleClientSecret: e.target.value})}
                  placeholder="GOCSPX-your-client-secret"
                  type="password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  NextAuth URL
                </label>
                <Input 
                  value={config.nextAuthUrl}
                  onChange={e => setConfig({...config, nextAuthUrl: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your application's public URL (with no trailing slash)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  NextAuth Secret
                </label>
                <Input 
                  value={config.nextAuthSecret}
                  onChange={e => setConfig({...config, nextAuthSecret: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Random string used to encrypt cookies
                </p>
              </div>
            </div>
          </div>
        )
        
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">License Activation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  License Key
                </label>
                <Input 
                  value={config.licenseKey}
                  onChange={e => setConfig({...config, licenseKey: e.target.value})}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the license key you received after purchase
                </p>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <Key className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">License Information</h3>
                    <p className="text-xs text-amber-700 mt-1">
                      If you don't have a license key yet, you can still complete the setup and add it later. 
                      The application will function with the default limitations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }
  
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-emerald-50 p-4">
        <Card className="w-full max-w-2xl p-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Setup Complete!</h1>
            <p className="text-gray-600 mb-6">
              Your Formix installation has been configured successfully.
              Sign in with Google using your admin account to access the dashboard.
            </p>
            <div className="space-y-4 w-full">
              <Button asChild size="lg" className="w-full">
                <a href="/login">Go to Login</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href="/">Visit Homepage</a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Show loading state while fetching initial data
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-emerald-50 p-4">
        <Card className="w-full max-w-2xl p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Loading configuration...</span>
          </div>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-emerald-50 p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl font-bold">Formix Setup Wizard</h1>
        </div>
        
        {/* Step indicator */}
        <div className="flex mb-8">
          {[1, 2, 3, 4, 5].map(s => (
            <div 
              key={s}
              className={`flex-1 h-2 mx-1 rounded ${s <= step ? "bg-green-600" : "bg-gray-200"}`}
            ></div>
          ))}
        </div>
        
        {/* Step content */}
        <CardContent className="p-4">
          {getStepContent()}
        </CardContent>
        
        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1 || loading}
          >
            Previous
          </Button>
          
          {step < 5 ? (
            <Button
              onClick={() => setStep(s => Math.min(5, s + 1))}
              disabled={loading}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={saveSetup}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Setup...
                </>
              ) : (
                <>Complete Setup</>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}