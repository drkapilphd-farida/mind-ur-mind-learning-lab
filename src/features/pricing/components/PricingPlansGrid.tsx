'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FREE_TIER_DOCUMENT_LIMIT } from '@/features/quantum-document-transformer/freeTierLimit'
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from '@/config/masterclassPaymentLink'
import { RAZORPAY_SUBSCRIPTION_LINKS, type BillingPeriod } from '../razorpaySubscriptionLinks'

// Real prices haven't been supplied yet — this is a single, clearly-
// marked placeholder (not a guessed number) so nothing on a page with
// real payment buttons implies a price that isn't confirmed. Replace
// with the real ₹ amount per plan/period once available; Razorpay's own
// checkout page always shows the real, authoritative price regardless of
// what this label says.
const PRICE_PENDING = 'See price at checkout'

type PlanCardProps = {
  id?: string
  name: string
  subtitle?: string
  description: string
  priceLabel: string
  features: readonly string[]
  cta: React.ReactNode
  highlighted?: boolean
}

function PlanCard({ id, name, subtitle, description, priceLabel, features, cta, highlighted = false }: PlanCardProps): React.JSX.Element {
  return (
    <div
      id={id}
      className={cn(
        'flex flex-col gap-6 rounded-3xl border p-8 scroll-mt-24',
        highlighted ? 'border-primary/30 bg-primary/[0.03] shadow-sm' : 'border-border/60 bg-card',
      )}
    >
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-semibold text-foreground">{name}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <p className="mt-4 text-sm font-medium text-foreground">{priceLabel}</p>
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

// A plain, real link to Razorpay's hosted checkout — target="_blank" +
// rel="noopener noreferrer" per the brief (noopener stops the new tab
// getting a handle back to window.opener; noreferrer additionally drops
// the Referer header). No client-side redirect logic needed for a link
// this simple, so nothing here adds JS-driven navigation that would only
// make it slower.
function SubscribeButton({ href, label }: { href: string; label: string }): React.JSX.Element {
  return (
    <Button asChild size="lg" className="w-full rounded-full">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
        <ExternalLink className="size-4" aria-hidden="true" />
      </a>
    </Button>
  )
}

function BillingPeriodToggle({ value, onChange }: { value: BillingPeriod; onChange: (period: BillingPeriod) => void }): React.JSX.Element {
  return (
    <div role="radiogroup" aria-label="Billing period" className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border/60 bg-card p-1">
      {(['monthly', 'yearly'] as const).map((period) => (
        <button
          key={period}
          type="button"
          role="radio"
          aria-checked={value === period}
          onClick={() => onChange(period)}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-medium transition-colors',
            value === period ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {period === 'monthly' ? 'Monthly' : 'Yearly'}
        </button>
      ))}
    </div>
  )
}

// Pricing Plans Grid — the one place billingPeriod state lives. Free and
// Institutional don't vary by billing period (Free has no period at all;
// Institutional is Yearly/Custom only, per the brief), so only the
// Starter and Family/Pro cards' CTA hrefs actually change when the
// toggle flips.
export function PricingPlansGrid(): React.JSX.Element {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

  return (
    <div className="mt-10">
      <BillingPeriodToggle value={billingPeriod} onChange={setBillingPeriod} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PlanCard
          name="Free"
          description="Enough to try the AI Document Transformer for real."
          priceLabel="₹0 forever"
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
          id="starter"
          name="Starter"
          subtitle="Individual"
          description="For one student who wants to transform without limits."
          priceLabel={PRICE_PENDING}
          features={[
            'Unlimited AI document transformations',
            'Unlimited Spider Notes & AI summaries',
            'Unlimited Quantum sessions',
            'Everything in Free',
          ]}
          cta={
            <SubscribeButton
              href={RAZORPAY_SUBSCRIPTION_LINKS.starter[billingPeriod]}
              label={`Subscribe ${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}`}
            />
          }
        />

        <PlanCard
          id="family-pro"
          highlighted
          name="Family"
          subtitle="Pro"
          description="For families with more than one student learning together."
          priceLabel={PRICE_PENDING}
          features={[
            'Everything in Starter, for every child on the plan',
            'Individual progress & Mind Score per child',
            'Priority AI processing',
            'Family-wide document library',
          ]}
          cta={
            <SubscribeButton
              href={RAZORPAY_SUBSCRIPTION_LINKS.family[billingPeriod]}
              label={`Subscribe ${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}`}
            />
          }
        />

        <PlanCard
          name="Institutional"
          subtitle="School"
          description="For schools and coaching centers with 50+ students."
          priceLabel="Yearly · Custom pricing"
          features={[
            'Everything in Family',
            '50+ student seats',
            'Admin & teacher dashboards',
            'Dedicated onboarding support',
          ]}
          cta={<SubscribeButton href={RAZORPAY_SUBSCRIPTION_LINKS.institutional} label="Get Started" />}
        />
      </div>

      {/* 30-Day Quantum Speed Reading Mastery + Live Cohort™ — a one-time
          enrollment, not a recurring plan, so it's deliberately its own
          banner rather than a fifth grid card fighting the billing-period
          toggle above (which only makes sense for subscriptions). Same
          real, honest posture as every SubscribeButton above: a real
          Razorpay Payment Link, no promise of automatic access — the
          batch schedule follows by email after payment. */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-primary/30 bg-primary/[0.03] p-8 sm:flex-row">
        <div>
          <p className="text-lg font-semibold text-foreground">30-Day Quantum Speed Reading Mastery + Live Cohort</p>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            The self-paced 30-day curriculum, paired with 7 live mentorship sessions from Dr. Kapil Dev Sharma. One-time enrollment — ₹4,999.
          </p>
        </div>
        <Button asChild size="lg" className="w-full shrink-0 rounded-full sm:w-auto">
          <a href={RAZORPAY_MASTERCLASS_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
            Enroll Now for ₹4,999
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Button>
      </div>

      <p className="mx-auto mt-10 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Subscribing or enrolling opens Razorpay&rsquo;s secure checkout in a new tab.
      </p>
    </div>
  )
}
