'use client'

// GenericFlashExperience™ — renders any registered flash exercise by ID.
//
// Adding a new flash exercise no longer requires writing a custom Experience
// component. The exercise registers itself via registerAll.ts and this
// component handles everything else through the builder + runtime.
//
// Usage: <GenericFlashExperience exerciseId="flash-words" />

import { useState, useMemo } from 'react'
import { UniversalExercisePlayer } from './UniversalExercisePlayer'
import { getExercise } from '@/lib/exercise-engine/exerciseRegistry'
import { buildSession } from '@/lib/exercise-engine/exerciseBuilder'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import type { ExerciseDefinition } from '@/types/exercise-engine'

// Triggers registration of all known exercises on first import
import '@/features/rapid-visual-intelligence/definitions/registerAll'

type GenericFlashExperienceProps = {
  exerciseId: string
  renderStimulus?: (stimulus: string) => React.ReactNode
}

export function GenericFlashExperience({
  exerciseId,
  renderStimulus,
}: GenericFlashExperienceProps): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)

  const definition = useMemo(() => getExercise(exerciseId), [exerciseId])
  const state = useMemo(
    () => (definition ? loadState(exerciseId) : null),
    [exerciseId, definition],
  )

  const items = useMemo(() => {
    if (!definition || !state) return []
    // buildSession accepts ExerciseDefinition<Record<string,unknown>>
    return buildSession(
      // Cast is safe — buildSession only reads contentType, adaptiveRules, config
      definition as Parameters<typeof buildSession>[0],
      Date.now() + sessionKey * 99991,
    )
  }, [definition, state, sessionKey])

  if (!definition) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Exercise not found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ID <code className="font-mono">{exerciseId}</code> is not registered.
          </p>
        </div>
      </div>
    )
  }

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={definition as ExerciseDefinition<Record<string, unknown>>}
      items={items}
      onRestart={() => setSessionKey((k) => k + 1)}
      {...(renderStimulus !== undefined ? { renderStimulus } : {})}
    />
  )
}
