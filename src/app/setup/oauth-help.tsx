'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export function GoogleOAuthHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  
  return (
    <div className="mt-4">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start"
        type="button"
      >
        <HelpCircle className="mr-2 h-4 w-4" />
        How to set up Google OAuth credentials
      </Button>
      
      {isOpen && (
        <div className="mt-4 p-4 border rounded-md">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="step1">
              <AccordionTrigger>1. Create a Google Cloud Project</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                  <li>Click on the project dropdown at the top and select "New Project"</li>
                  <li>Enter a name for your project and click "Create"</li>
                  <li>Wait for the project to be created and then select it</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="step2">
              <AccordionTrigger>2. Configure the OAuth Consent Screen</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>In the left menu, go to "APIs & Services" &gt; "OAuth consent screen"</li>
                  <li>Select "External" user type and click "Create"</li>
                  <li>Fill in the required fields (App name, User support email, Developer contact information)</li>
                  <li>Click "Save and Continue"</li>
                  <li>Add the scopes: <code>.../auth/userinfo.email</code>, <code>.../auth/userinfo.profile</code>, and <code>.../auth/spreadsheets</code></li>
                  <li>Complete the rest of the setup and click "Save and Continue"</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="step3">
              <AccordionTrigger>3. Create OAuth Client ID</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>In the left menu, go to "APIs & Services" &gt; "Credentials"</li>
                  <li>Click "Create Credentials" &gt; "OAuth client ID"</li>
                  <li>Select "Web application" as the Application type</li>
                  <li>Add a name for your client</li>
                  <li>Under "Authorized JavaScript origins", add: <code className="bg-gray-100 px-1 py-0.5 rounded">{baseUrl}</code></li>
                  <li>Under "Authorized redirect URIs", add: <code className="bg-gray-100 px-1 py-0.5 rounded">{baseUrl}/api/auth/callback/google</code></li>
                  <li>Click "Create"</li>
                  <li>Copy the Client ID and Client Secret to use in the setup wizard</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="step4">
              <AccordionTrigger>4. Enable Google Sheets API</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>In the left menu, go to "APIs & Services" &gt; "Library"</li>
                  <li>Search for "Google Sheets API"</li>
                  <li>Select it and click "Enable"</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}