'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type IdentityRevealScreenProps = { identity: string; onContinue: () => void }

// UDCE-1.5 Step-1 "Slow Down the Emotional Peak™" — the user needs a
// real moment to think "this feels accurate" before being invited to
// continue. A deliberately longer, calmer delay than every other screen.
const IDENTITY_CTA_DELAY_S = 2.2

// Screen 2 — Identity Reveal™. "Sell a Better Future Version of the
// User" starts here: the real (or honestly generic) identity is the
// hero, not a number.
export function IdentityRevealScreen({ identity, onContinue }: IdentityRevealScreenProps): React.JSX.Element {
  return (
    <LearningPotentialLayout eyebrow="Profile Ready" ctaLabel="Continue" onCta={onContinue} ctaDelayS={IDENTITY_CTA_DELAY_S}>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={TYPOGRAPHY.h1}>
        Your Learning Profile
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
        className="mt-4 font-heading text-4xl font-bold text-foreground"
      >
        {identity}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.body, 'mt-4 text-muted-foreground')}
      >
        Built to learn. Ready to improve.
      </motion.p>
    </LearningPotentialLayout>
  )
}
