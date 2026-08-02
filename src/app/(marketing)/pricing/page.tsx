import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FREE_TIER_DOCUMENT_LIMIT } from '@/features/quantum-document-transformer/freeTierLimit'

export const metadata: Metadata = {
  title: 'Pricing — Mind Ur Mind Learning Lab™',
  description: 'Free vs Pro plans for Mind Ur Mind Learning Lab™.',
}

type PlanCardProps = {
  name: string
  description: string
  features: readonly string[]
  cta: React.ReactNode
  highlighted?: boolean
}

function PlanCard({ name, description, features, cta, highlighted = false }: PlanCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-3xl border p-8',
        highlighted ? 'border-primary/30 bg-primary/[0.03] shadow-sm' : 'border-border/60 bg-card',
      )}
    >
      <div>
        <p className="text-lg font-semibold text-foreground">{name}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      {cta}
    </div>
  )
}

// This page's own existence closes a real gap: the marketing nav already
// linked here (see (marketing)/layout.tsx's NAV_LINKS), but no route
// existed — a dead link. No live Pro checkout is wired up yet anywhere in
// this app (Stripe billing today only covers one-time course purchases,
// and the plans/subscriptions/entitlements tables have no real rows or
// webhook), so this page is honest about that rather than showing a
// button that would silently do nothing.
export default function PricingPage(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Simple, honest pricing</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Start free. Upgrade to Pro whenever you outgrow it.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        <PlanCard
          name="Free"
          description="Enough to try the AI Document Transformer for real."
          features={[
            `${FREE_TIER_DOCUMENT_LIMIT} AI document transformations`,
            'Spider Notes & AI summaries on those documents',
            'Quantum Speed Reading & Active Recall sessions',
            'Full access to the core Intelligence Labs',
          ]}
          cta={
            <Button asChild variant="outline" size="lg" className="w-full rounded-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          }
        />

        <PlanCard
          highlighted
          name="Pro"
          description="For students who want to transform without limits."
          features={[
            'Unlimited AI document transformations',
            'Unlimited Spider Notes & AI summaries',
            'Unlimited Quantum sessions',
            'Everything in Free',
          ]}
          cta={
            <Button size="lg" className="w-full rounded-full" disabled>
              <Sparkles className="size-4" aria-hidden="true" />
              Coming soon
            </Button>
          }
        />
      </div>

      <p className="mx-auto mt-10 max-w-lg text-center text-sm text-muted-foreground">
        Pro billing isn&rsquo;t live yet — we&rsquo;re finishing it up. Reach out if you&rsquo;d like early access.
      </p>
    </section>
  )
}
