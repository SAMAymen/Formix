// components/card-layout.tsx
"use client";

import Link from "next/link";
import { FileSpreadsheet, Award, Trophy, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/providers/theme-provider";

const getLevelInfo = (submissionsCount: number) => {
  if (submissionsCount > 100) return { level: 5, icon: <Trophy className="text-yellow-500" /> };
  if (submissionsCount > 50) return { level: 4, icon: <Flame className="text-orange-500" /> };
  if (submissionsCount > 20) return { level: 3, icon: <Star className="text-blue-500" /> };
  if (submissionsCount > 5) return { level: 2, icon: <Award className="text-green-500" /> };
  return { level: 1, icon: <Award className="text-gray-500" /> };
};

export default function CardLayout({ forms, showRestore = false }: { forms: Form[]; showRestore?: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const { resolvedTheme } = useTheme()

  const handleRestore = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/restore`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'Form restored successfully',
          description: 'The form is now back in your active forms list'
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: 'Restore failed',
        variant: 'destructive'
      })
    }
  }

  // Theme-based styles
  const cardClasses = resolvedTheme === 'dark'
    ? "border-gray-700 shadow-sm hover:shadow-md bg-gray-800 transition-all"
    : "border-green-50 shadow-sm hover:shadow-md transition-all";
    
  const cardHeaderClasses = resolvedTheme === 'dark'
    ? "pb-3"
    : "pb-3";
    
  const iconBgClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-br from-green-900/30 to-emerald-900/50"
    : "bg-gradient-to-br from-green-50 to-emerald-50";
    
  const iconClasses = resolvedTheme === 'dark'
    ? "text-green-400"
    : "text-green-600";
    
  const cardTitleClasses = resolvedTheme === 'dark'
    ? "text-gray-200"
    : "text-gray-800";
    
  const submissionBadgeClasses = resolvedTheme === 'dark'
    ? "bg-green-900/40 text-green-300 border-green-800"
    : "bg-green-50 text-green-700 border-green-200";
    
  const levelBadgeClasses = resolvedTheme === 'dark'
    ? "bg-blue-900/40 text-blue-300 border-blue-800"
    : "bg-blue-50 text-blue-700 border-blue-200";

  const restoreButtonClasses = resolvedTheme === 'dark'
    ? "w-full bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 border-blue-800"
    : "w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";
    
  const editButtonClasses = resolvedTheme === 'dark'
    ? "w-full border-gray-700 hover:bg-gray-700 text-gray-200"
    : "w-full border-gray-200 hover:bg-gray-50";
    
  const analyticsButtonClasses = resolvedTheme === 'dark'
    ? "w-full bg-green-900/30 text-green-300 hover:bg-green-800/50"
    : "w-full bg-green-50 text-green-700 hover:bg-green-100";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {forms.map((form) => {
        const { level, icon } = getLevelInfo(form.submissions?.length ?? 0);
        return (
          <Card key={form.id} className={cardClasses}>
            <CardHeader className={cardHeaderClasses}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-md ${iconBgClasses} flex items-center justify-center`}>
                  <FileSpreadsheet className={`w-5 h-5 ${iconClasses}`} />
                </div>
                <div className="flex flex-col">
                  <CardTitle className={`${cardTitleClasses} text-base`}>{form.title}</CardTitle>
                  <span className={resolvedTheme === 'dark' ? "text-xs text-gray-400" : "text-xs text-gray-500"}>
                    Updated {form.updatedAt ? new Date(form.updatedAt).toLocaleDateString('en-US') : 'N/A'}
                  </span>
                </div>
                <div className="ml-auto flex items-center">
                  {icon}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline" className={submissionBadgeClasses}>
                  {form.submissions?.length ?? 0} Submissions
                </Badge>
                <Badge className={levelBadgeClasses}>
                  Level {level}
                </Badge>
              </div>
            </CardContent>

            <CardFooter className="pt-0 gap-2">
              {showRestore ? (
                <Button
                  variant="outline"
                  className={restoreButtonClasses}
                  onClick={() => handleRestore(form.id)}
                >
                  Restore Form
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className={editButtonClasses} 
                    asChild
                  >
                    <Link href={`/forms/${form.id}`}>Edit Form</Link>
                  </Button>
                  <Button variant="secondary" 
                    className={analyticsButtonClasses} 
                    asChild
                  >
                    <Link href={`/submissions/${form.id}`}>View Analytics</Link>
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}