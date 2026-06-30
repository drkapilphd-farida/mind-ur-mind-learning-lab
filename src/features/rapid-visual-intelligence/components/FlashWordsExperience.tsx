'use client'

import { useState, useMemo } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import { FLASH_WORDS_DEFINITION } from '../definitions/flashWordsDefinition'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { flashDurationToDifficulty } from '../lib/flashUtils'
import type { SessionItem } from '@/types/exercise-engine'
import type { FlashDuration } from '../adaptiveEngine'
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-words'
const ITEMS_PER_SESSION = 20

function buildSessionItems(flashDurationMs: FlashDuration, seed: number): SessionItem[] {
  const difficulty = flashDurationToDifficulty(flashDurationMs)
  const pool = getContentForExercise({ contentType: 'word', locale: 'en', difficulty, count: ITEMS_PER_SESSION + 15, seed })
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
  // sessionKey increments on every restart — ensures a new seed each time
  const [sessionKey, setSessionKey] = useState(0)
  const state = useMemo(() => loadState(EXERCISE_ID), [])

  // Seed changes with sessionKey so each restart produces different content
  const items = useMemo(
    () => buildSessionItems(state.currentSpeedMs as FlashDuration, Date.now() + sessionKey * 99991),
    [state.currentSpeedMs, sessionKey],
  )

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={FLASH_WORDS_DEFINITION}
      items={items}
      onRestart={() => setSessionKey((k) => k + 1)}
    />
  )
}
