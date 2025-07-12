// app/forms/[formId]/components/tabs/FormTabs.tsx
import { Button } from "@/components/ui/button";
import { Settings, Link2 } from "lucide-react";
import { useTheme } from "@/providers/theme-provider"; // Add this import

interface FormTabsProps {
  activeTab: "build" | "settings";
  onTabChange: (tab: "build" | "settings") => void;
  children: React.ReactNode;
  theme?: string; // Keep theme prop for backwards compatibility
}

export function FormTabs({
  activeTab,
  onTabChange,
  children,
  theme: themeProp = "light", // Rename to themeProp for clarity
}: FormTabsProps) {
  // Add this to get system theme preferences
  const { resolvedTheme } = useTheme();
  // Use resolvedTheme with fallback to the prop
  const actualTheme = resolvedTheme || themeProp;

  // Update theme-specific styles to use actualTheme
  const borderClasses =
    actualTheme === "dark" ? "border-gray-700" : "border-green-100";

  const activeTabClasses =
    actualTheme === "dark"
      ? "bg-emerald-900/30 text-emerald-300"
      : "bg-green-50 text-green-700";

  const inactiveTabClasses =
    actualTheme === "dark"
      ? "text-gray-300 hover:bg-gray-800 hover:text-gray-200"
      : "hover:bg-gray-50";

  return (
    <div className="space-y-6">
      <div className={`flex gap-2 border-b ${borderClasses} pb-4`}>
        <Button
          variant={activeTab === "build" ? "secondary" : "ghost"}
          className={
            activeTab === "build" ? activeTabClasses : inactiveTabClasses
          }
          onClick={() => onTabChange("build")}
        >
          <Settings className="w-4 h-4 mr-2" />
          Form Builder
        </Button>
        <Button
          variant={activeTab === "settings" ? "secondary" : "ghost"}
          className={
            activeTab === "settings" ? activeTabClasses : inactiveTabClasses
          }
          onClick={() => onTabChange("settings")}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Integration
        </Button>
      </div>
      {children}
    </div>
  );
}
