// app/forms/[formId]/components/sidebar/FormDetails.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet } from "lucide-react";
import { useTheme } from '@/providers/theme-provider'; // Add this import

interface FormDetailsProps {
  updatedAt: string;
  fieldsCount: number;
  theme?: string; // Keep theme prop for backwards compatibility
}

export function FormDetails({ updatedAt, fieldsCount, theme: themeProp = 'light' }: FormDetailsProps) {
  // Add this to get system theme preferences
  const { resolvedTheme } = useTheme();
  // Use resolvedTheme with fallback to the prop
  const actualTheme = resolvedTheme || themeProp;

  // Theme-specific styles - update to use actualTheme
  const cardClasses = actualTheme === 'dark'
    ? "border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg"
    : "border-green-200 bg-gradient-to-r from-green-50 to-white shadow-sm";
    
  const titleClasses = actualTheme === 'dark'
    ? "font-semibold text-emerald-400"
    : "font-semibold text-green-700";
    
  const badgeClasses = actualTheme === 'dark'
    ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800"
    : "bg-green-200 text-green-800";
    
  const textClasses = actualTheme === 'dark'
    ? "text-gray-300"
    : "text-gray-700";
    
  const labelClasses = actualTheme === 'dark'
    ? "font-medium text-gray-300"
    : "font-medium";
    
  return (
    <Card className={`rounded-lg hover:shadow-md transition-shadow ${cardClasses}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className={titleClasses}>Form Details</h3>
          <Badge className={badgeClasses}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            Form
          </Badge>
        </div>
        <div className={`flex items-center gap-6 text-sm ${textClasses}`}>
          <div>
            <p className={labelClasses}>Last Updated</p>
            <p>
              {updatedAt.includes("T")
                ? `${updatedAt.split("T")[0]} at ${
                    updatedAt.split("T")[1]?.split(".")[0] || ""
                  }`
                : updatedAt}
            </p>
          </div>
          <div>
            <p className={labelClasses}>Fields</p>
            <p>{fieldsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}