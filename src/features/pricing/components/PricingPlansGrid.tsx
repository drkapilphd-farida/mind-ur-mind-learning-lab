'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FREE_TIER_DOCUMENT_LIMIT } from '@/features/quantum-document-transformer/freeTierLimit'
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from '@/config/masterclassPaymentLink'
import { RAZORPAY_UPLOAD_AND_LEARN_PAYMENT_LINK } from '@/config/uploadAndLearnPaymentLink'
import { RAZORPAY_SUBSCRIPTION_LINKS, type BillingPeriod } from '../razorpaySubscriptionLinks'

// Real, confirmed prices for both billing periods — Razorpay's own
// checkout page always shows the real, authoritative amount regardless
// of what these labels say, but there's no longer a "pending" case to
// fall back to.
const STARTER_PRICE = { monthly: '₹399', yearly: '₹2,999' } as const
const FAMILY_PRICE = { monthly: '₹699', yearly: '₹4,999' } as const

function ctaLabelFor(billingPeriod: BillingPeriod, price: { monthly: string; yearly: string }): string {
  return billingPeriod === 'monthly' ? `Subscribe Monthly — ${price.monthly}/month` : `Subscribe Yearly — ${price.yearly}/year`
}

type PlanCardProps = {
  id?: string
  name: string
  subtitle?: string
  description: string
  priceAmount: string
  priceUnit: string
  features: readonly string[]
  cta: React.ReactNode
  highlighted?: boolean
  badge?: string
}

function PlanCard({ id, name, subtitle, description, priceAmount, priceUnit, features, cta, highlighted = false, badge }: PlanCardProps): React.JSX.Element {
  return (
    <div
      id={id}
      className={cn(
        'relative flex flex-col gap-6 rounded-3xl border p-8 scroll-mt-24',
        highlighted ? 'border-2 border-primary bg-primary/[0.04] shadow-lg ring-1 ring-primary/20' : 'border-border/60 bg-card',
      )}
    >
      {badge && (
        <span className="brand-gradient absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-md">
          {badge}
        </span>
      )}

      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-semibold text-foreground">{name}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{priceAmount}</span>
          <span className="text-sm font-medium text-muted-foreground">{priceUnit}</span>
        </div>
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
// `compact` shrinks the label text and drops the icon — the Button
// component's base styles are a fixed-height, single-line
// `whitespace-nowrap` (see button.tsx), so a long "Subscribe Yearly —
// ₹2,999/year"-style label needs the extra room to stay on one line
// without spilling past the card at narrower grid-column widths; short
// labels ("Get Started") don't need it.
function SubscribeButton({ href, label, compact = false }: { href: string; label: string; compact?: boolean }): React.JSX.Element {
  return (
    <Button asChild size="lg" className={cn('w-full rounded-full', compact && 'px-3 text-xs')}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
        {!compact && <ExternalLink className="size-4 shrink-0" aria-hidden="true" />}
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
// Starter and Family/Pro cards' price, priceUnit, and CTA actually change
// when the toggle flips.
export function PricingPlansGrid(): React.JSX.Element {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const periodUnit = billingPeriod === 'monthly' ? '/month' : '/year'

  return (
    <div className="mt-10">
      <BillingPeriodToggle value={billingPeriod} onChange={setBillingPeriod} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PlanCard
          name="The Foundation"
          subtitle="Start for free"
          description="Your free trial of the AI Document Transformer — upgrade anytime."
          priceAmount="₹0"
          priceUnit="forever"
          features={[
            `${FREE_TIER_DOCUMENT_LIMIT} free AI document transformations to try it out`,
            'Neural Map Notes & AI summaries on those documents',
            'Quantum Speed Reading & Active Recall sessions',
          ]}
          cta={
            <Button asChild variant="outline" size="lg" className="w-full rounded-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          }
        />

        <PlanCard
          id="starter"
          name="Individual Growth"
          subtitle="Unlock unlimited potential"
          description="For one student who wants to transform without limits."
          priceAmount={STARTER_PRICE[billingPeriod]}
          priceUnit={periodUnit}
          features={[
            '~20 AI-Powered Cognitive Transformations/month',
            'Advanced Memory & Speed Drills',
            'Unlimited Quantum Speed Reading Sessions',
            'Everything in The Foundation',
          ]}
          cta={
            <SubscribeButton href={RAZORPAY_SUBSCRIPTION_LINKS.starter[billingPeriod]} label={ctaLabelFor(billingPeriod, STARTER_PRICE)} compact />
          }
        />

        <PlanCard
          id="family-pro"
          highlighted
          badge="Recommended"
          name="Genius Family Lab"
          subtitle="Master learning together"
          description="For families with more than one student learning together."
          priceAmount={FAMILY_PRICE[billingPeriod]}
          priceUnit={periodUnit}
          features={[
            '~80 AI-Powered Cognitive Transformations/month, shared with your family',
            'Family-wide Intelligence Dashboard',
            'Individual Progress & Mind Score per child',
            'Everything in Individual Growth',
          ]}
          cta={
            <SubscribeButton href={RAZORPAY_SUBSCRIPTION_LINKS.family[billingPeriod]} label={ctaLabelFor(billingPeriod, FAMILY_PRICE)} compact />
          }
        />

        <PlanCard
          name="Institutional"
          subtitle="School"
          description="For schools and coaching centers with 50+ students."
          priceAmount="Custom"
          priceUnit="yearly pricing"
          features={[
            'Everything in Genius Family Lab',
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

      {/* AI Document Supercharger™ (Upload & Learn) — Finalized Pricing™:
          a real, standalone document-processing subscription, distinct
          from the Individual Growth/Genius Family Lab platform plans
          above (those cover general AI transformation quota; this one is
          specifically the document-upload pipeline). Same "own banner,
          not a fifth grid card" reasoning as the Masterclass banner —
          it's a single flat monthly price, not something the
          Monthly/Yearly toggle above should apply to. */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/60 bg-card p-8 sm:flex-row">
        <div>
          <p className="text-lg font-semibold text-foreground">📄 Document Mastery Studio™</p>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Standalone document processing — drop in any PDF, textbook, or research paper and get Quantum Speed Reading drills, Mind Maps, and Neural
            Map Notes back. ₹499/month.
          </p>
        </div>
        <Button asChild size="lg" variant="outline" className="w-full shrink-0 rounded-full sm:w-auto">
          <a href={RAZORPAY_UPLOAD_AND_LEARN_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
            Subscribe for ₹499/month
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
