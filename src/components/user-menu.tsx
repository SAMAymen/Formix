'use client'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  LogOut,
  User,
  Settings,
  LifeBuoy,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/providers/theme-provider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function UserMenu({ user }: { user: { name?: string; email?: string; image?: string } }) {
  const { theme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Theme-specific styles
  const avatarBorderClasses = resolvedTheme === 'dark'
    ? "border-emerald-700/50"
    : "border-emerald-100/50";
  
  const avatarFallbackClasses = resolvedTheme === 'dark'
    ? "bg-emerald-800 font-medium text-emerald-300"
    : "bg-emerald-100 font-medium text-emerald-700";
  
  const menuContentClasses = resolvedTheme === 'dark'
    ? "bg-gray-800 border-gray-700"
    : "";
  
  const separatorClasses = resolvedTheme === 'dark'
    ? "bg-gray-700"
    : "bg-gray-100";
  
  const nameClasses = resolvedTheme === 'dark'
    ? "font-medium truncate text-gray-200"
    : "font-medium truncate";
  
  const emailClasses = resolvedTheme === 'dark'
    ? "text-sm text-gray-400 truncate"
    : "text-sm text-gray-500 truncate";
  
  const menuItemClasses = resolvedTheme === 'dark'
    ? "rounded-lg px-3 py-2.5 hover:bg-emerald-900/50 text-gray-200"
    : "rounded-lg px-3 py-2.5 hover:bg-emerald-50";
  
  const iconClasses = resolvedTheme === 'dark'
    ? "h-4 w-4 mr-3 text-emerald-400"
    : "h-4 w-4 mr-3 text-emerald-600";
  
  const logoutClasses = resolvedTheme === 'dark'
    ? "rounded-lg px-3 py-2.5 hover:bg-red-900/50 text-red-400 hover:text-red-300"
    : "rounded-lg px-3 py-2.5 hover:bg-red-50 text-red-600 hover:text-red-700";

  // Custom sign-out handler that uses our API endpoint
  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // First, clear tokens with our custom endpoint
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        console.log("Successfully cleared Google tokens");
      } else {
        console.warn("Failed to clear tokens, proceeding with regular sign out");
      }
      
      // Then use NextAuth signOut
      await signOut({ redirect: false });
      
      // Redirect to login page
      window.location.href = "/login";
      
    } catch (error) {
      console.error("Error during sign-out:", error);
      
      // Fallback to standard signOut if our approach fails
      toast({
        title: "Sign out issue",
        description: "There was an issue signing out. Trying alternative method.",
        variant: "destructive",
      });
      
      signOut({ callbackUrl: "/login" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="rounded-full p-0 h-9 w-9 hover:scale-105 transition-transform"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className={`h-9 w-9 border-2 ${avatarBorderClasses}`}>
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className={avatarFallbackClasses}>
                {user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className={`w-64 rounded-xl shadow-lg ${menuContentClasses}`}
        asChild
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Profile Section */}
          <DropdownMenuLabel className="flex items-center gap-3 p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} />
              <AvatarFallback className={resolvedTheme === 'dark' ? "bg-emerald-800" : "bg-emerald-100"}>
                {user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className={nameClasses}>{user.name}</span>
              {user.email && (
                <span className={emailClasses}>{user.email}</span>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className={separatorClasses} />

          {/* Main Menu Items */}
          <div className="p-2">
            <DropdownMenuItem asChild className={menuItemClasses}>
              <Link href="/profile">
                <User className={iconClasses} />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className={menuItemClasses}>
              <Link href="/settings">
                <Settings className={iconClasses} />
                Settings
              </Link>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className={separatorClasses} />

          {/* Footer Section */}
          <div className="p-2">
            <DropdownMenuItem asChild className={menuItemClasses}>
              <Link href="/support">
                <LifeBuoy className={iconClasses} />
                Support
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={handleSignOut}
              className={`${logoutClasses} ${isLoggingOut ? 'opacity-70 pointer-events-none' : ''}`}
            >
              <LogOut className="h-4 w-4 mr-3" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </DropdownMenuItem>
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}