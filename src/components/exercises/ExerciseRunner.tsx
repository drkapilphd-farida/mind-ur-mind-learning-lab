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
      primaryActionLabel={nextExercise ? `Continue Learning: ${nextExercise.title}` : 'Back to Lab'}
      onPrimaryAction={handleDone}
      {...(nextExercise && labHref !== undefined
        ? { secondaryActionLabel: 'Back to Lab', secondaryActionHref: labHref }
        : {})}
    />
  )
}
