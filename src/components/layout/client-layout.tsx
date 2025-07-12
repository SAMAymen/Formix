// components/layout/client-layout.tsx
'use client';

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState({
    startBuilding: false,
    watchDemo: false,
    signUpFree: false,
    leaderboard: false,
    learnMore: false,
    achievementDetails: false,
    ctaStartBuilding: false
  });

  const router = useRouter();

  const handleNavigation = useCallback((buttonId: string, path: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }));
    router.push(path);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header handleNavigation={handleNavigation} />
      <main className="flex-1 bg-gradient-to-b from-green-50 to-emerald-50 w-full flex justify-center">
        <div className="w-full">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}