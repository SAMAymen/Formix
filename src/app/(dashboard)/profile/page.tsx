'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Loader2, User, FileSpreadsheet, Award } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/providers/theme-provider'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [formCount, setFormCount] = useState(0)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  // Profile data state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  })

  // Theme-specific styles
  const pageBackgroundClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-b from-gray-900 to-gray-800"
    : "bg-gradient-to-b from-green-50 to-emerald-50";
  
  const backButtonClasses = resolvedTheme === 'dark'
    ? "text-green-400 pl-0 hover:bg-gray-800"
    : "text-green-700 pl-0 hover:bg-green-50";
  
  const cardClasses = resolvedTheme === 'dark'
    ? "border-gray-700 bg-gray-800"
    : "border-green-100";
    
  const avatarClasses = resolvedTheme === 'dark'
    ? "border-emerald-800"
    : "border-green-100";
  
  const avatarFallbackClasses = resolvedTheme === 'dark'
    ? "bg-emerald-800 text-emerald-300"
    : "bg-emerald-100 text-emerald-700";
    
  const descriptionClasses = resolvedTheme === 'dark'
    ? "text-gray-400"
    : "";
    
  const iconClasses = resolvedTheme === 'dark'
    ? "text-emerald-400"
    : "text-emerald-600";
    
  const badgeClasses = resolvedTheme === 'dark'
    ? "bg-emerald-900/50 text-emerald-400"
    : "bg-green-100 text-green-800";
    
  const tabsListClasses = resolvedTheme === 'dark'
    ? "bg-gray-800 border-gray-700"
    : "bg-green-50 border border-green-100";
    
  const tabsTriggerClasses = resolvedTheme === 'dark' 
    ? "focus:ring-emerald-500 data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-300"
    : "focus:ring-green-500 data-[state=active]:bg-green-100 data-[state=active]:text-green-900";
    
  const inputClasses = resolvedTheme === 'dark'
    ? "bg-gray-700 border-gray-600 text-gray-200"
    : "bg-green-50 border-green-200";
    
  const helperTextClasses = resolvedTheme === 'dark'
    ? "text-gray-400"
    : "text-gray-500";
    
  const authMethodBgClasses = resolvedTheme === 'dark'
    ? "bg-gray-700 border-gray-600"
    : "bg-gray-50";
    
  const blueBadgeClasses = resolvedTheme === 'dark'
    ? "bg-blue-900/50 text-blue-300"
    : "bg-blue-100 text-blue-800";
    
  const separatorClasses = resolvedTheme === 'dark'
    ? "bg-gray-700"
    : "";
  
  const fetchProfileStats = async () => {
    try {
      setIsLoadingStats(true)
      
      // Fetch forms data
      const response = await fetch('/api/forms')
      if (!response.ok) throw new Error('Failed to fetch forms data')
      
      const forms = await response.json()
      
      // Set actual form count
      setFormCount(Array.isArray(forms) ? forms.length : 0)
      
      // Calculate total submissions across all forms
      let totalSubmissions = 0
      if (Array.isArray(forms)) {
        forms.forEach(form => {
          if (form.submissions && Array.isArray(form.submissions)) {
            totalSubmissions += form.submissions.length
          }
        })
      }
      
      setSubmissionCount(totalSubmissions)
    } catch (error) {
      console.error('Error fetching profile stats:', error)
      toast({
        title: "Error loading profile statistics",
        description: "Could not load your form and submission counts.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingStats(false)
    }
  }
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user) {
      setProfile({
        name: session.user.name || '',
        email: session.user.email || '',
      })
      
      // Fetch real data instead of using hardcoded values
      fetchProfileStats()
    }
  }, [status, session, router])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      // Simulating an API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved."
      })
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }
  
  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-6 ${pageBackgroundClasses} min-h-screen`}>
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
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className={cardClasses}>
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className={`h-24 w-24 border-4 ${avatarClasses}`}>
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback className={avatarFallbackClasses}>
                  {session?.user?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-2">{session?.user?.name}</CardTitle>
              <CardDescription className={descriptionClasses}>{session?.user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileSpreadsheet className={`h-4 w-4 mr-2 ${iconClasses}`} />
                  <span className="text-sm">Forms</span>
                </div>
                <Badge className={badgeClasses}>
                  {isLoadingStats ? '...' : formCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className={`h-4 w-4 mr-2 ${iconClasses}`} />
                  <span className="text-sm">Submissions</span>
                </div>
                <Badge className={badgeClasses}>
                  {isLoadingStats ? '...' : submissionCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="general">
            <TabsList className={`grid grid-cols-2 rounded-xl p-1 ${tabsListClasses} space-x-2`}>
              <TabsTrigger 
                value="general" 
                className={`flex items-center justify-center gap-2 rounded-md py-2 transition-colors focus:outline-none focus:ring-2 ${tabsTriggerClasses}`}
              >
                <User className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className={`flex items-center justify-center gap-2 rounded-md py-2 transition-colors focus:outline-none focus:ring-2 ${tabsTriggerClasses}`}
              >
                <Award className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-4">
              <Card className={cardClasses}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className={descriptionClasses}>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={profile.name} 
                      onChange={handleInputChange} 
                      disabled
                      className={inputClasses}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      value={profile.email} 
                      onChange={handleInputChange}
                      disabled
                      className={inputClasses}
                    />
                    <p className={`text-xs ${helperTextClasses}`}>Email cannot be changed (Google account)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="mt-4">
              <Card className={cardClasses}>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription className={descriptionClasses}>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Authentication Method</Label>
                    <div className={`flex items-center border rounded-md p-3 ${authMethodBgClasses}`}>
                      <span>Google Account</span>
                      <Badge className={`ml-auto ${blueBadgeClasses}`}>Connected</Badge>
                    </div>
                  </div>
                  
                  <Separator className={`my-4 ${separatorClasses}`} />
                  
                  <div>
                    <h3 className="font-medium mb-2">Data Privacy</h3>
                    <p className={`text-sm ${helperTextClasses} mb-4`}>
                      Control how your data is used across Formix services
                    </p>
                    {/* Privacy controls would go here */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}