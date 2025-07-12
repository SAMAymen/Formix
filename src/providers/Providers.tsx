"use client";

import { NextAuthProvider } from "@/providers/session-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      {children}
    </NextAuthProvider>
  );
}