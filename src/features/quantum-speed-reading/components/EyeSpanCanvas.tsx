'use client'

import { useExercisePhaseTimer } from '@/hooks/exercises/useExercisePhaseTimer'
import { buildPhasesFromSequence } from '@/lib/exercises/buildPhasesFromSequence'
import { ExercisePracticeLayout } from '@/components/exercises/ExercisePracticeLayout'
import { ExerciseStage } from '@/components/exercises/ExerciseStage'

type EyeSpanCanvasProps = {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}

type TrialConfig = { itemsPerSide: number; spreadCq: number }

// A steady center fixation point; a small symmetric cluster flashes briefly
// around it while the eyes stay put. Each trial widens the spread and
// shortens the flash a little — the same "calm and progressive" arc as the
// other two exercises, just expressed as discrete glances outward instead
// of continuous or point-to-point motion.
const SPAN_SEQUENCE: { id: string; durationMs: number; metadata: TrialConfig | null }[] = [
  { id: 'settle', durationMs: 1500, metadata: null },
  { id: 'trial-1', durationMs: 2600, metadata: { itemsPerSide: 1, spreadCq: 8 } },
  { id: 'rest-1', durationMs: 3700, metadata: null },
  { id: 'trial-2', durationMs: 2400, metadata: { itemsPerSide: 1, spreadCq: 13 } },
  { id: 'rest-2', durationMs: 3700, metadata: null },
  { id: 'trial-3', durationMs: 2300, metadata: { itemsPerSide: 2, spreadCq: 17 } },
  { id: 'rest-3', durationMs: 3700, metadata: null },
  { id: 'trial-4', durationMs: 2100, metadata: { itemsPerSide: 2, spreadCq: 21 } },
  { id: 'rest-4', durationMs: 3700, metadata: null },
  { id: 'trial-5', durationMs: 1900, metadata: { itemsPerSide: 2, spreadCq: 25 } },
  { id: 'rest-5', durationMs: 3700, metadata: null },
  { id: 'trial-6', durationMs: 1700, metadata: { itemsPerSide: 3, spreadCq: 29 } },
  { id: 'rest-6', durationMs: 3700, metadata: null },
  { id: 'trial-7', durationMs: 1500, metadata: { itemsPerSide: 3, spreadCq: 33 } },
  { id: 'rest-7', durationMs: 3700, metadata: null },
]

const { phases: PHASES, metadataByPhase: TRIAL_BY_PHASE } = buildPhasesFromSequence(SPAN_SEQUENCE)

const FLASH_GAP_CQ = 7

function getFlashPositions(trial: TrialConfig): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []

  for (const side of [-1, 1] as const) {
    for (let i = 0; i < trial.itemsPerSide; i += 1) {
      const y = (i - (trial.itemsPerSide - 1) / 2) * FLASH_GAP_CQ
      positions.push({ x: side * trial.spreadCq, y })
    }
  }

  return positions
}

function getFlashOpacity(elapsedInPhaseMs: number, phaseDurationMs: number): number {
  const fadeMs = Math.min(400, phaseDurationMs / 4)

  if (elapsedInPhaseMs < fadeMs) {
    return elapsedInPhaseMs / fadeMs
  }

  if (elapsedInPhaseMs > phaseDurationMs - fadeMs) {
    return Math.max(0, (phaseDurationMs - elapsedInPhaseMs) / fadeMs)
  }

  return 1
}

export function EyeSpanCanvas({ onComplete, onExit }: EyeSpanCanvasProps): React.JSX.Element {
  const timer = useExercisePhaseTimer(PHASES, onComplete)

  function handleExit(): void {
    onExit(timer.totalElapsedMs)
  }

  const trial = TRIAL_BY_PHASE[timer.phaseId]
  const positions = trial ? getFlashPositions(trial) : []
  const flashOpacity = getFlashOpacity(timer.elapsedInPhaseMs, timer.phaseDurationMs)
  const fixationOpacity = timer.boundaryOpacity

  return (
    <ExercisePracticeLayout progress={timer.progress} onExit={handleExit}>
      <ExerciseStage>
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/60"
            style={{ opacity: fixationOpacity }}
          />
          {positions.map((position) => (
            <div
              key={`${position.x},${position.y}`}
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-3 rounded-full bg-primary"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}cqmin, ${position.y}cqmin)`,
                opacity: flashOpacity,
              }}
            />
          ))}
        </div>
      </ExerciseStage>
    </ExercisePracticeLayout>
  )
}
