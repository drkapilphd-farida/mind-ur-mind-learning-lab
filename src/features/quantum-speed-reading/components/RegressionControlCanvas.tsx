'use client'

import { useExercisePhaseTimer } from '@/hooks/exercises/useExercisePhaseTimer'
import { buildPhasesFromSequence } from '@/lib/exercises/buildPhasesFromSequence'
import { ExercisePracticeLayout } from '@/components/exercises/ExercisePracticeLayout'
import { ExerciseStage, getReducedMotionCaptionProps } from '@/components/exercises/ExerciseStage'

type RegressionControlCanvasProps = {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}

type PhaseMeta = { isSweep: boolean }

const LINE_START_CQ = -30
const LINE_END_CQ = 30
const STATIC_POINT_COUNT = 7

function pointsAlongLine(count: number): number[] {
  const step = (LINE_END_CQ - LINE_START_CQ) / (count - 1)
  return Array.from({ length: count }, (_, i) => LINE_START_CQ + i * step)
}

// Five forward-only sweeps, gently quickening, each followed by a calm
// rest. There is never a backward motion to watch — the point only ever
// moves ahead, and what it's already passed visibly settles behind it.
const SWEEP_DURATIONS_MS = [4800, 4000, 3400, 2900, 2500]
const REST_MS = 3000
const FINAL_REST_MS = 3200

const REGRESSION_SEQUENCE: { id: string; durationMs: number; metadata: PhaseMeta }[] = [
  { id: 'settle', durationMs: 1500, metadata: { isSweep: false } },
]

SWEEP_DURATIONS_MS.forEach((durationMs, index) => {
  REGRESSION_SEQUENCE.push({ id: `sweep-${index + 1}`, durationMs, metadata: { isSweep: true } })
  REGRESSION_SEQUENCE.push({
    id: `rest-${index + 1}`,
    durationMs: index === SWEEP_DURATIONS_MS.length - 1 ? FINAL_REST_MS : REST_MS,
    metadata: { isSweep: false },
  })
})

const { phases: PHASES, metadataByPhase: META_BY_PHASE } = buildPhasesFromSequence(REGRESSION_SEQUENCE)

const STATIC_POINTS = pointsAlongLine(STATIC_POINT_COUNT)

const UPCOMING_OPACITY = 0.45
const PASSED_OPACITY = 0.15

export function RegressionControlCanvas({ onComplete, onExit }: RegressionControlCanvasProps): React.JSX.Element {
  const timer = useExercisePhaseTimer(PHASES, onComplete)

  function handleExit(): void {
    onExit(timer.totalElapsedMs)
  }

  const meta = META_BY_PHASE[timer.phaseId] ?? { isSweep: false }
  const sweepProgress = meta.isSweep ? Math.min(1, timer.elapsedInPhaseMs / timer.phaseDurationMs) : null
  const headX = sweepProgress === null ? null : LINE_START_CQ + (LINE_END_CQ - LINE_START_CQ) * sweepProgress

  return (
    <ExercisePracticeLayout progress={timer.progress} onExit={handleExit}>
      <ExerciseStage {...getReducedMotionCaptionProps(timer.prefersReducedMotion)}>
        <div className="relative" style={{ opacity: timer.boundaryOpacity }}>
          {STATIC_POINTS.map((x) => {
            const opacity = timer.prefersReducedMotion
              ? UPCOMING_OPACITY
              : headX !== null && x <= headX
                ? PASSED_OPACITY
                : UPCOMING_OPACITY

            return (
              <div
                key={x}
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 size-1.5 rounded-full bg-muted-foreground transition-opacity duration-500 ease-out"
                style={{ transform: `translate(-50%, -50%) translate(${x}cqmin, 0)`, opacity }}
              />
            )
          })}
          {!timer.prefersReducedMotion && (
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-3 rounded-full bg-primary shadow-[0_0_20px_rgba(0,0,0,0.15)]"
              style={{
                transform: `translate(-50%, -50%) translate(${headX ?? LINE_START_CQ}cqmin, 0)`,
                opacity: headX === null ? 0 : 1,
              }}
            />
          )}
          {timer.prefersReducedMotion && (
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-3 rounded-full bg-primary"
              style={{
                transform: 'translate(-50%, -50%)',
                animation: 'exercise-reduced-motion-pulse 2.2s ease-in-out infinite',
              }}
            />
          )}
        </div>
      </ExerciseStage>
    </ExercisePracticeLayout>
  )
}
