'use client'

import { useState, useMemo } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import { FLASH_NUMBERS_DEFINITION } from '../definitions/flashNumbersDefinition'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { ensureMinItems } from '@/lib/exercise-engine/datasetValidator'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { flashDurationToDifficulty } from '../lib/flashUtils'
import type { SessionItem } from '@/types/exercise-engine'
import type { FlashDuration } from '../adaptiveEngine'
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-numbers'
const ITEMS_PER_SESSION = 20

function generateDistractor(target: string, seed: number): string {
  const n = Number(target)
  const offset = (((seed * 22695477 + 1) >>> 0) % 9) + 1
  const result = Math.abs(n + offset * (seed % 2 === 0 ? 1 : -1))
  return String(result).padStart(target.length, '0').slice(0, target.length)
}

function buildSessionItems(flashDurationMs: FlashDuration, seed: number): SessionItem[] {
  const difficulty = flashDurationToDifficulty(flashDurationMs)
  const raw = getContentForExercise({ contentType: 'number', locale: 'en', difficulty, count: ITEMS_PER_SESSION + 5, seed })
  const pool = ensureMinItems(raw, ITEMS_PER_SESSION, seed)

  return pool.slice(0, ITEMS_PER_SESSION).map((item, i) => {
    const itemSeed = seed + i * 31337
    const number = item.content
    const d1 = generateDistractor(number, itemSeed + 1)
    const d2 = generateDistractor(number, itemSeed + 2)
    const d3 = generateDistractor(number, itemSeed + 3)
    const rawOptions = [number, d1, d2, d3]
    const sortSeed = itemSeed % 4
    const options = [
      rawOptions[sortSeed % 4] ?? number,
      rawOptions[(sortSeed + 1) % 4] ?? d1,
      rawOptions[(sortSeed + 2) % 4] ?? d2,
      rawOptions[(sortSeed + 3) % 4] ?? d3,
    ]
    const correctIndex = options.indexOf(number)
    return {
      id: `${EXERCISE_ID}-${item.id}`,
      stimulus: number,
      stimulusLabel: `Number: ${number}`,
      renderAs: 'number' as const,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashNumbersExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)
  const state = useMemo(() => loadState(EXERCISE_ID), [])
  const items = useMemo(
    () => buildSessionItems(state.currentSpeedMs as FlashDuration, Date.now() + sessionKey * 99991),
    [state.currentSpeedMs, sessionKey],
  )

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={FLASH_NUMBERS_DEFINITION}
      items={items}
      onRestart={() => setSessionKey((k) => k + 1)}
    />
  )
}
