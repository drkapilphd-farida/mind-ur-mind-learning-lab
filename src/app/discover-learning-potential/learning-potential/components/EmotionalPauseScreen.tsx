'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { LearningPotentialLayout } from './LearningPotentialLayout'

type EmotionalPauseScreenProps = { onDone: () => void }

const LINES = ['Your journey doesn’t end here.', 'This is where real learning begins.'] as const
const LINE_DISPLAY_MS = 1600

// UDCE-1.5 Step-3 "Add One Emotional Pause™" — one quiet transition, no
// button, no competing idea. Two lines, one at a time, then a real,
// automatic advance — mirrors this codebase's own established
// auto-continue precedent (`MissionCompleteCard`'s `AUTO_CONTINUE_MS`).
export function EmotionalPauseScreen({ onDone }: EmotionalPauseScreenProps): React.JSX.Element {
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    if (lineIndex >= LINES.length - 1) {
      const timer = window.setTimeout(onDone, LINE_DISPLAY_MS)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setLineIndex((index) => index + 1), LINE_DISPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [lineIndex, onDone])

  return (
    <LearningPotentialLayout>
      <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="text-4xl" aria-hidden="true">
        ✨
      </motion.p>
      <AnimatePresence mode="wait">
        <motion.p
          key={lineIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(TYPOGRAPHY.h2, 'mt-4 text-muted-foreground')}
        >
          {LINES[lineIndex]}
        </motion.p>
      </AnimatePresence>
    </LearningPotentialLayout>
  )
}
