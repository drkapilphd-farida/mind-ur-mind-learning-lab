'use client'

import { useState, useMemo } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import { FLASH_PHRASES_DEFINITION } from '../definitions/flashPhrasesDefinition'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { ensureMinItems } from '@/lib/exercise-engine/datasetValidator'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { flashDurationToDifficulty } from '../lib/flashUtils'
import type { SessionItem } from '@/types/exercise-engine'
import type { FlashDuration } from '../adaptiveEngine'
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-phrases'
const ITEMS_PER_SESSION = 20

function buildSessionItems(flashDurationMs: FlashDuration, seed: number): SessionItem[] {
  const difficulty = flashDurationToDifficulty(flashDurationMs)
  const raw = getContentForExercise({ contentType: 'phrase', locale: 'en', difficulty, count: ITEMS_PER_SESSION + 15, seed })
  const pool = ensureMinItems(raw, ITEMS_PER_SESSION, seed)
  const stimuli = pool.slice(0, ITEMS_PER_SESSION)
  const distractorPool = pool.slice(ITEMS_PER_SESSION)

  return stimuli.map((item, i) => {
    const phrase = item.content
    const d1 = distractorPool[i % distractorPool.length] ?? stimuli[(i + 1) % stimuli.length]
    const d2 = distractorPool[(i + 1) % distractorPool.length] ?? stimuli[(i + 2) % stimuli.length]
    const d3 = distractorPool[(i + 2) % distractorPool.length] ?? stimuli[(i + 3) % stimuli.length]
    const rawOptions = [phrase, (d1 ?? item).content, (d2 ?? item).content, (d3 ?? item).content]
    const sortSeed = (seed + i) % 4
    const options = [
      rawOptions[sortSeed % 4] ?? phrase,
      rawOptions[(sortSeed + 1) % 4] ?? rawOptions[1] ?? 'stay calm',
      rawOptions[(sortSeed + 2) % 4] ?? rawOptions[2] ?? 'think clear',
      rawOptions[(sortSeed + 3) % 4] ?? rawOptions[3] ?? 'go deeper',
    ]
    const correctIndex = options.indexOf(phrase)
    return {
      id: `${EXERCISE_ID}-${item.id}`,
      stimulus: phrase,
      stimulusLabel: phrase,
      options: options.slice(0, 4),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashPhrasesExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)
  const state = useMemo(() => loadState(EXERCISE_ID), [])
  const items = useMemo(
    () => buildSessionItems(state.currentSpeedMs as FlashDuration, Date.now() + sessionKey * 99991),
    [state.currentSpeedMs, sessionKey],
  )

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={FLASH_PHRASES_DEFINITION}
      items={items}
      onRestart={() => setSessionKey((k) => k + 1)}
    />
  )
}
