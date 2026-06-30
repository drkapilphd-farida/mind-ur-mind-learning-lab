'use client'

import { useState, useMemo } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import { FLASH_SYMBOLS_DEFINITION } from '../definitions/flashSymbolsDefinition'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { ensureMinItems } from '@/lib/exercise-engine/datasetValidator'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { flashDurationToDifficulty } from '../lib/flashUtils'
import type { ContentItem, SessionItem } from '@/types/exercise-engine'
import type { FlashDuration } from '../adaptiveEngine'
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-symbols'
const ITEMS_PER_SESSION = 20

const SIMILAR_PAIRS: [string, string][] = [
  ['O', '0'], ['I', 'l'], ['S', '5'], ['Z', '2'], ['G', '6'], ['B', '8'],
]

function getSimilarDistractors(target: string, pool: ContentItem[]): string[] {
  const similar = SIMILAR_PAIRS
    .filter(([a, b]) => a === target || b === target)
    .flatMap(([a, b]) => [a, b])
    .filter((s) => s !== target)
  const distractors: string[] = [...similar]
  for (const item of pool) {
    if (distractors.length >= 3) break
    if (item.content !== target && !distractors.includes(item.content)) distractors.push(item.content)
  }
  return distractors.slice(0, 3)
}

function buildSessionItems(flashDurationMs: FlashDuration, seed: number): SessionItem[] {
  const difficulty = flashDurationToDifficulty(flashDurationMs)
  const raw = getContentForExercise({ contentType: 'symbol', locale: 'en', difficulty, count: ITEMS_PER_SESSION + 5, seed })
  const pool = ensureMinItems(raw, ITEMS_PER_SESSION, seed)
  const allPool = getContentForExercise({ contentType: 'symbol', locale: 'en', difficulty: 'medium', count: 30, seed })

  return pool.slice(0, ITEMS_PER_SESSION).map((item, i) => {
    const target = item.content
    const distractors = getSimilarDistractors(target, allPool.filter((p) => p.content !== target))
    const rawOptions = [target, ...distractors]
    const sortSeed = (seed + i) % 4
    const options = [
      rawOptions[sortSeed % 4] ?? target,
      rawOptions[(sortSeed + 1) % 4] ?? distractors[0] ?? 'B',
      rawOptions[(sortSeed + 2) % 4] ?? distractors[1] ?? 'C',
      rawOptions[(sortSeed + 3) % 4] ?? distractors[2] ?? 'D',
    ]
    const correctIndex = options.indexOf(target)
    return {
      id: `${EXERCISE_ID}-${item.id}`,
      stimulus: target,
      stimulusLabel: `Symbol: ${target}`,
      renderAs: 'symbol' as const,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashSymbolsExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)
  const state = useMemo(() => loadState(EXERCISE_ID), [])
  const items = useMemo(
    () => buildSessionItems(state.currentSpeedMs as FlashDuration, Date.now() + sessionKey * 99991),
    [state.currentSpeedMs, sessionKey],
  )

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={FLASH_SYMBOLS_DEFINITION}
      items={items}
      onRestart={() => setSessionKey((k) => k + 1)}
    />
  )
}
