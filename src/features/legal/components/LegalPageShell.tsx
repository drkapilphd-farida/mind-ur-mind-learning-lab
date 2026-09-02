import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'

type LegalPageShellProps = {
  title: string
  lastUpdated: string
  children: React.ReactNode
  // Overrides for reuse by the new Mind Ur Mind draft legal pages
  // (/legal-drafts/*) — the live /privacy and /terms are legacy content
  // from before the pivot (still branded "Quantum Mind Learning Lab™",
  // a different entity/email than the current site) and are left as-is
  // here; these props let a second, differently-branded set of legal
  // pages reuse this same chrome without forking it.
  brandName?: string
  footerLinks?: readonly { label: string; href: string }[]
}

const DEFAULT_BRAND_NAME = 'Quantum Mind Learning Lab™'
const DEFAULT_FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
] as const

// Shared chrome for /privacy and /terms — both live directly under
// src/app (not the (marketing) route group), so neither inherits that
// group's header/footer automatically. This gives them the same visual
// language (same logo mark, same footer copyright/cross-links) without
// duplicating that markup across two long content pages.
export function LegalPageShell({
  title,
  lastUpdated,
  children,
  brandName = DEFAULT_BRAND_NAME,
  footerLinks = DEFAULT_FOOTER_LINKS,
}: LegalPageShellProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <LivingBrainLogo size={24} decorative={false} animated={false} />
            {brandName}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
          <Link href="/" className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1.5 text-sm transition-colors">
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>

          <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: {lastUpdated}</p>

          <div className="mt-10 space-y-10">{children}</div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
          <p className="text-foreground text-sm font-medium">{brandName}</p>
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            {footerLinks.map((link, index) => (
              <span key={link.href} className="flex items-center gap-4">
                {index > 0 && <span aria-hidden="true">·</span>}
                <Link href={link.href} className="hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">© 2026 {brandName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Shared prose styles — kept as exported class strings rather than a
// wrapper component so each section's actual legal text stays plain,
// readable JSX in the page files (this is content that will get edited
// by non-engineers/legal review; a component wrapper around every
// paragraph would make that harder, not easier).
export const legalStyles = {
  h2: 'text-foreground text-xl font-semibold tracking-tight',
  p: 'text-muted-foreground mt-3 leading-relaxed',
  list: 'text-muted-foreground mt-3 list-disc space-y-1.5 pl-5 leading-relaxed',
} as const
