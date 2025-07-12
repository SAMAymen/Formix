'use client'

import { Button } from "@/components/ui/button";
import { Form } from "@/lib/types";
import Link from "next/link";
import { Undo2 } from "lucide-react";
import CardLayout from "@/components/card-layout";
import { useTheme } from "@/providers/theme-provider";

export function ArchivedPageClient({ forms }: { forms: Form[] }) {
  const { resolvedTheme } = useTheme();

  // Theme-specific styles
  const pageBackgroundClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-b from-gray-900 to-gray-800"
    : "bg-gradient-to-b from-green-50 to-emerald-50";
  
  const headingClasses = resolvedTheme === 'dark'
    ? "text-gray-200"
    : "text-gray-800";
  
  const backButtonClasses = resolvedTheme === 'dark'
    ? "text-green-400 hover:bg-gray-800 border-gray-700"
    : "text-green-700 hover:bg-green-50 border-green-100";

  return (
    <div className={`p-8 max-w-7xl mx-auto ${pageBackgroundClasses} min-h-screen`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${headingClasses}`}>Archived Forms</h1>
        <Button asChild variant="outline" className={backButtonClasses}>
          <Link href="/dashboard">
            <Undo2 className="mr-2 h-4 w-4" />
            Back to Active Forms
          </Link>
        </Button>
      </div>

      <CardLayout forms={forms} showRestore={true} />
    </div>
  );
}