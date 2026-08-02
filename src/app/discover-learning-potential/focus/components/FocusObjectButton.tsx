'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FOCUS_COLOR_CLASS, FOCUS_SHAPE_GLYPH, type FocusColor, type FocusObject } from '@/features/focus-discovery/focusObjects'
import { BLINK_INTERVAL_MS } from '@/features/focus-discovery/focusTimingConfig'
import { cn } from '@/lib/utils'

type FocusObjectButtonProps = {
  object: FocusObject
  onTap: (object: FocusObject) => void
  // Sprint-1.5 FIX-01 Dynamic Distractor Engine™ — real, cumulative
  // distraction dimensions, each opt-in and independently combinable
  // (never applied when the user prefers reduced motion — see each
  // mission's own generator for its own accessibility fallback).
  isMoving?: boolean
  isBlinking?: boolean
  isSmall?: boolean
  // A real second colour this same object shifts to partway through its
  // own display window — real "colour changes" (FIX-01), a self-
  // contained internal timeout so callers never coordinate exact
  // display-window timing themselves.
  midTickColor?: FocusColor | undefined
  // Sprint-1.6 FIX-02/FIX-05 — a real, transient one-shot reaction to
  // this exact tap, owned by the parent (which alone knows whether a
  // tap was correct). 'wrong' shakes and softly reddens in place
  // (cleared by the parent after a brief real delay). 'correct' is only
  // ever passed by missions where the object stays on screen after a
  // correct tap (Reaction Focus™, Sustained Focus™) — grid missions
  // instead remove the object outright (see the real `exit` animation
  // below), which already carries its own real positive-reward glow.
  feedback?: 'correct' | 'wrong' | null
}

const MID_TICK_COLOR_SHIFT_MS = 500

// FIX-09 Premium Motion Language™ — "Scale (≈80ms) → Fade (≈120ms)."
// One real 200ms keyframe sequence: the first 40% of the duration
// scales down (with a real, soft positive-reward glow — FIX-05's own
// "tiny spark, micro glow"), the remaining 60% fades to fully
// transparent. Framer Motion plays this automatically the instant a
// parent stops rendering this object (wrapped in `AnimatePresence`) —
// no manual removal delay needed anywhere else.
const REMOVE_EXIT = {
  scale: [1, 0.85, 0.85],
  opacity: [1, 1, 0],
  backgroundColor: ['rgba(34,197,94,0)', 'rgba(34,197,94,0.35)', 'rgba(34,197,94,0)'],
  transition: { duration: 0.2, times: [0, 0.4, 1], ease: 'easeOut' as const },
}

// The one shared, tappable glyph every grid-based mission (Attention
// Lock™, Visual Search™, Cognitive Flexibility™, Sustained Focus™)
// renders — real shape + real colour, absolutely positioned by real
// percentage coordinates (`focusObjects.ts`'s own seeded, non-
// overlapping placement).
export function FocusObjectButton({
  object,
  onTap,
  isMoving = false,
  isBlinking = false,
  isSmall = false,
  midTickColor,
  feedback = null,
}: FocusObjectButtonProps): React.JSX.Element {
  const [colorShifted, setColorShifted] = useState(false)

  useEffect(() => {
    if (midTickColor === undefined) return undefined
    setColorShifted(false)
    const timer = window.setTimeout(() => setColorShifted(true), MID_TICK_COLOR_SHIFT_MS)
    return () => window.clearTimeout(timer)
  }, [midTickColor, object.id])

  const displayColor = colorShifted && midTickColor !== undefined ? midTickColor : object.color

  return (
    <motion.button
      type="button"
      onClick={() => onTap(object)}
      aria-label={`${object.color} ${object.shape}`}
      className={cn(
        'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full leading-none',
        isSmall ? 'size-8 text-2xl sm:size-9 sm:text-3xl' : 'size-12 text-4xl sm:size-14 sm:text-5xl',
        FOCUS_COLOR_CLASS[displayColor],
      )}
      style={{ left: `${object.xPercent}%`, top: `${object.yPercent}%` }}
      exit={REMOVE_EXIT}
      animate={{
        x: feedback === 'wrong' ? [0, -6, 6, -6, 0] : isMoving ? [0, 10, -10, 0] : 0,
        y: isMoving && feedback !== 'wrong' ? [0, -8, 8, 0] : 0,
        opacity: isBlinking && feedback === null ? [1, 0.35, 1] : 1,
        scale: feedback === 'correct' ? [1, 1.2, 1] : 1,
        backgroundColor:
          feedback === 'wrong'
            ? ['rgba(239,68,68,0)', 'rgba(239,68,68,0.3)', 'rgba(239,68,68,0)']
            : feedback === 'correct'
              ? ['rgba(34,197,94,0)', 'rgba(34,197,94,0.3)', 'rgba(34,197,94,0)']
              : 'rgba(0,0,0,0)',
      }}
      transition={{
        x: feedback === 'wrong' ? { duration: 0.2 } : isMoving ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 },
        y: isMoving && feedback !== 'wrong' ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 },
        opacity: isBlinking && feedback === null ? { duration: BLINK_INTERVAL_MS / 1000, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 },
        scale: { duration: 0.2 },
        backgroundColor: { duration: 0.2 },
      }}
    >
      {FOCUS_SHAPE_GLYPH[object.shape]}
    </motion.button>
  )
}
