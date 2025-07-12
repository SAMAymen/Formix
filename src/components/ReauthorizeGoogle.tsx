'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';

export interface ReauthorizeGoogleProps {
  onClose?: () => void;
  returnUrl?: string;
}

export function ReauthorizeGoogle({ onClose, returnUrl }: ReauthorizeGoogleProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const handleReauthorize = () => {
    try {
      setIsRedirecting(true);
      
      // Save current location if not provided
      const returnPath = returnUrl || window.location.pathname;
      sessionStorage.setItem("returnUrl", returnPath);
      
      // Create state parameter with sheets flag
      const stateParam = encodeURIComponent(JSON.stringify({
        returnPath: returnPath,
        forSheets: true,
        reauthorization: true
      }));
      
      // Redirect to authorization endpoint
      router.push(`/api/auth/sheets-access?state=${stateParam}`);
    } catch (error) {
      console.error("Reauthorization redirect error:", error);
      setIsRedirecting(false);
    }
  };
  
  return (
    <div className="p-6 border rounded-lg bg-amber-50 dark:bg-amber-900/20">
      <div className="flex items-center gap-3 mb-3">
        <FileSpreadsheet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h3 className="font-medium">Google Sheets Authorization Expired</h3>
      </div>
      <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
        Your connection to Google Sheets has expired. This happens when the app isn't used for an extended period.
      </p>
      <div className="flex gap-3">
        <Button 
          onClick={handleReauthorize} 
          className="flex items-center gap-2"
          disabled={isRedirecting}
        >
          {isRedirecting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Reconnect to Google Sheets
            </>
          )}
        </Button>
        {onClose && (
          <Button variant="ghost" onClick={onClose} disabled={isRedirecting}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}