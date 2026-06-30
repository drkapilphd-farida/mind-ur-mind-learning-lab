'use client'

// FlashWords™ — Sprint 5B migration: now a single-line consumer of the
// Universal Exercise Runtime™. The runtime manages all session lifecycle,
// adaptive difficulty, reaction-time tracking, pause/resume, and analytics.
//
// To create a new exercise: write a Definition + generate items.
// This component is the proof that no other code is needed.

import { useMemo } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import { FLASH_WORDS_DEFINITION } from '../definitions/flashWordsDefinition'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { flashDurationToDifficulty } from '../lib/flashUtils'
import type { SessionItem } from '@/types/exercise-engine'
import type { FlashDuration } from '../adaptiveEngine'

// Register all demo datasets on load
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-words'
const ITEMS_PER_SESSION = 20

function buildSessionItems(flashDurationMs: FlashDuration, seed: number): SessionItem[] {
  const difficulty = flashDurationToDifficulty(flashDurationMs)
  const pool = getContentForExercise({
    contentType: 'word',
    locale: 'en',
    difficulty,
    count: ITEMS_PER_SESSION + 15,
    seed,
  })

  const stimuli = pool.slice(0, ITEMS_PER_SESSION)
  const distractorPool = pool.slice(ITEMS_PER_SESSION)

  return stimuli.map((item, i) => {
    const d1 = distractorPool[i % distractorPool.length] ?? stimuli[(i + 1) % stimuli.length]
    const d2 = distractorPool[(i + 1) % distractorPool.length] ?? stimuli[(i + 2) % stimuli.length]
    const d3 = distractorPool[(i + 2) % distractorPool.length] ?? stimuli[(i + 3) % stimuli.length]

    const rawOptions = [item.content, (d1 ?? item).content, (d2 ?? item).content, (d3 ?? item).content]
    const sortSeed = (seed + i) % 4
    const options = [
      rawOptions[sortSeed % 4] ?? item.content,
      rawOptions[(sortSeed + 1) % 4] ?? rawOptions[1] ?? item.content,
      rawOptions[(sortSeed + 2) % 4] ?? rawOptions[2] ?? item.content,
      rawOptions[(sortSeed + 3) % 4] ?? rawOptions[3] ?? item.content,
    ]
    const correctIndex = options.indexOf(item.content)

    return {
      id: `${EXERCISE_ID}-${item.id}`,
      stimulus: item.content,
      stimulusLabel: item.contentLabel,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashWordsExperience(): React.JSX.Element {
  // Load current speed from persisted state to seed the initial item set
  const state = useMemo(() => loadState(EXERCISE_ID), [])
  const seed = Date.now()
  const items = useMemo(
    () => buildSessionItems(state.currentSpeedMs as FlashDuration, seed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],  // generated once per mount; runtime.restart() re-triggers via key
  )

  return (
    <UniversalExercisePlayer
      definition={FLASH_WORDS_DEFINITION}
      items={items}
    />
  )
}
