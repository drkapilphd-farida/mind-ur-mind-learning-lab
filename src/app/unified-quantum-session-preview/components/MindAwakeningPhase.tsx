'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SkipForward } from 'lucide-react'
import { playClickChime } from './soundEngine'

const PHASE_DURATION_MS = 120_000
const BREATH_CYCLE_MS = 8_000 // 4s inhale + 4s exhale
const BREATH_HALF_CYCLE_MS = BREATH_CYCLE_MS / 2
const TICK_MS = 1_000

type MindAwakeningPhaseProps = {
  onComplete: () => void
  // 21-Day Transformation Journey™ — additive, optional, defaults to true
  // (today's exact standalone behavior in UnifiedQuantumSession). The
  // Journey's own first 3 days pass `false` here — building the calming
  // habit deliberately means no early-out during that mandatory window;
  // every later day still gets Skip, just one step earlier (a prep
  // screen before this component ever mounts — see QuantumJourneySession).
  allowSkip?: boolean
}

// Phase 1 — a 2-minute breathing circle, purely time-driven: the visual
// animation is one continuous CSS/Framer keyframe loop (never restarted
// by React state), while a separate 1-second ticker only tracks elapsed
// time for the "time remaining" label and the auto-advance at 120s. An
// explicit Skip button lets advanced users move on immediately instead
// of waiting out the full warm-up.
export function MindAwakeningPhase({ onComplete, allowSkip = true }: MindAwakeningPhaseProps): React.JSX.Element {
  const [elapsedMs, setElapsedMs] = useState(0)
  const isMountedRef = useRef(true)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (elapsedMs >= PHASE_DURATION_MS) {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete()
      }
      return
    }
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return
      setElapsedMs(Math.min(PHASE_DURATION_MS, elapsedMs + TICK_MS))
    }, TICK_MS)
    return () => clearTimeout(timeout)
  }, [elapsedMs, onComplete])

  function handleSkip(): void {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    playClickChime()
    onComplete()
  }

  const remainingMs = PHASE_DURATION_MS - elapsedMs
  const remainingSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const isInhaling = Math.floor(elapsedMs / BREATH_HALF_CYCLE_MS) % 2 === 0
  const breathLabel = isInhaling ? 'Breathe In' : 'Breathe Out'

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mind Awakening</p>
      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Settle In. Just Breathe.</h2>

      <div className="relative flex size-56 items-center justify-center">
        <motion.div
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: BREATH_CYCLE_MS / 1000, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-teal-500/30"
        />
        <motion.div
          animate={{ scale: [0.7, 1, 0.7] }}
          transition={{ duration: BREATH_CYCLE_MS / 1000, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-6 rounded-full border-2 border-indigo-500/40"
        />
        <span className="relative font-heading text-lg font-semibold text-foreground">{breathLabel}</span>
      </div>

      <p className="text-sm font-medium tabular-nums text-muted-foreground">
        {minutes}:{String(seconds).padStart(2, '0')} remaining
      </p>

      {allowSkip && (
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
        >
          Skip
          <SkipForward className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
