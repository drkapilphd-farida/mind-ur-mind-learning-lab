import { Playfair_Display, Inter } from 'next/font/google'
import Link from 'next/link'

// Same School Corporate™ theme/font scoping as the protected portal
// layouts (see (protected)/layout.tsx in each of school-admin/
// partner-admin) — the dedicated login pages sit OUTSIDE those layouts
// (deliberately, so an unauthenticated visitor can reach them at all —
// see src/middleware.ts), so they load the same fonts/theme themselves
// rather than inheriting nothing and looking like the plain consumer
// auth pages.
const playfairDisplay = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'] })
const interCorporate = Inter({ variable: '--font-inter-corporate', subsets: ['latin'] })

export function PortalAuthShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className={`school-corporate ${playfairDisplay.variable} ${interCorporate.variable} bg-muted/40 flex min-h-screen flex-col`}>
      <header className="bg-background flex h-14 items-center border-b px-6">
        <Link href="/" className="font-heading text-sm font-semibold tracking-tight">
          Quantum Mind
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
