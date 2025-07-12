'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/providers/theme-provider";

export default function NotFound() {
  const { theme, resolvedTheme } = useTheme();
  
  // Theme-specific styles
  const pageBackgroundClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-b from-gray-900 to-gray-800"
    : "bg-gradient-to-b from-green-50 to-emerald-50";
    
  const cardClasses = resolvedTheme === 'dark'
    ? "border-amber-900/30 bg-amber-900/10"
    : "border-amber-100 bg-amber-50/50";
    
  const iconContainerClasses = resolvedTheme === 'dark'
    ? "text-amber-400 bg-amber-900/40"
    : "text-amber-600 bg-amber-100";
    
  const titleClasses = resolvedTheme === 'dark'
    ? "text-amber-400"
    : "text-amber-800";
    
  const descriptionClasses = resolvedTheme === 'dark'
    ? "text-amber-300/80"
    : "text-amber-700";
    
  const buttonClasses = resolvedTheme === 'dark'
    ? "border-amber-800/50 text-amber-400 hover:bg-amber-900/30"
    : "border-amber-200 text-amber-700 hover:bg-amber-50";

  return (
    <div className={`p-8 max-w-7xl mx-auto ${pageBackgroundClasses} min-h-screen flex items-center justify-center`}>
      <Card className={`${cardClasses} max-w-md`}>
        <CardContent className="pt-6">
          <div className={`mb-4 ${iconContainerClasses} mx-auto w-12 h-12 rounded-full flex items-center justify-center`}>
            <FileX className="w-6 h-6" />
          </div>
          <h2 className={`text-xl font-bold ${titleClasses} mb-2`}>Form Not Found</h2>
          <p className={`${descriptionClasses} mb-4`}>
            The form you're looking for doesn't exist or may have been deleted.
          </p>
          <Button
            variant="outline"
            className={buttonClasses}
            asChild
          >
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}