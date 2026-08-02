'use client'

import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import type { ExerciseDefinition } from '@/lib/exercises/types'
import { ExerciseIntroScreen } from './ExerciseIntroScreen'
import { ExerciseCompletionScreen } from './ExerciseCompletionScreen'

type ExerciseCanvasComponent = (props: {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}) => React.JSX.Element

type AdjacentExerciseLink = { title: string; href: string }

type ExerciseRunnerProps = {
  definition: ExerciseDefinition
  Canvas: ExerciseCanvasComponent
  labHref?: string
  previousExercise?: AdjacentExerciseLink | null
  nextExercise?: AdjacentExerciseLink | null
  // 21-Day Transformation Journey™ — additive, optional. When a caller
  // (QuantumJourneySession) supplies this, the completion screen's primary
  // action calls it instead of navigating anywhere on its own, so the
  // wizard — not this runner — decides what "continue" means. Standalone
  // usage (both omitted) is byte-for-byte unchanged. Exiting mid-exercise
  // still always navigates away (handleExit, below) regardless — only
  // natural completion is ever handed back to a wizard caller.
  onComplete?: () => void
  completionActionLabel?: string
}

// The shared intro → active → completion lifecycle every exercise runs.
// Authoring a new exercise means writing an ExerciseDefinition and a Canvas —
// never re-implementing this runner, the session wiring, or navigation.
// `labHref`/`previousExercise`/`nextExercise` are optional and structural
// (Learning Journey Engine) — omitting them keeps Sprint 1's exact behavior.
export function ExerciseRunner({
  definition,
  Canvas,
  labHref,
  previousExercise,
  nextExercise,
  onComplete,
  completionActionLabel,
}: ExerciseRunnerProps): React.JSX.Element {
  const router = useRouter()
  const { stage, start, recordCompletion, recordExit, awaitPendingSave } = useExerciseSession({
    labId: definition.labId,
    exerciseId: definition.exerciseId,
  })

  async function handleExit(durationMs: number): Promise<void> {
    await recordExit(durationMs)
    // router.back() can serve a stale cached render of the page we're
    // returning to; pushing to a known labHref forces a fresh fetch instead.
    if (labHref !== undefined) {
      router.push(labHref)
      return
    }
    router.back()
  }

  async function handleDone(): Promise<void> {
    // recordCompletion's save was already fired when the exercise finished;
    // wait for that same save to land before navigating, rather than
    // re-triggering it.
    await awaitPendingSave()
    if (onComplete) {
      onComplete()
      return
    }
    if (nextExercise) {
      router.push(nextExercise.href)
      return
    }
    if (labHref !== undefined) {
      router.push(labHref)
      return
    }
    router.back()
  }

  if (stage === 'intro') {
    return (
      <ExerciseIntroScreen
        title={definition.intro.title}
        description={definition.intro.description}
        durationLabel={definition.intro.durationLabel}
        postureNote={definition.intro.postureNote}
        onStart={start}
        {...(previousExercise ? { previousHref: previousExercise.href, previousLabel: previousExercise.title } : {})}
        {...(labHref !== undefined ? { labHref } : {})}
      />
    )
  }

  if (stage === 'active') {
    return <Canvas onComplete={recordCompletion} onExit={handleExit} />
  }

  return (
    <ExerciseCompletionScreen
      title={definition.completion.title}
      mentorLine={definition.completion.mentorLine}
      primaryActionLabel={completionActionLabel ?? (nextExercise ? `Continue Evolution: ${nextExercise.title}` : 'Back to Lab')}
      onPrimaryAction={handleDone}
      {...(nextExercise && labHref !== undefined && onComplete === undefined
        ? { secondaryActionLabel: 'Back to Lab', secondaryActionHref: labHref }
        : {})}
    />
  )
}
