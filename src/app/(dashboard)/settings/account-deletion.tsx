'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AccountDeletion() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete account");
      }
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      
      // Sign out and redirect to home page
      await signOut({ redirect: false });
      
      // Force redirect to homepage
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfirmStep(false);
    }
  };

  return (
    <div className="mt-10 border-t pt-8 border-gray-200 dark:border-gray-700">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={`flex justify-between w-full ${resolvedTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="flex items-center">
              <Trash2 className="h-4 w-4 mr-2 text-red-500" />
              Advanced Account Settings
            </span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-4">
          <Card className={`border ${resolvedTheme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-red-600 text-base">Delete Account</CardTitle>
              <CardDescription className="text-xs">
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            
            {!confirmStep ? (
              <CardFooter className="pt-2">
                <Button 
                  variant="outline" 
                  className={`flex items-center gap-2 text-xs ${resolvedTheme === 'dark' ? 'text-red-400 hover:text-red-300 border-red-900/30 hover:bg-red-900/20' : 'text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50'}`}
                  onClick={() => setConfirmStep(true)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete My Account
                </Button>
              </CardFooter>
            ) : (
              <CardContent className="space-y-4 pt-2">
                <Alert 
                  variant="destructive" 
                  className={`${resolvedTheme === 'dark' ? 'bg-red-900/20 border-red-900 text-red-400' : ''}`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning: This action is permanent</AlertTitle>
                  <AlertDescription className="text-sm">
                    <p>Deleting your account will:</p>
                    <ol className="list-decimal pl-5 mt-2">
                      <li>Remove all your personal information</li>
                      <li>Delete all your forms and related data</li>
                      <li>Revoke all Google OAuth connections</li>
                      <li>Permanently remove your account from our systems</li>
                    </ol>
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2 justify-end w-full">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1" 
                    onClick={() => setConfirmStep(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    className={`flex-1 ${resolvedTheme === 'dark' ? 'bg-red-900 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'}`}
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Confirm Deletion"
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}