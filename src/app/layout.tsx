import type { Metadata, Viewport } from 'next'
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

// Strict App Naming™ — every surface that shows "the app name" (browser
// tab, PWA install prompt, iOS home screen label, social share cards)
// says exactly "Quantum Mind," nothing appended. Only the `description`
// fields (not name fields) still use full prose — naming a product and
// describing it are different things.
export const metadata: Metadata = {
  title: {
    default: 'Quantum Mind',
    template: '%s | Quantum Mind',
  },
  description: 'AI-powered adaptive learning platform. Master in-demand skills with personalized courses and intelligent tutoring.',
  metadataBase: new URL(appUrl),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Quantum Mind',
  },
  openGraph: {
    type: 'website',
    siteName: 'Quantum Mind',
    title: 'Quantum Mind',
    description: 'AI-powered adaptive learning platform. Master in-demand skills with personalized courses and intelligent tutoring.',
    url: appUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantum Mind',
    description: 'AI-powered adaptive learning platform. Master in-demand skills with personalized courses and intelligent tutoring.',
  },
}

// themeColor lives on the separate `viewport` export, not `metadata` —
// Next.js deprecated (and warns/build-errors on) putting it there.
export const viewport: Viewport = {
  themeColor: '#2B4CE8',
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
