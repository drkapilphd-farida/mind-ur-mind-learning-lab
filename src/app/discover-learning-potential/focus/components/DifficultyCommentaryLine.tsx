'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { pickDifficultyCommentary } from '@/features/focus-discovery/pickDifficultyCommentary'

type DifficultyCommentaryLineProps = {
  levelIndex: number
  // Sprint-1.8 Anti-Frustration System™ — `true` the exact round the
  // Adaptive Difficulty Engine™ chose to hold the current real level
  // rather than advance (`levelIndex` itself won't change that round).
  justStabilized?: boolean
  // Missions whose real level can now stabilize need a trigger key that
  // still changes every real round even when `levelIndex` doesn't (the
  // real round counter). Missions without stabilization can omit this —
  // `levelIndex` itself is already a safe trigger for them.
  triggerKey?: number
}

const DISPLAY_MS = 1600

// Sprint-1.7 RULE-05 Progressive AI Commentary™ — a real, transient,
// self-clearing line shown only at the moment a mission's own real
// level actually goes up (never on Level 1, never a popup, never
// blocking the next tap). Reused identically across every mission
// rather than five separate implementations.
export function DifficultyCommentaryLine({ levelIndex, justStabilized = false, triggerKey }: DifficultyCommentaryLineProps): React.JSX.Element | null {
  const key = triggerKey ?? levelIndex
  const [visible, setVisible] = useState(key > 0)

  useEffect(() => {
    if (key <= 0) return undefined
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), DISPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [key])

  const message = pickDifficultyCommentary(levelIndex, justStabilized)
  if (message === null) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-2 text-xs font-medium text-muted-foreground/80"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
