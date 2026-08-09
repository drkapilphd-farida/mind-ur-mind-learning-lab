import Link from 'next/link'
import { Lock, TrendingUp, Brain, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LOCKED_INSIGHTS = [
  { icon: Brain, label: 'Deep behavioral pattern analysis' },
  { icon: TrendingUp, label: '90-day learning trend forecasts' },
  { icon: Sparkles, label: 'Personalized parent coaching tips' },
] as const

// Premium Conversion Upsell Card — a real teaser, not a fake progress
// bar: shows exactly which insights are gated (with icons matching the
// insight, not generic locks everywhere) so the value being paid for is
// concrete rather than vague. `onUpgrade` is left to the caller — this
// component makes no assumption about the real checkout flow.
//
// Re-themed off this app's real design tokens (bg-card/text-foreground/
// text-primary) rather than the raw slate-*/indigo-* Tailwind palette it
// originally shipped with — those don't have dark-mode variants wired
// up, so the card was silently unreadable in dark mode; every other
// page in this app already uses the token system. Takes a plain `href`
// (a real <Link>) rather than an onUpgrade callback — the whole
// dashboard is a Server Component now that the child switcher/framer-
// motion machinery is gone, so this stays a plain link, not a reason to
// pull the page back into a client component.
export function PremiumUpsellCard({ href }: { href: string }): React.JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
          <Lock className="size-4 text-primary-foreground" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Unlock Deep Behavioral Insights</h3>
          <p className="text-xs text-muted-foreground">Available on Quantum Mind Pro</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {LOCKED_INSIGHTS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
              <Icon className="size-3.5 text-primary" aria-hidden="true" />
            </span>
            {label}
            <Lock className="ml-auto size-3.5 shrink-0 text-muted-foreground/40" aria-hidden="true" />
          </li>
        ))}
      </ul>

      <Button asChild className="mt-6 w-full rounded-xl">
        <Link href={href}>Upgrade to Quantum Mind Pro</Link>
      </Button>
    </div>
  )
}
