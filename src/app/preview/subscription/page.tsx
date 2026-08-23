import type { Metadata } from 'next'
import Link from 'next/link'
import { CreditCard, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getIsPaidUser } from '@/lib/subscription/getIsPaidUser'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Subscription',
}

// Real Subscription Status™ — replaces the Sprint 0 ModulePlaceholder
// this route used to render ("Coming soon"). No self-serve plan
// management (seat counts, invoices, cancel/downgrade) exists yet, so
// this stays honest about that rather than fabricating a billing
// dashboard: it shows the one real signal that exists today
// (getIsPaidUser, the same check every paywall in this app already
// reads) and sends the student to /pricing — the real Razorpay
// checkouts — to subscribe or change plans.
export default async function SubscriptionPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPaidUser = user !== null && (await getIsPaidUser(user.id))

  return (
    <div className="space-y-6">
      <div>
        <p className={TYPOGRAPHY.label}>Account</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>Subscription</h1>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-4">
          <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', isPaidUser ? 'bg-primary/[0.08]' : 'bg-muted')}>
            {isPaidUser ? <Sparkles className="size-5 text-primary" aria-hidden="true" /> : <CreditCard className="size-5 text-muted-foreground" aria-hidden="true" />}
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Current plan</p>
            <p className="mt-0.5 text-lg font-semibold text-foreground">{isPaidUser ? 'Pro' : 'Free'}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {isPaidUser
            ? 'Your account has an active subscription. Manage billing, seats, or your plan directly through Razorpay’s checkout confirmation email.'
            : 'You’re on the free plan. Upgrade any time to unlock unlimited AI document transformations, the 30-Day Masterclass, and more.'}
        </p>

        <Button asChild className="mt-5 w-full rounded-full sm:w-auto">
          <Link href="/pricing">{isPaidUser ? 'View all plans' : 'Upgrade your plan'}</Link>
        </Button>
      </div>
    </div>
  )
}
