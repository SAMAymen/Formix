'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '@/providers/theme-provider'
import { ArrowLeft, Save, Loader2, Bell, Palette } from 'lucide-react'
import Link from 'next/link'
import { AccountDeletion } from "./account-deletion";

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsLoading, setIsSettingsLoading] = useState(true)
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotificationsEnabled: true,
    marketingNotificationsEnabled: false,
    theme: 'light',
  })
  
  // Add this state to track user changes
  const [userChangedTheme, setUserChangedTheme] = useState(false);

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user) return
      
      try {
        const response = await fetch('/api/settings')
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        
        const data = await response.json()
        
        // Only update theme from API if user hasn't manually changed it
        if (!userChangedTheme) {
          setSettings(data);
          
          // Validate theme before applying
          const validTheme = ['light', 'dark', 'system'].includes(data.theme) ? data.theme : 'light';
          console.log('Setting theme from settings:', validTheme);
          setTheme(validTheme as "light" | "dark" | "system");
        } else {
          // Keep the user's theme choice but update other settings
          setSettings(prevSettings => ({
            ...data,
            theme: prevSettings.theme
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast({
          title: "Error loading settings",
          description: "Could not load your preferences.",
          variant: "destructive"
        })
      } finally {
        setIsSettingsLoading(false)
      }
    }
    
    fetchSettings()
  }, [session, toast, setTheme, userChangedTheme])
  
  const handleThemeChange = (value: string) => {
    // Log the value being received
    console.log('Theme changed to:', value);
    
    // Mark that user has manually changed theme
    setUserChangedTheme(true);
    
    // Validate the theme value
    const validTheme = ['light', 'dark', 'system'].includes(value) ? value : 'light';
    
    // Update settings state
    setSettings(prevSettings => ({...prevSettings, theme: validTheme}));
    
    // Update the theme immediately with explicit type
    setTheme(validTheme as "light" | "dark" | "system");
  }
  
  const handleSaveSettings = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isSettingsLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }
  
  // Dynamic styles based on theme
  const containerClasses = resolvedTheme === 'dark' 
    ? "p-6 max-w-4xl mx-auto space-y-6 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100" 
    : "p-6 max-w-4xl mx-auto space-y-6 bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen";
    
  const headingTextClasses = resolvedTheme === 'dark' ? "text-3xl font-bold text-white" : "text-3xl font-bold text-gray-800";
  const subheadingTextClasses = resolvedTheme === 'dark' ? "text-gray-300" : "text-gray-600";
  const backButtonClasses = resolvedTheme === 'dark' 
    ? "text-green-400 pl-0 hover:bg-gray-800" 
    : "text-green-700 pl-0 hover:bg-green-50";
  const tabsListClasses = resolvedTheme === 'dark' 
    ? "grid grid-cols-2 rounded-xl p-1 bg-gray-800 border border-gray-700 space-x-2" 
    : "grid grid-cols-2 rounded-xl p-1 bg-green-50 border border-green-100 space-x-2";
  const tabTriggerClasses = resolvedTheme === 'dark'
    ? "flex items-center justify-center gap-2 rounded-md py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 data-[state=active]:bg-gray-700 data-[state=active]:text-green-400"
    : "flex items-center justify-center gap-2 rounded-md py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 data-[state=active]:bg-green-100 data-[state=active]:text-green-900";
  const cardClasses = resolvedTheme === 'dark' 
    ? "border-gray-700 bg-gray-800" 
    : "border-green-100";
  const cardTitleClasses = resolvedTheme === 'dark' ? "text-white" : "";
  const cardDescriptionClasses = resolvedTheme === 'dark' ? "text-gray-400" : "";
  const labelClasses = resolvedTheme === 'dark' ? "font-medium text-gray-200" : "font-medium text-gray-800";
  const descriptionClasses = resolvedTheme === 'dark' ? "text-sm text-gray-400" : "text-sm text-gray-500";
  const selectTriggerClasses = resolvedTheme === 'dark' ? "border-gray-700 bg-gray-800" : "border-green-200";
  
  return (
    <div className={containerClasses}>
      <Button 
        variant="ghost" 
        className={backButtonClasses}
        asChild
      >
        <Link href="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>
      
      <div>
        <h1 className={headingTextClasses}>Settings</h1>
        <p className={subheadingTextClasses}>Customize your Formix experience</p>
      </div>
      
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className={tabsListClasses}>
          <TabsTrigger 
            value="notifications" 
            className={tabTriggerClasses}
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="appearance" 
            className={tabTriggerClasses}
          >
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="mt-6">
          <Card className={cardClasses}>
            <CardHeader>
              <CardTitle className={cardTitleClasses}>Notification Preferences</CardTitle>
              <CardDescription className={cardDescriptionClasses}>Control when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={labelClasses}>Email Notifications</p>
                  <p className={descriptionClasses}>Receive form submissions and alerts via email</p>
                </div>
                <Switch 
                  checked={settings.emailNotificationsEnabled}
                  onCheckedChange={() => setSettings({...settings, emailNotificationsEnabled: !settings.emailNotificationsEnabled})}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className={labelClasses}>Marketing Updates</p>
                  <p className={descriptionClasses}>Receive updates about new features and tips</p>
                </div>
                <Switch 
                  checked={settings.marketingNotificationsEnabled}
                  onCheckedChange={() => setSettings({...settings, marketingNotificationsEnabled: !settings.marketingNotificationsEnabled})}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6">
          <Card className={cardClasses}>
            <CardHeader>
              <CardTitle className={cardTitleClasses}>Appearance Settings</CardTitle>
              <CardDescription className={cardDescriptionClasses}>Customize how Formix looks for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <label htmlFor="theme" className={labelClasses}>Theme</label>
                <Select
                  value={settings.theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger id="theme" className={selectTriggerClasses}>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="mt-10">
        <AccountDeletion />
      </div>
    </div>
  )
}