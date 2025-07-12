
// app/forms/[formId]/components/header/FormTitle.tsx
import { Input } from "@/components/ui/input";
import { FileSpreadsheet } from "lucide-react";

interface FormTitleProps {
  title: string;
  onChange: (title: string) => void;
}

export function FormTitle({ title, onChange }: FormTitleProps) {
  return (
    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <FileSpreadsheet className="w-6 h-6 text-green-600" />
      <Input
        value={title}
        onChange={(e) => onChange(e.target.value)}
        className="text-2xl font-bold border-none shadow-none bg-transparent p-0"
      />
    </h1>
  );
}