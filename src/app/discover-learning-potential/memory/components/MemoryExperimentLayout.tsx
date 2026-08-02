'use client'

import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'
import { SCENE_ENTER_MS, SCENE_EXIT_MS } from '@/features/memory-discovery/memoryTimingConfig'

type MemoryExperimentLayoutProps = {
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
  // Memory Discovery Foundation™ (Sprint-1) — one new, optional,
  // additive slot between the brand mark and the content block, mirroring
  // Reading Discovery's own identical `headerSlot` addition. Every
  // existing caller is unaffected (renders nothing extra when omitted).
  // Used for the new `MissionProgressDots` on Mission Intro screens only.
  headerSlot?: React.ReactNode
}

// Sprint-2.1 FIX-10/FIX-12 — "Keep animations below approximately 250
// milliseconds... Animations should support cognition, not delay it."
// Retimed from the original 500ms enter / 300ms exit (both real, findable
// violations of the brief's own real cap, applied to every single screen
// transition in the whole experience) down to the centralized config's
// own real values — still a real, deliberately asymmetric soft fade +
// gentle rise, just fast enough to never itself read as a wait.
const sceneVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: SCENE_ENTER_MS / 1000, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: SCENE_EXIT_MS / 1000, ease: 'easeOut' } },
}

// Shared shell for every Memory Discovery™ screen — deliberately the same
// shape as Reading Discovery's ReadingExperimentLayout (same visual
// language, per the brief), duplicated here rather than imported so
// Sprint-2's locked files are never touched by anything Sprint-3 does.
// Full-height, centered, one block of content, at most one CTA, and the
// Living Brain™ mark always present and breathing. No progress indicator,
// no timer, no step count.
export function MemoryExperimentLayout({
  children,
  ctaLabel,
  onCta,
  ctaDisabled = false,
  maxWidthClassName = 'max-w-xl',
  brandMarkSize = 'sm',
  headerSlot,
}: MemoryExperimentLayoutProps): React.JSX.Element {
  return (
    <motion.div
      variants={sceneVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center"
    >
      <LivingBrainLogo className={brandMarkSize === 'lg' ? 'size-24 sm:size-32' : 'size-10 sm:size-12'} />
      {headerSlot !== undefined && <div className="mt-5 w-full max-w-sm">{headerSlot}</div>}
      <div className={cn('mx-auto mt-8', maxWidthClassName)}>{children}</div>
      {ctaLabel !== undefined && onCta !== undefined ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: SCENE_ENTER_MS / 1000, delay: 0.15, ease: 'easeOut' }}
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
