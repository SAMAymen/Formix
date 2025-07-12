"use client";

import { useTheme } from "@/providers/theme-provider";
import { UserMenu } from "@/components/user-menu";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

type DashboardClientWrapperProps = {
  children: React.ReactNode;
  user: {
    name?: string;
    image?: string;
  };
};

export function DashboardClientWrapper({
  children,
  user,
}: DashboardClientWrapperProps) {
  const { theme, resolvedTheme } = useTheme();
  // Add this to prevent flickering
  const [mounted, setMounted] = useState(false);

  // Only show the UI after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet, provide a skeleton layout with no theme-specific styling
  if (!mounted) {
    return (
      <div>
        <nav className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10"></div>
            <h1 className="text-xl font-bold invisible">Formix</h1>
          </div>
          <div></div>
        </nav>
        <main className="w-full min-h-[calc(100vh-73px)]">
          <div className="opacity-0">{children}</div>
        </main>
      </div>
    );
  }

  // Dynamic styles based on resolved theme (client side only)
  const actualTheme = resolvedTheme || theme;
  const navClasses =
    actualTheme === "dark"
      ? "border-b p-4 flex justify-between items-center bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700"
      : "border-b p-4 flex justify-between items-center bg-gradient-to-b from-green-50 to-emerald-50";

  const mainClasses =
    actualTheme === "dark"
      ? "flex-1 bg-gradient-to-b from-gray-900 to-gray-800 w-full flex justify-center min-h-[calc(100vh-73px)]"
      : "flex-1 bg-gradient-to-b from-green-50 to-emerald-50 w-full flex justify-center min-h-[calc(100vh-73px)]";

  const logoClasses =
    actualTheme === "dark"
      ? "text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
      : "text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent";

  return (
    <div>
      <nav className={navClasses}>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-md text-white">
            <Image
              src="/tryformix-logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="w-8 h-8 object-cover"
            />
          </div>
          <h1 className={logoClasses}>
            <Link href="/dashboard">Formix</Link>
          </h1>
        </div>
        <UserMenu user={user} />
      </nav>
      <main className={mainClasses}>
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
