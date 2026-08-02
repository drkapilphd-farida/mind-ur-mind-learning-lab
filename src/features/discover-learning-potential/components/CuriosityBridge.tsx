'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { CuriosityMoment } from '../types/CuriosityMoment'

type CuriosityBridgeProps = {
  moment: CuriosityMoment
  onDone: () => void
}

// Curiosity Loop™ framework — "every screen must create curiosity about
// the next screen... never let the experience feel flat." The existing
// `TransitionCard.tsx` (reading) and `WelcomeCard.tsx` (memory) already
// do this well inside their own modules and stay untouched. This is the
// one new shared primitive, used for this sprint's genuinely new
// hand-offs (e.g. the AI Profile screen's own "Your AI profile is almost
// ready..." beat before its real data reveals, and Memory/Focus
// Discovery's own Mission Curiosity Loop between missions) — a brief,
// real pause, never a wait long enough to feel like rushing.
const DISPLAY_MS = 1400

export function CuriosityBridge({ moment, onDone }: CuriosityBridgeProps): React.JSX.Element {
  useEffect(() => {
    const timer = window.setTimeout(onDone, DISPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3 px-6 text-center">
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className={TYPOGRAPHY.h2}>
        {moment.headline}
      </motion.p>
    </div>
  )
}
