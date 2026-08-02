'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { useExercisePhaseTimer } from '@/hooks/exercises/useExercisePhaseTimer'
import { playSound } from '@/lib/audio/soundManager'
import { FixationDot } from '../FixationDot'
import { buildBreathCyclePhases, easeInOutCubic, lerp, PHASE_LABEL, type BreathPhase } from './breathCyclePhases'

type BreathSyncSessionProps = {
  durationSeconds: number
  onComplete: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Drives a real 4-phase breathing cycle (4s in / 2s hold / 6s out / 2s pause,
// repeating for the full session) via useExercisePhaseTimer — the same
// rAF-driven engine already proven across 12 other exercises. All timing
// and the countdown/progress ring come from that single hook now; there is
// no separate ticking effect to fall out of sync with the phase cycle.
export function BreathSyncSession({ durationSeconds, onComplete }: BreathSyncSessionProps): React.JSX.Element {
  const phases = useMemo(() => buildBreathCyclePhases(durationSeconds * 1000), [durationSeconds])

  const handlePhaseTimerComplete = useCallback(() => {
    playSound('completion')
    onComplete()
  }, [onComplete])

  const { phaseId, elapsedInPhaseMs, phaseDurationMs, totalElapsedMs, totalDurationMs, progress, prefersReducedMotion } =
    useExercisePhaseTimer<BreathPhase>(phases, handlePhaseTimerComplete)

  const previousPhaseRef = useRef<BreathPhase | null>(null)
  useEffect(() => {
    if (previousPhaseRef.current === phaseId) return
    previousPhaseRef.current = phaseId
    if (phaseId === 'inhale' || phaseId === 'hold' || phaseId === 'exhale') {
      playSound(phaseId)
    }
  }, [phaseId])

  useEffect(() => {
    playSound('ambient')
    // Mount-once: a future ambient loop would start once per session, not per render.
  }, [])

  const rawPhaseProgress = phaseDurationMs > 0 ? Math.min(1, elapsedInPhaseMs / phaseDurationMs) : 1
  const eased = prefersReducedMotion ? 1 : easeInOutCubic(rawPhaseProgress)

  // breathT: 0 = fully contracted (resting), 1 = fully expanded — a single
  // normalized value driving the dot, glow ring, and background aura together.
  const breathT = phaseId === 'inhale' ? eased : phaseId === 'hold' ? 1 : phaseId === 'exhale' ? 1 - eased : 0

  const dotScale = lerp(1, 1.7, breathT)
  const glowScale = lerp(1.3, 2.1, breathT)
  const glowOpacity = lerp(0.15, 0.35, breathT)
  const auraScale = lerp(1, 1.18, breathT)
  const auraOpacity = lerp(0.03, 0.09, breathT)

  const remainingSeconds = Math.max(0, Math.ceil((totalDurationMs - totalElapsedMs) / 1000))

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-8 overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-14 text-center">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Breath Sync™</p>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div
          className="size-64 rounded-full bg-primary blur-3xl"
          style={{ transform: `scale(${auraScale})`, opacity: auraOpacity }}
        />
      </div>

      <div className="relative flex size-48 items-center justify-center">
        <div
          className="absolute inset-0 m-auto size-14 rounded-full bg-primary blur-xl"
          style={{ transform: `scale(${glowScale})`, opacity: glowOpacity }}
          aria-hidden="true"
        />
        <FixationDot size={28} className="relative" style={{ transform: `scale(${dotScale})` }} />
      </div>

      <p className="font-heading text-2xl font-bold tracking-tight text-foreground" aria-live="polite">
        {PHASE_LABEL[phaseId]}
      </p>

      <ProgressRing
        progress={progress}
        size={64}
        label={formatTime(remainingSeconds)}
        accessibleLabel={`${formatTime(remainingSeconds)} remaining`}
      />
    </div>
  )
}
