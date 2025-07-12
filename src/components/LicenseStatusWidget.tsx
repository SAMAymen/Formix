'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, CheckCircle, Globe } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LicenseStatusWidgetProps {
  licenseKey: string;
}

export function LicenseStatusWidget({ licenseKey }: LicenseStatusWidgetProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const domain = typeof window !== 'undefined' ? window.location.hostname : ''
  
  useEffect(() => {
    const checkLicense = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/license/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey, domain })
        })
        
        const data = await res.json()
        setStatus(data)
      } catch (error) {
        console.error('License check error:', error)
        toast({
          variant: "destructive",
          title: "License check failed",
          description: "Could not verify your license status"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (licenseKey) {
      checkLicense()
    }
  }, [licenseKey, domain, toast])
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            License Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          License Status
        </CardTitle>
        <CardDescription>
          {status?.isValid ? 'Your license is active and valid.' : 'There is an issue with your license.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Status</span>
            {status?.isValid ? (
              <Badge className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="destructive">Invalid</Badge>
            )}
          </div>
          
          {status?.expiresAt && (
            <div className="flex items-center justify-between">
              <span>Expires</span>
              <span>{new Date(status.expiresAt).toLocaleDateString()}</span>
            </div>
          )}
          
          {status?.restrictions?.maxForms && (
            <div className="flex items-center justify-between">
              <span>Form Limit</span>
              <span>{status.restrictions.maxForms === 9999 ? 'Unlimited' : status.restrictions.maxForms}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span>Domain</span>
            <div className="flex items-center">
              <Globe className="mr-1 h-4 w-4 text-gray-500" />
              <span>{domain}</span>
            </div>
          </div>
          
          {!status?.isValid && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">{status?.message || 'License validation failed'}</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Please update your license key in Settings or contact support.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <a href="/settings/license">Manage License</a>
        </Button>
      </CardFooter>
    </Card>
  )
}