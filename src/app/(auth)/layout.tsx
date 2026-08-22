import Link from 'next/link'
import { getAppDomain } from '@/lib/domains/appDomain'
import { getDomainTagline } from '@/lib/domains/domainTagline'

// Consistent Branding™ — /login, /signup, /forgot-password, etc. all live
// under this route group, outside (dashboard)/layout.tsx, so they never
// got appDomain threaded to them before now. Resolved directly here
// (a Server Component, no client-prop plumbing needed) so a visitor to
// habit.mindurmind.org.in sees "Quantum Mindset & Habit Builder™" next to
// the wordmark from their very first screen, never document-upload or
// speed-reading copy.
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const appDomain = await getAppDomain()

  return (
    <div className="bg-muted/40 flex min-h-screen flex-col">
      <header className="bg-background flex h-14 items-center justify-between border-b px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Quantum Mind Learning Lab™
        </Link>
        <span className="hidden text-xs font-medium text-muted-foreground sm:inline">{getDomainTagline(appDomain)}</span>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
