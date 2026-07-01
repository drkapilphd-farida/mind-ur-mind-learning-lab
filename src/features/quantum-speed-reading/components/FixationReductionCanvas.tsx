'use client'

import { useRef } from 'react'
import { useExercisePhaseTimer } from '@/hooks/exercises/useExercisePhaseTimer'
import { buildPhasesFromSequence } from '@/lib/exercises/buildPhasesFromSequence'
import { ExercisePracticeLayout } from '@/components/exercises/ExercisePracticeLayout'
import { ExerciseStage, getReducedMotionCaptionProps } from '@/components/exercises/ExerciseStage'

type FixationReductionCanvasProps = {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}

type Stop = { x: number } | null

const LINE_HALF_WIDTH_CQ = 30
const STATIC_POINT_COUNT = 7

function pointsAlongLine(count: number): number[] {
  if (count === 1) {
    return [0]
  }

  const step = (LINE_HALF_WIDTH_CQ * 2) / (count - 1)
  return Array.from({ length: count }, (_, i) => -LINE_HALF_WIDTH_CQ + i * step)
}

// Four passes across the same line, each covering it in fewer fixations —
// 7 stops, then 4, then 3, then 2. The eye learns to cross the same
// distance in progressively fewer, longer jumps.
const PASSES = [
  { stopCount: 7, stopDurationMs: 1500 },
  { stopCount: 4, stopDurationMs: 1700 },
  { stopCount: 3, stopDurationMs: 1900 },
  { stopCount: 2, stopDurationMs: 2200 },
]

const REST_MS = 2800
const FINAL_REST_MS = 2600

const FIXATION_SEQUENCE: { id: string; durationMs: number; metadata: Stop }[] = [
  { id: 'settle', durationMs: 1500, metadata: null },
]

PASSES.forEach((pass, passIndex) => {
  pointsAlongLine(pass.stopCount).forEach((x, stopIndex) => {
    FIXATION_SEQUENCE.push({
      id: `pass${passIndex + 1}-${stopIndex + 1}`,
      durationMs: pass.stopDurationMs,
      metadata: { x },
    })
  })

  FIXATION_SEQUENCE.push({
    id: `rest-${passIndex + 1}`,
    durationMs: passIndex === PASSES.length - 1 ? FINAL_REST_MS : REST_MS,
    metadata: null,
  })
})

const { phases: PHASES, metadataByPhase: STOP_BY_PHASE } = buildPhasesFromSequence(FIXATION_SEQUENCE)

const STATIC_POINTS = pointsAlongLine(STATIC_POINT_COUNT)

export function FixationReductionCanvas({ onComplete, onExit }: FixationReductionCanvasProps): React.JSX.Element {
  const timer = useExercisePhaseTimer(PHASES, onComplete)
  const lastXRef = useRef(0)

  function handleExit(): void {
    onExit(timer.totalElapsedMs)
  }

  const stop = STOP_BY_PHASE[timer.phaseId] ?? null
  if (stop !== null) {
    lastXRef.current = stop.x
  }

  const highlightTransition = timer.prefersReducedMotion
    ? undefined
    : 'transform 500ms ease-in-out, opacity 300ms ease-in-out'

  return (
    <ExercisePracticeLayout progress={timer.progress} onExit={handleExit}>
      <ExerciseStage {...getReducedMotionCaptionProps(timer.prefersReducedMotion)}>
        <div className="relative" style={{ opacity: timer.boundaryOpacity }}>
          {STATIC_POINTS.map((x) => (
            <div
              key={x}
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-1.5 rounded-full bg-muted-foreground/40"
              style={{ transform: `translate(-50%, -50%) translate(${x}cqmin, 0)` }}
            />
          ))}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-3 rounded-full bg-primary shadow-[0_0_20px_rgba(0,0,0,0.15)]"
            style={{
              transform: `translate(-50%, -50%) translate(${lastXRef.current}cqmin, 0)`,
              opacity: stop !== null ? 1 : 0,
              transition: highlightTransition,
            }}
          />
        </div>
      </ExerciseStage>
    </ExercisePracticeLayout>
  )
}
