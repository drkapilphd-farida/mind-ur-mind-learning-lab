'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type PersonalizedRoadmapScreenProps = { onContinue: () => void }

// UDCE-1.5 Step-5 "Humanize the Roadmap™" — real capability names, never
// generic "Week N" labels.
const ROADMAP_STEPS = ['Reading Intelligence', 'Memory Intelligence', 'Focus Intelligence', "Dr. Kapil's Mentorship™"] as const

const STEP_S = 0.12

// Screen 5 — Personalized Roadmap™. A calm, locked-order journey list —
// no dates, no commitments, just the shape of what's ahead.
export function PersonalizedRoadmapScreen({ onContinue }: PersonalizedRoadmapScreenProps): React.JSX.Element {
  return (
    <LearningPotentialLayout eyebrow="Designed Around You." ctaLabel="Continue" onCta={onContinue}>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={TYPOGRAPHY.h1}>
        Your First 21 Days
      </motion.h1>
      <div className="mt-6 flex flex-col items-stretch gap-2">
        {ROADMAP_STEPS.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + index * STEP_S, ease: 'easeOut' }}
            className="rounded-xl border border-border/40 bg-card px-4 py-3 text-left text-sm font-medium text-foreground"
          >
            {step}
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 + ROADMAP_STEPS.length * STEP_S + 0.15, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.caption, 'mt-5')}
      >
        Built around your learning profile.
      </motion.p>
    </LearningPotentialLayout>
  )
}
