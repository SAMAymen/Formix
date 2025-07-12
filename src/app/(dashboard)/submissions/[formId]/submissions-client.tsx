'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Download, ArrowLeft, Activity, Zap, Clock, Database, BarChart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useTheme } from '@/providers/theme-provider'

interface Field {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface FormWithSubmissions {
  id: string;
  title: string;
  fields: Field[];
  submissions: Array<{
    id: string;
    createdAt: Date;
    data: Record<string, any>;
  }>;
}

interface SubmissionsClientProps {
  formId: string;
  typedForm: FormWithSubmissions;
  exportData: (formData: FormData) => Promise<Response>;
}

function SubmissionChart({
  submissions,
  resolvedTheme
}: {
  submissions: FormWithSubmissions['submissions'],
  fields: Field[],
  resolvedTheme: string
}) {
  // Only show chart if there are submissions
  if (submissions.length === 0) return null;

  // Use useMemo to avoid recalculating on every render
  const chartData = useMemo(() => {
    // Create a map for the last 7 days with counts initialized to 0
    const last7Days = new Map();
    
    // Generate the last 7 days dates
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Format the date as YYYY-MM-DD
      const dateKey = date.toISOString().split('T')[0];
      // Store the formatted day name (e.g., "Mon", "Tue")
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.set(dateKey, { count: 0, day: dayName });
    }
    
    // Count submissions for each date
    for (const submission of submissions) {
      const submissionDate = new Date(submission.createdAt);
      const dateKey = submissionDate.toISOString().split('T')[0];
      
      if (last7Days.has(dateKey)) {
        const dayData = last7Days.get(dateKey);
        dayData.count++;
      }
    }
    
    // Convert to array format for rendering
    return Array.from(last7Days.values());
  }, [submissions]);

  // Get max count for scaling
  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  
  // Colors based on theme
  const barColor = resolvedTheme === 'dark' ? 'bg-emerald-700' : 'bg-green-500';
  const barHoverColor = resolvedTheme === 'dark' ? 'hover:bg-emerald-600' : 'hover:bg-green-600';
  const textColor = resolvedTheme === 'dark' ? 'text-emerald-400' : 'text-green-800';
  const emptyChartColor = resolvedTheme === 'dark' ? 'text-gray-600' : 'text-gray-400';

  // If there's no actual data in the past 7 days
  const hasData = chartData.some(day => day.count > 0);
  
