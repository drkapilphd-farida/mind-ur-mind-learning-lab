import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type UpgradeToProBannerProps = {
  documentLimit: number
}

// Pro Paywall — shown proactively in place of the drop zone once a free
// user has already used their real quantum_documents allowance (never
// shown reactively after a wasted upload attempt — see
// AIDocumentTransformerWidget.tsx). Links to /pricing#family-pro — the
// pricing page's own Family/Pro card, which now has a real, live
// Razorpay "Subscribe" button (see PricingPlansGrid.tsx) — rather than
// linking straight to a specific Razorpay URL and guessing Monthly vs.
// Yearly on the learner's behalf.
export function UpgradeToProBanner({ documentLimit }: UpgradeToProBannerProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 text-center">
      <div aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Lock className="size-6 text-primary" />
      </div>

      <div>
        <p className={TYPOGRAPHY.h3}>You&rsquo;ve reached your free limit</p>
        <p className={cn(TYPOGRAPHY.small, 'mx-auto mt-2 max-w-sm')}>
          You&rsquo;ve reached your free limit of {documentLimit} documents. Upgrade to Pro for unlimited AI document transformations, Spider Notes, and Quantum sessions.
        </p>
      </div>

      <Button asChild size="lg" className="rounded-full">
        <Link href="/pricing#family-pro">
          <Sparkles className="size-4" aria-hidden="true" />
          Upgrade to Pro
        </Link>
      </Button>
    </div>
  )
}
