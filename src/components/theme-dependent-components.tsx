'use client'

import Link from "next/link";
import { FileSpreadsheet, PlusCircle, Inbox, Award, Grid, ListFilter, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CardLayout from "@/components/card-layout";
import LeaderboardLayout from "@/components/leaderboard-layout";
import AchievementLayout from "@/components/achievement-layout";
import { Form } from "@/lib/types";
import { useTheme } from "@/providers/theme-provider";

// StatCard Component - now with theme support
function StatCard({ icon, title, value, delta, progress, className }: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  delta?: string;
  progress?: number;
  className?: string;
}) {
  const { theme, resolvedTheme } = useTheme();
  
  const cardClasses = resolvedTheme === 'dark' 
    ? `border-transparent shadow-sm hover:shadow-md transition-shadow bg-gray-800 text-gray-100 ${className}` 
    : `border-transparent shadow-sm hover:shadow-md transition-shadow bg-white ${className}`;
  
  return (
    <Card className={cardClasses}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          {/* Icon and Title */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-white ${
              resolvedTheme === 'dark' 
                ? 'bg-gradient-to-br from-green-600 to-emerald-500'
                : 'bg-gradient-to-br from-green-500 to-emerald-400'
            }`}>
              {icon}
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wide">
              {title}
            </CardTitle>
          </div>

          {/* Value and Delta */}
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{value}</div>
            {delta && (
              <span
                className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                  delta.startsWith("+")
                    ? resolvedTheme === 'dark' ? "text-green-400 bg-green-900/50" : "text-green-600 bg-green-100"
                    : resolvedTheme === 'dark' ? "text-red-400 bg-red-900/50" : "text-red-600 bg-red-100"
                }`}
              >
                {delta.startsWith("+") ? (
                  <ArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-1" />
                )}
                {delta.replace("+", "")}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className={`w-full rounded-full h-2 ${resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Pagination component - with theme support
function Pagination({ 
  currentPage, 
  totalPages, 
  layout 
}: { 
  currentPage: number; 
  totalPages: number;
  layout?: string;
}) {
  const { theme, resolvedTheme } = useTheme();
  
  const paginationButtonClasses = resolvedTheme === 'dark'
    ? "px-2 py-1 border-gray-700 text-gray-300 hover:bg-gray-700"
    : "px-2 py-1";
    
  const activeButtonClasses = resolvedTheme === 'dark'
    ? "bg-green-700 text-white"
    : "bg-green-600 text-white";
    
  const inactiveButtonClasses = resolvedTheme === 'dark'
    ? "text-gray-300 border-gray-700 hover:bg-gray-700"
    : "text-gray-700";
  
  return (
    <div className="flex items-center justify-center mt-8 gap-2">
      <Button 
        asChild
        variant="outline" 
        size="sm"
        disabled={currentPage <= 1}
        className={paginationButtonClasses}
      >
        <Link href={`?page=${currentPage - 1}${layout ? `&layout=${layout}` : ''}`}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            asChild
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            className={`px-2 py-1 w-8 h-8 ${
              page === currentPage 
                ? activeButtonClasses 
                : inactiveButtonClasses
            }`}
          >
            <Link href={`?page=${page}${layout ? `&layout=${layout}` : ''}`}>
              {page}
            </Link>
          </Button>
        ))}
      </div>

      <Button 
        asChild
        variant="outline" 
        size="sm"
        disabled={currentPage >= totalPages}
        className={paginationButtonClasses}
      >
        <Link href={`?page=${currentPage + 1}${layout ? `&layout=${layout}` : ''}`}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

// Main Dashboard UI component with theme support
export default function ThemeDependentComponents({
  data
}: {
  data: {
    forms: Form[];
    totalFormsCount: number;
    archivedCount: number;
    totalSubmissions: number;
    achievementsEarned: number;
    achievementThresholds: number[];
    formsTarget: number;
    submissionsTarget: number;
    currentPage: number;
    totalPages: number;
    activeLayout: string;
    userName: string;
  }
}) {
  const { theme, resolvedTheme } = useTheme();
  
  const {
    forms,
    totalFormsCount,
    archivedCount,
    totalSubmissions,
    achievementsEarned,
    achievementThresholds,
    formsTarget,
    submissionsTarget,
    currentPage,
    totalPages,
    activeLayout,
    userName
  } = data;
  
  // Dynamic styles based on theme
  const containerClasses = resolvedTheme === 'dark' 
    ? "p-4 sm:p-8 max-w-7xl mx-auto bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100" 
    : "p-4 sm:p-8 max-w-7xl mx-auto bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen";
    
  const headingTextClasses = resolvedTheme === 'dark' ? "text-3xl font-bold text-gray-100 md:text-4xl leading-tight" : "text-3xl font-bold text-gray-800 md:text-4xl leading-tight";
  const subheadingTextClasses = resolvedTheme === 'dark' ? "text-gray-400 mt-2" : "text-gray-600 mt-2";
  
  const badgeClasses = resolvedTheme === 'dark'
    ? "bg-green-900/60 text-green-300"
    : "bg-green-100 text-green-800";
    
  const buttonOutlineClasses = resolvedTheme === 'dark'
    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
    : "";
    
  const primaryButtonClasses = resolvedTheme === 'dark'
    ? "bg-green-700 hover:bg-green-600 text-white"
    : "bg-green-600 hover:bg-green-700 text-white";
    
  const layoutButtonActiveClasses = resolvedTheme === 'dark'
    ? "bg-green-700 text-white"
    : "bg-green-600 text-white";
    
  const layoutButtonInactiveClasses = resolvedTheme === 'dark'
    ? "text-gray-300 hover:bg-gray-700"
    : "";
    
  const emptyStateClasses = resolvedTheme === 'dark'
    ? "text-center py-12 bg-gray-800/50 rounded-lg"
    : "text-center py-12 bg-gray-50 rounded-lg";
    
  const emptyStateTitleClasses = resolvedTheme === 'dark'
    ? "mt-4 text-lg font-medium text-gray-200"
    : "mt-4 text-lg font-medium text-gray-900";
    
  const emptyStateDescClasses = resolvedTheme === 'dark'
    ? "mt-2 text-sm text-gray-400"
    : "mt-2 text-sm text-gray-500";
  
  return (
    <div className={containerClasses}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-4">
        <div>
          <h1 className={headingTextClasses}>
            Welcome back, {userName}!
          </h1>
          <p className={subheadingTextClasses}>
            Manage your forms and submissions easily.
          </p>
          <div className="flex flex-wrap gap-2 text-gray-600 dark:text-gray-400 mt-2">
            <Badge className={badgeClasses}>
              {totalFormsCount} Active Forms
            </Badge>
            <span className="text-sm">Total Submissions: {totalSubmissions}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" className={buttonOutlineClasses}>
            <Link href="/dashboard/archived" className="text-sm">
              View Archived ({archivedCount})
            </Link>
          </Button>
          <Button asChild className={primaryButtonClasses}>
            <Link href="/forms/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Form
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 sm:mb-8">
        <StatCard
          icon={<FileSpreadsheet className="text-white" />}
          title="Total Forms"
          value={totalFormsCount}
          progress={(totalFormsCount / formsTarget) * 100}
        />
        <StatCard
          icon={<Inbox className="text-white" />}
          title="Submissions"
          value={totalSubmissions}
          progress={Math.min((totalSubmissions / submissionsTarget) * 100, 100)}
        />
        <StatCard
          icon={<Award className="text-white" />}
          title="Achievements"
          value={achievementsEarned}
          progress={(achievementsEarned / achievementThresholds.length) * 100}
        />
      </div>

      {/* Layout Selector */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between">
          <h2 className={resolvedTheme === 'dark' ? "text-xl font-bold text-gray-100 md:text-2xl" : "text-xl font-bold text-gray-800 md:text-2xl"}>
            <span className="md:hidden">Your Forms</span>
            <span className="hidden md:inline">Form Layouts</span>
          </h2>
          <div className={`hidden md:flex flex-wrap gap-2 rounded-lg p-1 ${resolvedTheme === 'dark' ? 'bg-gray-800/80' : 'bg-green-50'}`}>
            <Button
              asChild
              variant="ghost"
              className={`w-full sm:w-auto gap-2 ${
                activeLayout === "card" 
                  ? layoutButtonActiveClasses 
                  : layoutButtonInactiveClasses
              }`}
            >
              <Link href={`?layout=card${currentPage > 1 ? `&page=${currentPage}` : ''}`}>
                <Grid className="w-4 h-4" />
                Card View
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`w-full sm:w-auto gap-2 ${
                activeLayout === "leaderboard" 
                  ? layoutButtonActiveClasses 
                  : layoutButtonInactiveClasses
              }`}
            >
              <Link href={`?layout=leaderboard${currentPage > 1 ? `&page=${currentPage}` : ''}`}>
                <ListFilter className="w-4 h-4" />
                Leaderboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`w-full sm:w-auto gap-2 ${
                activeLayout === "achievement" 
                  ? layoutButtonActiveClasses 
                  : layoutButtonInactiveClasses
              }`}
            >
              <Link href={`?layout=achievement${currentPage > 1 ? `&page=${currentPage}` : ''}`}>
                <Award className="w-4 h-4" />
                Achievements
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {/* Display message when no forms are available */}
          {forms.length === 0 && (
            <div className={emptyStateClasses}>
              <Inbox className={`mx-auto h-12 w-12 ${resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              <h3 className={emptyStateTitleClasses}>No forms available</h3>
              <p className={emptyStateDescClasses}>
                {totalFormsCount > 0 
                  ? "You've reached the end of your forms. Go back to previous pages."
                  : "Create your first form to get started."}
              </p>
              <div className="mt-6">
                <Button asChild className={primaryButtonClasses}>
                  <Link href="/forms/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Form
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* On mobile, only show CardLayout regardless of activeLayout */}
          {forms.length > 0 && (
            <>
              <div className="md:hidden">
                <CardLayout forms={forms} />
              </div>
              
              {/* On medium and larger screens, show the selected layout */}
              <div className="hidden md:block">
                {activeLayout === "card" && <CardLayout forms={forms} />}
                {activeLayout === "leaderboard" && <LeaderboardLayout forms={forms} />}
                {activeLayout === "achievement" && <AchievementLayout forms={forms} />}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              layout={activeLayout}
            />
          )}
        </div>
      </div>
    </div>
  );
}