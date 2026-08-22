import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { getAppDomain } from '@/lib/domains/appDomain'
import { getDomainTagline } from '@/lib/domains/domainTagline'

// One-Click Entry™ — '/' now redirects straight to /welcome/choose-method
// (see page.tsx), so the anchor links this nav used to point at
// (#who-its-for, #how-it-works, #faq — all on that now-removed homepage
// content) no longer resolve to anything. /pricing and /reviews are the
// pages that still actually use this layout.
const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/reviews', label: 'Success Stories' },
] as const

// Consistent Branding™ — this legacy marketing shell (pricing/reviews;
// the real homepage now lives at the separate www.mindurmind.org.in
// deployment) isn't domain-gated by src/middleware.ts, so it's reachable
// on both hosts — resolve appDomain the same way (auth)/layout.tsx does
// so the tagline next to the wordmark stays correct regardless.
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const appDomain = await getAppDomain()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-40 flex h-16 items-center border-b border-border/60 px-6 backdrop-blur-md sm:px-8">
        <Link href="/" className="mr-8 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <LivingBrainLogo size={26} decorative={false} animated={false} />
          <span className="flex flex-col leading-tight">
            Quantum Mind Learning Lab™
            <span className="hidden text-[11px] font-normal text-muted-foreground sm:inline">{getDomainTagline(appDomain)}</span>
          </span>
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Quantum Mind Learning Lab™. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
