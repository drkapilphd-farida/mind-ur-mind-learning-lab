'use client'

import { useExercisePhaseTimer, type PhaseConfig } from '@/hooks/exercises/useExercisePhaseTimer'
import { ExercisePracticeLayout } from '@/components/exercises/ExercisePracticeLayout'
import { ExerciseStage, getReducedMotionCaptionProps } from '@/components/exercises/ExerciseStage'

type EyeWarmupCanvasProps = {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}

type EyeWarmupPhase = 'settle' | 'horizontal' | 'vertical' | 'curve' | 'rest'

const PHASES: PhaseConfig<EyeWarmupPhase>[] = [
  { id: 'settle', durationMs: 1500 },
  { id: 'horizontal', durationMs: 12000 },
  { id: 'vertical', durationMs: 12000 },
  { id: 'curve', durationMs: 16000 },
  { id: 'rest', durationMs: 2000 },
]

const HORIZONTAL_AMPLITUDE_CQ = 26
const VERTICAL_AMPLITUDE_CQ = 20
const CURVE_AMPLITUDE_X_CQ = 20
const CURVE_AMPLITUDE_Y_CQ = 14
const HORIZONTAL_PERIOD_S = 3
const VERTICAL_PERIOD_S = 3
const CURVE_PERIOD_S = 4

function getOrbOffset(phase: EyeWarmupPhase, elapsedInPhaseMs: number): { x: number; y: number } {
  const t = elapsedInPhaseMs / 1000

  if (phase === 'horizontal') {
    return { x: HORIZONTAL_AMPLITUDE_CQ * Math.sin((2 * Math.PI * t) / HORIZONTAL_PERIOD_S), y: 0 }
  }

  if (phase === 'vertical') {
    return { x: 0, y: VERTICAL_AMPLITUDE_CQ * Math.sin((2 * Math.PI * t) / VERTICAL_PERIOD_S) }
  }

  if (phase === 'curve') {
    return {
      x: CURVE_AMPLITUDE_X_CQ * Math.sin((2 * Math.PI * t) / CURVE_PERIOD_S),
      y: CURVE_AMPLITUDE_Y_CQ * Math.sin((4 * Math.PI * t) / CURVE_PERIOD_S),
    }
  }

  return { x: 0, y: 0 }
}

export function EyeWarmupCanvas({ onComplete, onExit }: EyeWarmupCanvasProps): React.JSX.Element {
  const timer = useExercisePhaseTimer(PHASES, onComplete)

  function handleExit(): void {
    onExit(timer.totalElapsedMs)
  }

  const offset = timer.prefersReducedMotion ? { x: 0, y: 0 } : getOrbOffset(timer.phaseId, timer.elapsedInPhaseMs)
  const opacity = timer.boundaryOpacity

  const orbStyle: React.CSSProperties =
    timer.prefersReducedMotion || timer.phaseId === 'settle'
      ? { animation: 'exercise-reduced-motion-pulse 2.4s ease-in-out infinite', opacity }
      : timer.phaseId === 'rest'
        ? { opacity }
        : { transform: `translate(${offset.x}cqmin, ${offset.y}cqmin)`, opacity }

  return (
    <ExercisePracticeLayout progress={timer.progress} onExit={handleExit}>
      <ExerciseStage {...getReducedMotionCaptionProps(timer.prefersReducedMotion)}>
        <div
          aria-hidden="true"
          className="size-5 rounded-full bg-primary shadow-[0_0_24px_rgba(0,0,0,0.15)] sm:size-6"
          style={orbStyle}
        />
      </ExerciseStage>
    </ExercisePracticeLayout>
  )
}
