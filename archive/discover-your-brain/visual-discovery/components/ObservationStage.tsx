'use client'

import { motion } from 'framer-motion'
import { Countdown } from './Countdown'
import { FocusPoint } from './FocusPoint'

type ObservationStagePhase = 'countdown' | 'observing'

type ObservationStageProps = {
  phase: ObservationStagePhase
  onCountdownComplete: () => void
}

// The beautiful centered observation area — the "stage" the actual
// interactive challenge will render inside of in the next screen. Here it
// only ever shows the countdown, then the focus point once ready; no
// challenge logic.
export function ObservationStage({ phase, onCountdownComplete }: ObservationStageProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
      className="relative mx-auto flex size-72 items-center justify-center sm:size-80"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200/50 via-sky-200/35 to-emerald-100/25 blur-2xl dark:from-violet-900/25 dark:via-sky-900/15 dark:to-emerald-900/15" />

      {/* One-time activation ring — plays once, right as observation begins, signaling "you're in now." */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-border/60"
        animate={phase === 'observing' ? { scale: [1, 1.06, 1], opacity: [1, 0.6, 1] } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      <div className="relative flex size-full items-center justify-center">
        {phase === 'countdown' ? (
          <Countdown startDelayMs={1000} onComplete={onCountdownComplete} />
        ) : (
          <FocusPoint />
        )}
      </div>
    </motion.div>
  )
}
