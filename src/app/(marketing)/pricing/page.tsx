import type { Metadata } from 'next'
import { PricingPlansGrid } from '@/features/pricing/components/PricingPlansGrid'

export const metadata: Metadata = {
  title: 'Pricing — Quantum Mind Learning Lab™',
  description: 'Free, Starter, Family, and Institutional plans for Quantum Mind Learning Lab™.',
}

// Live Razorpay Subscription Links™ — Starter and Family/Pro now
// checkout for real via Razorpay's hosted subscription links (see
// PricingPlansGrid.tsx and razorpaySubscriptionLinks.ts, the one place
// those 5 URLs live). This page itself stays a Server Component — all
// the interactive billing-period-toggle state lives in the client
// component it renders.
export default function PricingPage(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Simple, honest pricing</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Start free. Upgrade whenever you outgrow it.
        </p>
      </div>

      <PricingPlansGrid />
    </section>
  )
}
