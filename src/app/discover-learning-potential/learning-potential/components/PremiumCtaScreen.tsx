'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { useDiscoveryFlowStore } from '@/features/discover-learning-potential/store/useDiscoveryFlowStore'
import { derivePersonalizedFinalLine } from '@/features/learning-potential-reveal/learningPotentialCopy'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type PremiumCtaScreenProps = { onContinue: () => void }

// UDCE-1.5 Step-10 "Reinforce Trust™" — "quiet reassurance," no
// explanation. The real, locked flow always completes Reading, Memory,
// and Focus Discovery in order before this screen is reachable, so all
// three are honestly always true here.
const PERSONALIZED_FROM = ['Reading Discovery', 'Memory Discovery', 'Focus Discovery'] as const

// Screen 7 — Premium CTA™. "Start My Learning Journey" — never
// Subscribe/Buy Now/Upgrade/Premium Plan. Golden Rule: make the user
// excited to continue, never convinced to buy.
export function PremiumCtaScreen({ onContinue }: PremiumCtaScreenProps): React.JSX.Element {
  const learnerType = useDiscoveryFlowStore((state) => state.learnerType)
  const personalizedFinalLine = derivePersonalizedFinalLine(learnerType)

  return (
    <LearningPotentialLayout
      eyebrow="Your Journey Starts Here."
      ctaLabel="Start My Learning Journey"
      onCta={onContinue}
      secondaryText="Personalized from today's assessment."
    >
      <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="text-5xl" aria-hidden="true">
        🚀
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.h1, 'mt-4')}
      >
        Unlock Your AI Learning Studio
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.body, 'mt-3 text-muted-foreground')}
      >
        Your personalized journey starts today.
      </motion.p>

      {/* Step-9 "Personalize the Final Line™" — exactly one line, never
          all three learner-type options at once. */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
        className="mt-6 text-base font-semibold text-foreground"
      >
        {personalizedFinalLine}
      </motion.p>

      {/* Step-10 "Reinforce Trust™" — subtle, no explanation. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7, ease: 'easeOut' }}
        className="mt-5 space-y-1"
      >
        <p className={TYPOGRAPHY.caption}>Personalized From</p>
        {PERSONALIZED_FROM.map((stage) => (
          <p key={stage} className={TYPOGRAPHY.caption}>
            ✓ {stage}
          </p>
        ))}
      </motion.div>
    </LearningPotentialLayout>
  )
}
