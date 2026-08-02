'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type CelebrationScreenProps = { onContinue: () => void }

// Screen 1 — Celebration™. One job: let the moment land before anything
// else. Understood in under 3 seconds.
export function CelebrationScreen({ onContinue }: CelebrationScreenProps): React.JSX.Element {
  return (
    <LearningPotentialLayout ctaLabel="Continue →" onCta={onContinue}>
      <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="text-5xl" aria-hidden="true">
        🎉
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.h1, 'mt-4')}
      >
        Discovery Complete
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.body, 'mt-3 text-muted-foreground')}
      >
        Your learning profile is ready.
      </motion.p>
    </LearningPotentialLayout>
  )
}
