// app/forms/[formId]/components/integration/ScriptLoading.tsx
import { Loader2 } from "lucide-react";

export function ScriptLoading() {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
        <span className="text-yellow-800">Preparing script deployment...</span>
      </div>
    </div>
  );
}
