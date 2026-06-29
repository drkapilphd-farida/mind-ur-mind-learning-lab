'use client'

import { useExercisePhaseTimer } from '@/hooks/exercises/useExercisePhaseTimer'
import { buildPhasesFromSequence } from '@/lib/exercises/buildPhasesFromSequence'
import { ExercisePracticeLayout } from '@/components/exercises/ExercisePracticeLayout'
import { ExerciseStage, getReducedMotionCaptionProps } from '@/components/exercises/ExerciseStage'

type EyeStretchCanvasProps = {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}

const CENTER_OFFSET = { x: 0, y: 0 }

// A center anchor, then a target glances out to each side and returns —
// a deliberate stretch, not a continuous sweep. Two passes, the second
// reaching a little further, the way a real stretch gently deepens.
const STRETCH_SEQUENCE = [
  { id: 'settle', metadata: CENTER_OFFSET, durationMs: 1500 },
  { id: 'left-1', metadata: { x: -22, y: 0 }, durationMs: 3000 },
  { id: 'center-1', metadata: CENTER_OFFSET, durationMs: 1700 },
  { id: 'right-1', metadata: { x: 22, y: 0 }, durationMs: 3000 },
  { id: 'center-2', metadata: CENTER_OFFSET, durationMs: 1700 },
  { id: 'up-1', metadata: { x: 0, y: -18 }, durationMs: 3000 },
  { id: 'center-3', metadata: CENTER_OFFSET, durationMs: 1700 },
  { id: 'down-1', metadata: { x: 0, y: 18 }, durationMs: 3000 },
  { id: 'center-4', metadata: CENTER_OFFSET, durationMs: 1700 },
  { id: 'left-2', metadata: { x: -32, y: 0 }, durationMs: 3600 },
  { id: 'center-5', metadata: CENTER_OFFSET, durationMs: 1700 },
  { id: 'right-2', metadata: { x: 32, y: 0 }, durationMs: 3600 },
  { id: 'center-6', metadata: CENTER_OFFSET, durationMs: 1700 },
  { id: 'up-2', metadata: { x: 0, y: -26 }, durationMs: 3600 },
  { id: 'center-7', metadata: CENTER_OFFSET, durationMs: 1700 },
  { id: 'down-2', metadata: { x: 0, y: 26 }, durationMs: 3600 },
  { id: 'rest', metadata: CENTER_OFFSET, durationMs: 2300 },
] as const

const { phases: PHASES, metadataByPhase: OFFSET_BY_PHASE } = buildPhasesFromSequence(STRETCH_SEQUENCE)

export function EyeStretchCanvas({ onComplete, onExit }: EyeStretchCanvasProps): React.JSX.Element {
  const timer = useExercisePhaseTimer(PHASES, onComplete)

  function handleExit(): void {
    onExit(timer.totalElapsedMs)
  }

  const offset = timer.prefersReducedMotion ? CENTER_OFFSET : OFFSET_BY_PHASE[timer.phaseId]
  const opacity = timer.boundaryOpacity

  return (
    <ExercisePracticeLayout progress={timer.progress} onExit={handleExit}>
      <ExerciseStage {...getReducedMotionCaptionProps(timer.prefersReducedMotion)}>
        <div
          className={timer.prefersReducedMotion ? undefined : 'transition-transform duration-700 ease-in-out'}
          style={{ transform: `translate(${offset.x}cqmin, ${offset.y}cqmin)` }}
        >
          <div
            aria-hidden="true"
            className="size-5 rounded-full bg-primary shadow-[0_0_24px_rgba(0,0,0,0.15)] sm:size-6"
            style={{ animation: 'exercise-reduced-motion-pulse 2.2s ease-in-out infinite', opacity }}
          />
        </div>
      </ExerciseStage>
    </ExercisePracticeLayout>
  )
}
