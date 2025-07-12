// src/providers/dashboard-theme-provider.tsx
"use client"

import { useRef, useEffect } from "react"
import { useTheme } from "./theme-provider"

type DashboardThemeProviderProps = {
  children: React.ReactNode
}

export function DashboardThemeProvider({
  children,
}: DashboardThemeProviderProps) {
  const { resolvedTheme, isMarketingRoute } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Apply theme classes to container instead of document
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Remove previous theme classes
    container.classList.remove("light", "dark");
    
    // For dashboard routes, apply theme locally
    if (!isMarketingRoute) {
      container.classList.add(resolvedTheme);
    }
    // For marketing routes, always use light theme
    else {
      container.classList.add("light");
    }
  }, [resolvedTheme, isMarketingRoute]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {children}
    </div>
  );
}