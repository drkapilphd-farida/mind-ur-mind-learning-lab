'use client'

// Flash Numbers™ — Sprint 5B.1 migration.
// Data now comes from NUMBERS_DATASET via the Universal Dataset Engine.
// The distractor generation remains in the feature layer (exercise-specific logic).

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FlashCanvas, type FlashItem } from './FlashCanvas'
import { SessionResultScreen } from './SessionResultScreen'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { getStoredDuration, saveDuration, type SessionSummary, ITEMS_PER_SESSION } from '../adaptiveEngine'
import { LAB_ID } from '../rapidVisualModule'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { ensureMinItems } from '@/lib/exercise-engine/datasetValidator'
import { flashDurationToDifficulty } from '../lib/flashUtils'

// Register all datasets on load
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-numbers'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

// Generate a distractor from a number string by changing one digit.
// This remains in the feature layer — it's exercise-specific, not general dataset logic.
function generateDistractor(target: string, seed: number): string {
  const n = Number(target)
  const offset = (((seed * 22695477 + 1) >>> 0) % 9) + 1
  const result = Math.abs(n + offset * (seed % 2 === 0 ? 1 : -1))
  return String(result).padStart(target.length, '0').slice(0, target.length)
}

function buildItems(flashDurationMs: number, seed: number): FlashItem[] {
  const difficulty = flashDurationToDifficulty(flashDurationMs)

  // Pull numbers from the dataset engine — uses NUMBERS_DATASET
  const raw = getContentForExercise({ contentType: 'number', locale: 'en', difficulty, count: ITEMS_PER_SESSION + 5, seed })
  // Ensure we have enough items even with a small demo dataset
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
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashNumbersExperience(): React.JSX.Element {
  const router = useRouter()
  const [sessionKey, setSessionKey] = useState(0)
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  const flashDurationMs = getStoredDuration(EXERCISE_ID)
  const items = useMemo(() => buildItems(flashDurationMs, Date.now() + sessionKey), [flashDurationMs, sessionKey])

  async function handleComplete(result: SessionSummary): Promise<void> {
    saveDuration(EXERCISE_ID, result.nextDurationMs)
    await savePracticeSession({ labId: LAB_ID, exerciseId: EXERCISE_ID, durationMs: 60000, completed: result.accuracyPercent >= 60 })
    setSummary(result)
  }

  if (summary !== null) {
    return <SessionResultScreen exerciseName="Flash Numbers™" summary={summary} trainsAbility="Numerical processing speed" labHref={LAB_HREF} onPracticeAgain={() => { setSummary(null); setSessionKey((k) => k + 1) }} />
  }

  return <FlashCanvas key={sessionKey} exerciseId={EXERCISE_ID} exerciseName="Flash Numbers™" items={items} flashDurationMs={flashDurationMs} onComplete={handleComplete} onExit={() => router.push(LAB_HREF)} />
}
