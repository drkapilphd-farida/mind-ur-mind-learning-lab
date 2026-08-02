'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type FinalBridgeScreenProps = { onContinue: () => void }

const OUTCOMES = ['Reading feels easier.', 'Revision takes less time.', 'You remember more.', 'Learning feels effortless.'] as const

const CARD_STEP_S = 0.16
const FINAL_BRIDGE_CTA_DELAY_S = 0.2 + OUTCOMES.length * CARD_STEP_S + 0.5

// UDCE-1.5 Step-7 "Create One Final Emotional Bridge™" — believable
// possibilities only, never exaggerated promises or guarantees.
export function FinalBridgeScreen({ onContinue }: FinalBridgeScreenProps): React.JSX.Element {
  return (
    <LearningPotentialLayout eyebrow="Keep Growing" ctaLabel="Continue" onCta={onContinue} ctaDelayS={FINAL_BRIDGE_CTA_DELAY_S}>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={TYPOGRAPHY.h1}>
        Imagine One Month From Today…
      </motion.h1>
      <div className="mt-6 flex flex-col gap-2">
        {OUTCOMES.map((outcome, index) => (
          <motion.div
            key={outcome}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + index * CARD_STEP_S, ease: 'easeOut' }}
            className="rounded-xl border border-border/40 bg-card px-4 py-3 text-left text-sm font-medium text-foreground"
          >
            ✓ {outcome}
          </motion.div>
        ))}
      </div>
    </LearningPotentialLayout>
  )
}
