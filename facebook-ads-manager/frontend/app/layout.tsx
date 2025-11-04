import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/components/accessibility/skip-link";
import { Toaster } from "sonner";
import { WebVitalsReporter } from "@/components/performance/web-vitals-reporter";

// Force dynamic rendering to prevent Html import error in error pages
export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Facebook Ads Manager",
    template: "%s | Facebook Ads Manager",
  },
  description: "AI-powered Facebook Ads management platform with advanced optimization and insights",
  keywords: ["facebook ads", "advertising", "marketing", "ai optimization", "campaign management"],
  authors: [{ name: "Facebook Ads Manager Team" }],
  creator: "Facebook Ads Manager",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://facebook-ads-manager.com",
    siteName: "Facebook Ads Manager",
    title: "Facebook Ads Manager - AI-Powered Campaign Optimization",
    description: "Optimize your Facebook advertising campaigns with AI-powered insights and automation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facebook Ads Manager",
    description: "AI-powered Facebook Ads management platform",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <WebVitalsReporter />
        <SkipLink />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