  if (!hasData) {
    return (
      <div className="w-full h-64 flex items-center justify-center flex-col">
        <p className={`${emptyChartColor} text-sm mb-2`}>No submissions in the past 7 days</p>
        <p className={`${emptyChartColor} text-xs`}>Total submissions: {submissions.length}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 overflow-x-auto">
      <div className="flex items-end justify-between min-w-[300px] w-full h-full px-2 gap-1">
        {chartData.map((item, i) => {
          // Calculate bar height proportionally, minimum height 4px for visibility
          const percentage = (item.count / maxCount) * 100;
          const height = Math.max(percentage, item.count > 0 ? 4 : 0);
          
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-[30px] max-w-[80px] px-1">
              <div className={`text-xs ${textColor} mb-1 font-medium`}>{item.count}</div>
              <div
                className={`${item.count > 0 ? barColor : 'bg-gray-200'} rounded-t-md w-full transition-all ${item.count > 0 ? barHoverColor : ''}`}
                style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
              ></div>
              <div className={`text-xs ${textColor} mt-2 whitespace-nowrap`}>{item.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SubmissionsPageClient({ formId, typedForm, exportData }: SubmissionsClientProps) {
  const { theme, resolvedTheme } = useTheme();
  const [loadingFormat, setLoadingFormat] = useState<'csv' | 'json' | null>(null);
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this number as needed
  const fields = typedForm.fields;
  
  // Calculate pagination values
  const totalItems = typedForm.submissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current page submissions
  const currentSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return typedForm.submissions.slice(startIndex, endIndex);
  }, [typedForm.submissions, currentPage, itemsPerPage]);
  
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setLoadingFormat(format);
      
      const response = await fetch(`/api/forms/${formId}/export?format=${format}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export failed:', errorText);
        throw new Error(`Export failed: ${errorText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${typedForm.title}_submissions.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setLoadingFormat(null);
    }
  };
  
  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll back to the top of the table
    document.querySelector('.overflow-x-auto')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Style classes for pagination
  const paginationButtonClasses = resolvedTheme === 'dark'
    ? "border-gray-700 text-gray-300 hover:bg-gray-700"
    : "border-green-100 text-gray-700 hover:bg-green-50";
    
  const activeButtonClasses = resolvedTheme === 'dark'
    ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800"
    : "bg-green-600 text-white border-green-600 hover:bg-green-700";

  const submissionCount = typedForm.submissions.length;
  const latestSubmission = submissionCount > 0 ? typedForm.submissions[0].createdAt : null;

  const pageBackgroundClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-b from-gray-900 to-gray-800"
    : "bg-gradient-to-b from-green-50 to-emerald-50";

  const backButtonClasses = resolvedTheme === 'dark'
    ? "text-green-400 pl-0 hover:bg-gray-800"
    : "text-green-700 pl-0 hover:bg-green-50";
    
  const headingTextClasses = resolvedTheme === 'dark'
    ? "text-gray-200"
    : "text-gray-800";
    
  const iconColorClasses = resolvedTheme === 'dark'
    ? "text-emerald-500"
    : "text-green-600";
    
  const downloadButtonClasses = resolvedTheme === 'dark'
    ? "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600"
    : "bg-green-600 hover:bg-green-700 text-white";
    
  const cardClasses = resolvedTheme === 'dark'
    ? "border-gray-700 bg-gray-800/50 hover:shadow-lg transition-shadow"
    : "border-green-100 bg-green-50/50 hover:shadow-lg transition-shadow";
    
  const cardTitleClasses = resolvedTheme === 'dark'
    ? "text-gray-200"
    : "text-gray-800";
    
  const statCardTextClasses = resolvedTheme === 'dark'
    ? "text-emerald-400"
    : "text-green-800";
    
  const statValueClasses = resolvedTheme === 'dark'
    ? "text-emerald-300"
    : "text-green-700";
    
  const tableBorderClasses = resolvedTheme === 'dark'
    ? "border-gray-700"
    : "border-green-100";
    
  const tableHeadClasses = resolvedTheme === 'dark'
    ? "bg-gray-800 text-emerald-400 border-gray-700"
    : "bg-green-50 text-green-800 border-green-100";
    
  const tableRowHoverClasses = resolvedTheme === 'dark'
    ? "hover:bg-gray-700 border-gray-700"
    : "hover:bg-green-50 border-green-100";
    
  const tableCellClasses = resolvedTheme === 'dark'
    ? "border-gray-700 text-gray-300"
    : "border-green-100 text-gray-700";
    
  const badgeClasses = resolvedTheme === 'dark'
    ? "bg-emerald-900/50 text-emerald-400"
    : "bg-green-100 text-green-800";
    
  const blueBadgeClasses = resolvedTheme === 'dark'
    ? "bg-blue-900/50 text-blue-300 border-blue-800"
    : "bg-green-100 text-green-800 border-green-200";

  let weeklyGrowthBadge = null;
  if (submissionCount > 0) {
    weeklyGrowthBadge = (
      <Badge className={badgeClasses}>
        Recent trend
      </Badge>
    );
  }

  // Only show the trends card if there are submissions
  const showTrends = typedForm.submissions.length > 0;

  return (
    <div className={`p-8 max-w-7xl mx-auto space-y-6 ${pageBackgroundClasses} min-h-screen`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1">
          <Button variant="ghost" className={backButtonClasses} asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className={`text-2xl font-bold ${headingTextClasses} flex items-center gap-2`}>
            <Database className={`w-6 h-6 ${iconColorClasses}`} />
            {typedForm.title}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('csv')}
            disabled={loadingFormat === 'csv'}
            className={downloadButtonClasses}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {loadingFormat === 'csv' ? 'Preparing...' : 'Export as CSV'}
          </Button>

          <Button
            onClick={() => handleExport('json')}
            disabled={loadingFormat === 'json'}
            className={downloadButtonClasses}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {loadingFormat === 'json' ? 'Preparing...' : 'Export as JSON'}
          </Button>
        </div>
      </div>

      {showTrends && (
        <Card className={cardClasses}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg font-semibold ${cardTitleClasses} flex items-center gap-2`}>
              <BarChart className={`w-5 h-5 ${iconColorClasses}`} />
              Submission Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionChart 
              submissions={typedForm.submissions} 
              fields={fields} 
              resolvedTheme={resolvedTheme} 
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cardClasses}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={`text-sm ${statCardTextClasses} flex items-center gap-2`}>
                  <Zap className="w-4 h-4" />
                  Total Submissions
                </div>
                <div className={`text-2xl font-bold ${statValueClasses}`}>
                  {submissionCount}
                </div>
              </div>
              {weeklyGrowthBadge}
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={`text-sm ${statCardTextClasses} flex items-center gap-2`}>
                  <Activity className="w-4 h-4" />
                  Recent Activity
                </div>
                <div className={`text-lg font-medium ${statValueClasses}`}>
                  {latestSubmission ?
                    formatDistanceToNow(new Date(latestSubmission), { addSuffix: true }) :
                    'No activity'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={`text-sm ${statCardTextClasses} flex items-center gap-2`}>
                  <Clock className="w-4 h-4" />
                  Average Response
                </div>
                <div className={`text-lg font-medium ${statValueClasses}`}>
                  {submissionCount > 0 ? 'Calculating...' : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`${cardClasses} group relative overflow-hidden`}>
        <div className={`absolute right-0 top-0 w-32 h-32 ${resolvedTheme === 'dark' ? 'bg-emerald-700' : 'bg-green-500'} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg font-semibold ${cardTitleClasses}`}>
              Response Data
            </CardTitle>
            <Badge variant="outline" className={blueBadgeClasses}>
              Real-time Updates
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className={`overflow-x-auto rounded-lg border ${tableBorderClasses}`}>
            <Table className="min-w-[800px]">
              <TableHeader className={tableHeadClasses.split(' ')[0]}>
                <TableRow>
                  <TableHead className={`min-w-[180px] ${tableHeadClasses}`}>Submission Time</TableHead>
                  {fields.map((field) => (
                    <TableHead
                      key={field.id}
                      className={`${tableHeadClasses} border-r last:border-r-0 min-w-[180px]`}
                    >
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSubmissions.map((submission, index) => {
                  const data = submission.data
                  const isNew = index < 3 && currentPage === 1;

                  return (
                    <TableRow
                      key={submission.id}
                      className={`${tableRowHoverClasses} transition-colors border-b last:border-b-0`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {new Date(submission.createdAt).toLocaleDateString('en-US')}
                          {isNew && (
                            <Badge className={badgeClasses}>
                              New
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {fields.map((field) => (
                        <TableCell
                          key={field.id}
                          className={`${tableCellClasses} border-r last:border-r-0`}
                        >
                          <div className="max-w-[300px] truncate">
                            {field.type === 'radio' || field.type === 'checkbox' || field.type === 'multiselect'
                              ? (data?.[field.id] || data?.[field.label] || '-')
                              : (data?.[field.label]?.toString() || '-')}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
                {typedForm.submissions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={fields.length + 1}
                      className={`h-24 text-center ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      No submissions collected yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Add pagination controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700">
              <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${paginationButtonClasses} rounded-md`}
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                
                <div className="hidden sm:flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first page, last page, current page and pages around current
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant="outline"
                        size="sm"
                        className={`${pageNum === currentPage ? activeButtonClasses : paginationButtonClasses} w-9 h-9 rounded-md`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className={`${paginationButtonClasses} rounded-md`}
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {typedForm.submissions.length > 0 && (
        <div className={`text-center text-sm ${resolvedTheme === 'dark' ? 'text-emerald-400' : 'text-green-700'}`}>
          Showing page {currentPage} of {totalPages} • {totalItems} total submissions
        </div>
      )}
    </div>
  );
}

export function SubmissionsErrorClient() {
  const { theme, resolvedTheme } = useTheme();
  
  const pageBackgroundClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-b from-gray-900 to-gray-800"
    : "bg-gradient-to-b from-green-50 to-emerald-50";
    
  const errorCardClasses = resolvedTheme === 'dark'
    ? "border-red-900/50 bg-red-900/10"
    : "border-red-100 bg-red-50/50";
    
  const iconContainerClasses = resolvedTheme === 'dark'
    ? "text-red-400 bg-red-900/40"
    : "text-red-600 bg-red-100";
    
  const titleClasses = resolvedTheme === 'dark'
    ? "text-red-400"
    : "text-red-800";
    
  const descriptionClasses = resolvedTheme === 'dark'
    ? "text-red-300"
    : "text-red-700";
    
  const buttonClasses = resolvedTheme === 'dark'
    ? "border-red-800/50 text-red-400 hover:bg-red-900/30"
    : "border-red-200 text-red-700 hover:bg-red-50";
  
  return (
    <div className={`p-8 max-w-7xl mx-auto ${pageBackgroundClasses} min-h-screen flex items-center justify-center`}>
      <Card className={`${errorCardClasses} max-w-md`}>
        <CardContent className="pt-6">
          <div className={`mb-4 ${iconContainerClasses} mx-auto w-12 h-12 rounded-full flex items-center justify-center`}>
            <Database className="w-6 h-6" />
          </div>
          <h2 className={`text-xl font-bold ${titleClasses} mb-2`}>Data Load Error</h2>
          <p className={`${descriptionClasses} mb-4`}>
            We couldn't retrieve your submission data. Please try again later.
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