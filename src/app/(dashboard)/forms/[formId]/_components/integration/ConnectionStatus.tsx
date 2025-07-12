// app/forms/[formId]/components/integration/ConnectionStatus.tsx
import { CheckCircle } from "lucide-react";

interface ConnectionStatusProps {
  theme?: string; // Add theme prop
}

export function ConnectionStatus({ theme = 'light' }: ConnectionStatusProps) {
  // Theme-specific styles
  const containerClasses = theme === 'dark'
    ? "border-emerald-800 bg-emerald-900/30 shadow-md"
    : "border-green-200 bg-green-50 shadow-sm";
    
  const iconClasses = theme === 'dark'
    ? "text-emerald-400"
    : "text-green-600";
    
  const titleClasses = theme === 'dark'
    ? "text-emerald-300"
    : "text-green-800";
    
  const descriptionClasses = theme === 'dark'
    ? "text-emerald-400/80"
    : "text-green-700";
  
  return (
    <div className={`border rounded-lg p-4 ${containerClasses}`}>
      <div className="flex items-center gap-3">
        <CheckCircle className={`w-6 h-6 ${iconClasses}`} />
        <div>
          <p className={`font-semibold ${titleClasses}`}>Connected to Google Sheets!</p>
          <p className={`text-sm ${descriptionClasses}`}>Your form is successfully linked.</p>
        </div>
      </div>
    </div>
  );
}