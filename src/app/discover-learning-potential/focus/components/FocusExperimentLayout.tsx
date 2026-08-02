'use client'

import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'
import { SCENE_ENTER_MS, SCENE_EXIT_MS } from '@/features/focus-discovery/focusTimingConfig'

type FocusExperimentLayoutProps = {
  children: React.ReactNode
  ctaLabel?: string
  onCta?: () => void
  ctaDisabled?: boolean
  maxWidthClassName?: string
  brandMarkSize?: 'sm' | 'lg'
  // One new, optional, additive slot between the brand mark and the
  // content block — used for `MissionProgressDots` on Mission Intro
  // screens only. Mirrors Memory Discovery's own identical
  // `headerSlot` addition.
  headerSlot?: React.ReactNode
}

// "Every transition should feel calm and premium... avoid abrupt screen
// changes" (FIX-10 Premium Motion™). Same real ceiling Memory
// Discovery's own layout uses.
const sceneVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: SCENE_ENTER_MS / 1000, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: SCENE_EXIT_MS / 1000, ease: 'easeOut' } },
}

// Shared shell for every Focus Discovery™ screen — deliberately the same
// shape as Reading/Memory Discovery's own experiment layout (same visual
// language, per the brief), duplicated here rather than imported so each
// Discovery module owns its own component tree independently. Full-
// height, centered, one block of content, at most one CTA, and the
// Living Brain™ mark always present and breathing. No progress bar, no
// timer, no step count (FIX-11 "Less Words. More Focus™").
export function FocusExperimentLayout({
  children,
  ctaLabel,
  onCta,
  ctaDisabled = false,
  maxWidthClassName = 'max-w-xl',
  brandMarkSize = 'sm',
  headerSlot,
}: FocusExperimentLayoutProps): React.JSX.Element {
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
