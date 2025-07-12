"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const reason = searchParams.get("reason");
  const service = searchParams.get("service");
  const force = searchParams.get("force") === "true";
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.error) {
        const errorMessage =
          result.error === "AccessDenied" ? "AccessDenied" : "OAuthSignin";
        window.location.href = `/login/error?error=${errorMessage}`;
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      window.location.href = "/login/error?error=Default";
    } finally {
      setIsLoading(false);
    }
  };

  // If forced re-auth is required, render a specific message
  if (reason === "reauth" && service === "google") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <h1>Re-authentication Required</h1>
        <p>
          Your Google authentication has expired or requires re-authorization.
        </p>
        <Button
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() =>
            signIn("google", {
              callbackUrl: sessionStorage.getItem("returnUrl") || "/dashboard",
            })
          }
        >
          Reconnect with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Link href="/">
          <Image
            src="/tryformix-logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="w-24 h-24 object-cover"
          />
        </Link>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="relative p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100">
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-bl-full opacity-70 pointer-events-none"></div>

          <div className="text-center space-y-3 relative">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Formix
            </h1>
            <p className="text-gray-500 text-sm">
              Create and manage powerful forms with Google integration
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto mt-1 rounded-full"></div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                variant="destructive"
                className="bg-red-50 border border-red-100 text-red-800"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  {error === "AccessDenied"
                    ? "Account not authorized. Please use an approved Google account."
                    : "Authentication failed. Please try again."}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-6 relative">
            <Button
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md py-6"
              onClick={handleSignIn}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </span>
              )}
            </Button>
          </div>

          <div className="text-center text-xs text-gray-400 space-y-1 relative">
            <p>By continuing, you agree to our</p>
            <p>
              <a
                href="/legal"
                className="text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/legal"
                className="text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 text-xs text-gray-400 flex items-center gap-4"
      >
        <a href="#" className="hover:text-green-600 transition-colors">
          Help
        </a>
        <span>•</span>
        <a href="#" className="hover:text-green-600 transition-colors">
          Contact
        </a>
        <span>•</span>
        <a href="#" className="hover:text-green-600 transition-colors">
          About
        </a>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
