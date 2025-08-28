import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuartzIQ | Intelligent Analytics Platform for Dental Equipment Suppliers',
  description: 'Stop losing dental sales to competitors with faster automation. QuartzIQ transforms your B2B marketing with intelligent analytics, automated lead qualification, and our Trust-to-Lead Guarantee.',
  keywords: 'dental equipment marketing, B2B sales automation, dental supplier analytics, lead generation, dental industry CRM',
  authors: [{ name: 'QuartzIQ' }],
  openGraph: {
    title: 'QuartzIQ | Intelligent Analytics Platform for Dental Equipment Suppliers',
    description: 'Transform your dental B2B marketing with intelligent automation and guaranteed results.',
    type: 'website',
    locale: 'en_US',
    siteName: 'QuartzIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuartzIQ | Intelligent Analytics Platform',
    description: 'Transform your dental B2B marketing with intelligent automation and guaranteed results.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://quartziq.com" />
      </head>
      <body className={inter.className}>
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}