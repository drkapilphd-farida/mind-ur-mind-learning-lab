'use client'

import { useExercisePhaseTimer } from '@/hooks/exercises/useExercisePhaseTimer'
import { buildPhasesFromSequence } from '@/lib/exercises/buildPhasesFromSequence'
import { ExercisePracticeLayout } from '@/components/exercises/ExercisePracticeLayout'
import { ExerciseStage, getReducedMotionCaptionProps } from '@/components/exercises/ExerciseStage'

type ReadingSpeedCanvasProps = {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}

type LineMeta = { text: string } | null

const LINE_DURATION_MS = 3200
const BETWEEN_PASSAGE_PAUSE_MS = 2400
const FINAL_REST_MS = 2600

// Two short, calm passages read one line at a time, each paced by a
// steady fill bar — smooth forward reading at one comfortable speed,
// never quickening. This is the calm foundation RSVP and Flash Reading
// build on later; deliberately about ease, not pace itself.
const PASSAGES: string[][] = [
  [
    "Let your eyes glide across these words.",
    'There is no need to rush or strain.',
    'Just follow the gentle pace forward.',
    'This is what smooth reading feels like.',
  ],
  [
    'Notice how steady this rhythm feels.',
    'Your eyes are moving forward with ease.',
    'No backtracking, no hurrying.',
    'Just a calm, even flow.',
  ],
]

const READING_SEQUENCE: { id: string; durationMs: number; metadata: LineMeta }[] = [
  { id: 'settle', durationMs: 1500, metadata: null },
]

PASSAGES.forEach((lines, passageIndex) => {
  lines.forEach((text, lineIndex) => {
    READING_SEQUENCE.push({
      id: `passage${passageIndex + 1}-line${lineIndex + 1}`,
      durationMs: LINE_DURATION_MS,
      metadata: { text },
    })
  })

  const isLastPassage = passageIndex === PASSAGES.length - 1
  READING_SEQUENCE.push({
    id: isLastPassage ? 'rest' : `pause-${passageIndex + 1}`,
    durationMs: isLastPassage ? FINAL_REST_MS : BETWEEN_PASSAGE_PAUSE_MS,
    metadata: null,
  })
})

const { phases: PHASES, metadataByPhase: LINE_BY_PHASE } = buildPhasesFromSequence(READING_SEQUENCE)

export function ReadingSpeedCanvas({ onComplete, onExit }: ReadingSpeedCanvasProps): React.JSX.Element {
  const timer = useExercisePhaseTimer(PHASES, onComplete)

  function handleExit(): void {
    onExit(timer.totalElapsedMs)
  }

  const line = LINE_BY_PHASE[timer.phaseId] ?? null
  const pacerPercent = timer.prefersReducedMotion
    ? 100
    : Math.min(100, (timer.elapsedInPhaseMs / timer.phaseDurationMs) * 100)

  return (
    <ExercisePracticeLayout progress={timer.progress} onExit={handleExit}>
      <ExerciseStage {...getReducedMotionCaptionProps(timer.prefersReducedMotion)}>
        <div
          className="mx-auto w-full max-w-xs px-4 text-center transition-opacity duration-500 ease-in-out"
          style={{ opacity: line === null ? 0 : timer.boundaryOpacity }}
        >
          <p aria-live="polite" className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
            {line?.text ?? ''}
          </p>
          <div className="relative mx-auto mt-6 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className={
                timer.prefersReducedMotion
                  ? 'h-full rounded-full bg-primary/50'
                  : 'h-full rounded-full bg-primary/50 transition-[width] duration-150 ease-linear'
              }
              style={{ width: `${pacerPercent}%` }}
            />
          </div>
        </div>
      </ExerciseStage>
    </ExercisePracticeLayout>
  )
}
