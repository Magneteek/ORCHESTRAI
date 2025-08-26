import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ORCHESTRAI - Crystalline Memory Dashboard',
  description: 'Advanced Multi-Agent System with Crystalline Memory Architecture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        {children}
      </body>
    </html>
  )
}