import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: 'Mind Ur Mind Learning Lab™',
    template: '%s | Mind Ur Mind Learning Lab™',
  },
  description: 'AI-powered adaptive learning platform. Master in-demand skills with personalized courses and intelligent tutoring.',
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    siteName: 'Mind Ur Mind Learning Lab™',
    title: 'Mind Ur Mind Learning Lab™',
    description: 'AI-powered adaptive learning platform. Master in-demand skills with personalized courses and intelligent tutoring.',
    url: appUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mind Ur Mind Learning Lab™',
    description: 'AI-powered adaptive learning platform. Master in-demand skills with personalized courses and intelligent tutoring.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
