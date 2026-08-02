'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { CelebrationTrigger } from './types'

type CelebrationOverlayProps = {
  trigger: CelebrationTrigger
  onContinue: () => void
}

// Gamification framework — Sprint-1's one real, reusable celebration
// primitive (none existed anywhere in this codebase before this sprint —
// confirmed by search). Deliberately never auto-dismisses: "Never rush
// users... instructions remain visible until the user presses [the next
// action]," same timing rule the locked spec sets for every other screen
// in this flow. Used once in Sprint-1, for the AI Profile reveal — the
// one moment this sprint's own brief calls "the emotional reward."
export function CelebrationOverlay({ trigger, onContinue }: CelebrationOverlayProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex size-14 items-center justify-center rounded-full bg-primary/10"
      >
        <Sparkles className="size-6 text-primary" aria-hidden="true" />
      </motion.div>
      <p className={TYPOGRAPHY.h3}>{trigger.headline}</p>
      <Button onClick={onContinue}>Continue</Button>
    </motion.div>
  )
}
