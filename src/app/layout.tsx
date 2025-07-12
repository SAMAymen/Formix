import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/providers/Providers";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/theme-provider";
import Script from "next/script";
import { StickyCoffeeButton } from "@/components/ui/StickyCoffeeButton";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Formix | Connect Forms to Google Sheets",
    template: "%s | Formix",
  },
  description:
    "Create beautiful forms that automatically sync with Google Sheets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive" src="/theme.js" />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable}`}>
        <ThemeProvider defaultTheme="system">
          <Providers>
            {children}
            <Toaster />
            <StickyCoffeeButton />
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}