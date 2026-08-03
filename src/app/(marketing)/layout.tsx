import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'

// One-Click Entry™ — '/' now redirects straight to /welcome/choose-method
// (see page.tsx), so the anchor links this nav used to point at
// (#who-its-for, #how-it-works, #faq — all on that now-removed homepage
// content) no longer resolve to anything. /pricing is the only page left
// that still actually uses this layout.
const NAV_LINKS = [{ href: '/pricing', label: 'Pricing' }] as const

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-40 flex h-16 items-center border-b border-border/60 px-6 backdrop-blur-md sm:px-8">
        <Link href="/" className="mr-8 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <LivingBrainLogo size={26} decorative={false} animated={false} />
          Quantum Mind Learning Lab™
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
          {/* Sprint QSR-4 — same real-entry-point fix as page.tsx's hero CTA */}
          <Button asChild size="sm" className="rounded-full">
            <Link href="/welcome">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
          <p className="text-sm font-medium text-foreground">Quantum Mind Learning Lab™</p>
          <p className="text-sm text-muted-foreground">
            © 2026 Quantum Mind Learning Lab™. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
