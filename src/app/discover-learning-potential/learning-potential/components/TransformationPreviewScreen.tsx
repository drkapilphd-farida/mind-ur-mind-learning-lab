'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type TransformationPreviewScreenProps = { onContinue: () => void }

const CARDS = [
  { emoji: '⚡', label: 'Finish Chapters Faster' },
  { emoji: '🧠', label: 'Remember More' },
  { emoji: '🎯', label: 'Stay Focused' },
  { emoji: '📈', label: 'Improve Every Week' },
] as const

const CARD_STEP_S = 0.16
// UDCE-1.5 Step-4 "Make the Future Feel Real™" — "Allow users time to
// imagine." A real, deliberate pause after the last card lands, before
// Continue appears.
const TRANSFORMATION_CTA_DELAY_S = 0.2 + CARDS.length * CARD_STEP_S + 0.6

// Screen 4 — Transformation Preview™. Animated identity cards only — no
// descriptions, no explanation, per the locked brief.
export function TransformationPreviewScreen({ onContinue }: TransformationPreviewScreenProps): React.JSX.Element {
  return (
    <LearningPotentialLayout
      eyebrow="Next Level Learning."
      ctaLabel="Continue"
      onCta={onContinue}
      maxWidthClassName="max-w-sm"
      ctaDelayS={TRANSFORMATION_CTA_DELAY_S}
    >
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={TYPOGRAPHY.h1}>
        Imagine Learning Like This
      </motion.h1>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {CARDS.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 + index * CARD_STEP_S, ease: 'easeOut' }}
            className="rounded-2xl border border-border/40 bg-card p-4"
          >
            <p className="text-2xl" aria-hidden="true">
              {card.emoji}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">{card.label}</p>
          </motion.div>
        ))}
      </div>
    </LearningPotentialLayout>
  )
}
