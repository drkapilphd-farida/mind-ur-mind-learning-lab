'use client'

import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type LearningPotentialLayoutProps = {
  children: React.ReactNode
  eyebrow?: string
  ctaLabel?: string
  onCta?: () => void
  secondaryText?: string
  maxWidthClassName?: string
  // UDCE-1.5 Step-1 "Slow Down the Emotional Peak™" — "Do not immediately
  // navigate... only then continue." A real, deliberately longer reveal
  // delay for screens that need the user to sit with what they just saw
  // before being invited to move on. Defaults to the original pacing.
  ctaDelayS?: number
}

const sceneVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: 'easeOut' } },
}

// Learning Potential Reveal™ (UDCE-1) — the emotional bridge between
// Brain Discovery™ and AI Learning Studio™. Deliberately its own shell,
// duplicated rather than imported from Focus/Memory/Reading Discovery's
// own experiment layouts, per this codebase's established
// per-feature-owns-its-own-tree convention. One idea per screen, no
// scrolling, no progress dots, no step count — this is not another
// Discovery stage, it is the calm, premium pause after all of them.
export function LearningPotentialLayout({
  children,
  eyebrow,
  ctaLabel,
  onCta,
  secondaryText,
  maxWidthClassName = 'max-w-md',
  ctaDelayS = 0.3,
}: LearningPotentialLayoutProps): React.JSX.Element {
  return (
    <motion.div
      variants={sceneVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center"
    >
      <LivingBrainLogo className="size-10 sm:size-12" />
      {eyebrow !== undefined && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className={cn(TYPOGRAPHY.label, 'mt-5 text-primary')}
        >
          {eyebrow}
        </motion.p>
      )}
      <div className={cn('mx-auto mt-4', maxWidthClassName)}>{children}</div>
      {ctaLabel !== undefined && onCta !== undefined ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: ctaDelayS, ease: 'easeOut' }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <Button size="lg" className="min-h-14 min-w-[240px] rounded-full text-base font-semibold" onClick={onCta}>
            {ctaLabel}
          </Button>
          {secondaryText !== undefined && <p className={cn(TYPOGRAPHY.caption)}>{secondaryText}</p>}
        </motion.div>
      ) : null}
    </motion.div>
  )
}
