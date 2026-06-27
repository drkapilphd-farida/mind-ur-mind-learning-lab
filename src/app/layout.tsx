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

export const metadata: Metadata = {
  title: {
    default: 'Mind Ur Mind Learning Lab™',
    template: '%s | Mind Ur Mind Learning Lab™',
  },
  description: 'AI-powered adaptive learning platform',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
