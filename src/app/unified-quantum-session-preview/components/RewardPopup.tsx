'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { playRewardChime } from './soundEngine'

const AUTO_DISMISS_MS = 1800

type RewardPopupProps = {
  title: string
  statLine?: string
  xpAwarded: number
  onDismiss: () => void
}

// A brief, tap-or-wait micro-reward overlay shown after every level —
// the core "constant momentum" dopamine loop: a chime, a short spring-in
// animation, then it gets out of the way on its own (or on a tap) so the
// next level starts without the user having to hunt for a button.
export function RewardPopup({ title, statLine, xpAwarded, onDismiss }: RewardPopupProps): React.JSX.Element {
  useEffect(() => {
    playRewardChime()
    const timeout = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timeout)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-background/70 px-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.85, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl border border-border/60 bg-card px-8 py-8 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 text-white"
        >
          <Sparkles className="size-7" aria-hidden="true" />
        </motion.div>
        <p className="font-heading text-lg font-bold text-foreground">{title}</p>
        {statLine !== undefined && <p className="text-sm font-medium text-muted-foreground">{statLine}</p>}
        <p className="font-heading text-2xl font-bold text-primary tabular-nums">+{xpAwarded} XP</p>
        <p className="text-[11px] text-muted-foreground/70">Tap to continue</p>
      </motion.div>
    </motion.div>
  )
}
