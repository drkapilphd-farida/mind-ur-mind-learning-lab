'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'

type ReadingExperimentLayoutProps = {
  children: React.ReactNode
  ctaLabel?: string
  onCta?: () => void
  ctaDisabled?: boolean
  maxWidthClassName?: string
  // 'sm' — the small persistent brand mark shown on every experiment
  // screen ("gentle breathing continues throughout"). 'lg' — the more
  // prominent mark used on the Transition screen, where it's the only
  // other visual besides text.
  brandMarkSize?: 'sm' | 'lg'
  // Reading Discovery Engine™ (Sprint-2 Part-1) — one new, optional,
  // additive slot between the brand mark and the content block. Every
  // existing caller is unaffected (renders nothing extra when omitted).
  // Used for the new `SprintProgressDots` (Mission Intro screens) and
  // `LivePerformanceBar` (active Sprint scenes) — never for the "no
  // progress bars, no percentages" scenes this layout's own rule already
  // governs; those simply never pass this prop.
  headerSlot?: React.ReactNode
}

// Shared shell for every Reading Discovery™ screen — full-height, centered,
// one block of content, at most one CTA, and the Living Brain™ mark always
// present and breathing. No progress indicator, no timer, no step count:
// deliberately, per the brief ("no progress bars, no percentages") — for
// the actual exercises. `headerSlot` is an explicit, opt-in exception a
// caller reaches for deliberately, not a default.
export function ReadingExperimentLayout({
  children,
  ctaLabel,
  onCta,
  ctaDisabled = false,
  maxWidthClassName = 'max-w-xl',
  brandMarkSize = 'sm',
  headerSlot,
}: ReadingExperimentLayoutProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center"
    >
      <LivingBrainLogo className={brandMarkSize === 'lg' ? 'size-24 sm:size-32' : 'size-10 sm:size-12'} />
      {headerSlot !== undefined && <div className="mt-5 w-full max-w-sm">{headerSlot}</div>}
      <div className={cn('mx-auto mt-8', maxWidthClassName)}>{children}</div>
      {ctaLabel !== undefined && onCta !== undefined ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          className="mt-10"
        >
          <Button size="lg" className="min-w-[220px] rounded-full text-base shadow-sm" onClick={onCta} disabled={ctaDisabled}>
            {ctaLabel}
          </Button>
        </motion.div>
      ) : null}
    </motion.div>
  )
}
