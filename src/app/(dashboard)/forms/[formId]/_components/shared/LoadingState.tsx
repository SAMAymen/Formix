// app/forms/[formId]/components/shared/LoadingState.tsx
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex items-center justify-center">
      <div className="flex items-center gap-2 text-green-700">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading form...</span>
      </div>
    </div>
  );
}