"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/lib/types";
import { TriangleAlert, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/providers/theme-provider"; // Add this import

interface DangerZoneProps {
  form: Form;
  theme?: string; // Keep theme prop for backwards compatibility
}

export function DangerZone({ form, theme: themeProp = 'light' }: DangerZoneProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Add this to get system theme preferences
  const { resolvedTheme } = useTheme();
  // Use resolvedTheme with fallback to the prop
  const actualTheme = resolvedTheme || themeProp;
  
  // Theme-specific styles - update to use actualTheme
  const cardClasses = isExpanded
    ? actualTheme === 'dark'
      ? "border-red-900 bg-red-900/20 shadow-md"
      : "border-red-200 bg-red-50 shadow-md"
    : actualTheme === 'dark'
      ? "border-gray-700 bg-gray-800"
      : "border-gray-200 bg-white";
      
  const titleClasses = isExpanded
    ? actualTheme === 'dark'
      ? "text-red-400"
      : "text-red-800"
    : actualTheme === 'dark'
      ? "text-gray-300"
      : "text-gray-600";
      
  const chevronClasses = actualTheme === 'dark'
    ? "text-gray-400"
    : "text-gray-500";
    
  const headingClasses = actualTheme === 'dark'
    ? "text-red-400"
    : "text-red-800";
    
  const badgeClasses = actualTheme === 'dark'
    ? "bg-red-900/40 text-red-400 border border-red-800"
    : "bg-red-100 text-red-800";
    
  const descriptionClasses = actualTheme === 'dark'
    ? "text-red-400/80"
    : "text-red-700";
    
  const buttonClasses = actualTheme === 'dark'
    ? "bg-red-900 hover:bg-red-800 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";

  const handleArchive = async () => {
    if (!form) return;
    if (confirm("Are you sure you want to archive this form?")) {
      try {
        const response = await fetch(`/api/forms/${form.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          toast({
            title: "Form archived successfully",
            description: "You can restore it from the archives anytime.",
          });
          router.push("/dashboard");
          router.refresh();
        }
      } catch (error) {
        toast({
          title: "Archive failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card 
      className={`border transition-all duration-200 rounded-md ${cardClasses}`}
    >
      <div 
        className="p-3 cursor-pointer flex items-center justify-between"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <h3 className={`text-lg font-medium ${titleClasses}`}>
            {isExpanded ? "Danger Zone" : "Advanced Options"}
          </h3>
        </div>
        {isExpanded ? 
          <ChevronUp className={`w-5 h-5 ${chevronClasses}`} /> : 
          <ChevronDown className={`w-5 h-5 ${chevronClasses}`} />
        }
      </div>

      {isExpanded && (
        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${headingClasses}`}>Danger Zone</h3>
            <Badge className={badgeClasses}>
              <TriangleAlert className="w-4 h-4 mr-1" />Critical
            </Badge>
          </div>
          <p className={`text-sm mb-4 ${descriptionClasses}`}>
            Archiving a form hides it from your active list (restorable anytime).
          </p>
          <Button
            className={`w-full ${buttonClasses}`}
            onClick={handleArchive}
          >
            Archive Form
          </Button>
        </CardContent>
      )}
    </Card>
  );
}