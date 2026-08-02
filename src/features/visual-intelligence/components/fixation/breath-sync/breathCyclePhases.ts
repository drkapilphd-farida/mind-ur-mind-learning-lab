import type { PhaseConfig } from '@/hooks/exercises/useExercisePhaseTimer'

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'pause'

export const PHASE_LABEL: Record<BreathPhase, string> = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  pause: 'Pause',
}

const BREATH_CYCLE: readonly { id: BreathPhase; durationMs: number }[] = [
  { id: 'inhale', durationMs: 4000 },
  { id: 'hold', durationMs: 2000 },
  { id: 'exhale', durationMs: 6000 },
  { id: 'pause', durationMs: 2000 },
]

// Repeats the 4-phase breathing cycle until totalDurationMs is filled, truncating
// the final phase so the sum is exact — 14s/cycle doesn't evenly divide the
// 30/45/60/90s session levels, and the session must still end at the level's
// real designed duration, never a value rounded to the nearest cycle boundary.
export function buildBreathCyclePhases(totalDurationMs: number): PhaseConfig<BreathPhase>[] {
  const phases: PhaseConfig<BreathPhase>[] = []
  let remainingMs = totalDurationMs
  let cycleStep = 0

  while (remainingMs > 0) {
    const template = BREATH_CYCLE[cycleStep % BREATH_CYCLE.length]!
    const durationMs = Math.min(template.durationMs, remainingMs)
    phases.push({ id: template.id, durationMs })
    remainingMs -= durationMs
    cycleStep += 1
  }

  return phases
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}
