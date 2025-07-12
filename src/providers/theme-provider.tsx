// src/providers/theme-provider.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { defaultBranding } from '@/config/branding'

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
  isMarketingRoute: boolean
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

// Keep this list in sync with theme.js
const DASHBOARD_ROUTES = [
  '/dashboard', 
  '/forms', 
  '/preview', 
  '/deploy', 
  '/settings', 
  '/profile', 
  '/support',
  '/submissions'
];

// Use configuration system for theming
const brandColors = {
  light: {
    primary: defaultBranding.colors.primary,
    secondary: defaultBranding.colors.secondary,
    // Other color mappings
  },
  dark: {
    primary: defaultBranding.colors.primary,
    // Darkened versions of brand colors
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light")
  const [isMarketingRoute, setIsMarketingRoute] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Effect to determine route type
  useEffect(() => {
    const path = window.location.pathname;
    const isDashboardRoute = DASHBOARD_ROUTES.some(route => path.startsWith(route));
    setIsMarketingRoute(!isDashboardRoute);
  }, []);

  // Effect to load theme from localStorage/API on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try localStorage first (fastest)
        const storedTheme = localStorage.getItem("theme") as Theme | null;
        if (storedTheme) {
          setTheme(storedTheme);
        } else {
          // Fall back to API for logged-in users
          const response = await fetch('/api/settings/theme');
          if (response.ok) {
            const data = await response.json();
            setTheme(data.theme as Theme);
            // Save to localStorage for future fast access
            localStorage.setItem("theme", data.theme);
          }
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsMounted(true);
      }
    };

    loadTheme();
  }, []);

  // Effect to resolve theme based on preferences
  useEffect(() => {
    if (!isMounted) return;
    
    // For marketing routes, always use light theme
    if (isMarketingRoute) {
      setResolvedTheme("light");
      return;
    }
    
    // For dashboard routes, use user preferences
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(theme as "dark" | "light");
    }
  }, [theme, isMounted, isMarketingRoute]);

  // Effect to apply theme to document root
  useEffect(() => {
    if (!isMounted) return;
    
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark");
    
    // For marketing routes, always add light theme
    if (isMarketingRoute) {
      root.classList.add("light");
      return;
    }
    
    // For dashboard routes, apply resolved theme
    root.classList.add(resolvedTheme);
    
    // Set data attribute for SSR
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme, isMounted, isMarketingRoute]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isMounted || theme !== "system" || isMarketingRoute) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      const newSystemTheme = mediaQuery.matches ? "dark" : "light";
      setResolvedTheme(newSystemTheme);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, isMounted, isMarketingRoute]);

  const value = {
    theme,
    resolvedTheme,
    isMarketingRoute,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      
      // Save theme to localStorage
      try {
        localStorage.setItem("theme", newTheme);
      } catch (error) {
        console.error("Error saving theme to localStorage:", error);
      }
      
      // Save theme to API for logged-in users
      try {
        fetch('/api/settings/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: newTheme })
        });
      } catch (error) {
        console.error("Error saving theme to API:", error);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};