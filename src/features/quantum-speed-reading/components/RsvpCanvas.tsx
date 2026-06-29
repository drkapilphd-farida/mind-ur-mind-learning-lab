'use client'

import { useExercisePhaseTimer } from '@/hooks/exercises/useExercisePhaseTimer'
import { buildPhasesFromSequence } from '@/lib/exercises/buildPhasesFromSequence'
import { ExercisePracticeLayout } from '@/components/exercises/ExercisePracticeLayout'
import { ExerciseStage, getReducedMotionCaptionProps } from '@/components/exercises/ExerciseStage'

type RsvpCanvasProps = {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}

type WordMeta = { text: string } | null

const WORD_DURATION_MS = 700
const BETWEEN_PASSAGE_PAUSE_MS = 2400
const FINAL_REST_MS = 2600

// One word at a time at a fixed point — no line, no eye movement across
// text. Same calm, never-rushed pacing philosophy as Reading Speed, just
// expressed as single words instead of full lines.
const PASSAGES: string[][] = [
  'Each word will appear right here. There is no need to chase it. Just let your eyes receive it calmly. Then let it go and wait for the next.'.split(
    ' ',
  ),
  'You do not need to catch every word perfectly. Understanding always matters more than speed. Stay relaxed and let the words settle naturally in your mind.'.split(
    ' ',
  ),
]

const RSVP_SEQUENCE: { id: string; durationMs: number; metadata: WordMeta }[] = [
  { id: 'settle', durationMs: 1500, metadata: null },
]

PASSAGES.forEach((words, passageIndex) => {
  words.forEach((text, wordIndex) => {
    RSVP_SEQUENCE.push({
      id: `passage${passageIndex + 1}-word${wordIndex + 1}`,
      durationMs: WORD_DURATION_MS,
      metadata: { text },
    })
  })

  const isLastPassage = passageIndex === PASSAGES.length - 1
  RSVP_SEQUENCE.push({
    id: isLastPassage ? 'rest' : `pause-${passageIndex + 1}`,
    durationMs: isLastPassage ? FINAL_REST_MS : BETWEEN_PASSAGE_PAUSE_MS,
    metadata: null,
  })
})

const { phases: PHASES, metadataByPhase: WORD_BY_PHASE } = buildPhasesFromSequence(RSVP_SEQUENCE)

export function RsvpCanvas({ onComplete, onExit }: RsvpCanvasProps): React.JSX.Element {
  const timer = useExercisePhaseTimer(PHASES, onComplete)

  function handleExit(): void {
    onExit(timer.totalElapsedMs)
  }

  const word = WORD_BY_PHASE[timer.phaseId] ?? null
  const pacerPercent = timer.prefersReducedMotion
    ? 100
    : Math.min(100, (timer.elapsedInPhaseMs / timer.phaseDurationMs) * 100)

  return (
    <ExercisePracticeLayout progress={timer.progress} onExit={handleExit}>
      <ExerciseStage {...getReducedMotionCaptionProps(timer.prefersReducedMotion)}>
        <div
          className="mx-auto w-full max-w-xs px-4 text-center transition-opacity duration-500 ease-in-out"
          style={{ opacity: word === null ? 0 : timer.boundaryOpacity }}
        >
          <p aria-live="polite" className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
            {word?.text ?? ''}
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
