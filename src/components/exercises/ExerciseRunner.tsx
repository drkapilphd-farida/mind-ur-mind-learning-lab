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

type ExerciseRunnerProps = {
  definition: ExerciseDefinition
  Canvas: ExerciseCanvasComponent
}

// The shared intro → active → completion lifecycle every exercise runs.
// Authoring a new exercise means writing an ExerciseDefinition and a Canvas —
// never re-implementing this runner, the session wiring, or navigation.
export function ExerciseRunner({ definition, Canvas }: ExerciseRunnerProps): React.JSX.Element {
  const router = useRouter()
  const { stage, start, recordCompletion, recordExit } = useExerciseSession({
    labId: definition.labId,
    exerciseId: definition.exerciseId,
  })

  function handleExit(durationMs: number): void {
    recordExit(durationMs)
    router.back()
  }

  function handleDone(): void {
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
      primaryActionLabel="Done"
      onPrimaryAction={handleDone}
    />
  )
}
