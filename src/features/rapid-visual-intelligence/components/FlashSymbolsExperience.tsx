'use client'

// Flash Symbols™ — Sprint 5B.1 migration.
// Data now comes from SYMBOLS_DATASET via the Universal Dataset Engine.
// Distractor selection prefers visually similar characters (feature-layer logic).

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
import type { ContentItem } from '@/types/exercise-engine'

// Register all datasets on load
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-symbols'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

// Pairs of visually similar characters — used for distractor selection.
// This remains in the feature layer: it's exercise-specific visual discrimination logic.
const SIMILAR_PAIRS: [string, string][] = [
  ['O', '0'], ['I', 'l'], ['S', '5'], ['Z', '2'], ['G', '6'],
  ['B', '8'], ['!', 'l'], ['$', 'S'], ['1', 'l'],
]

function getSimilarDistractors(target: string, pool: ContentItem[]): string[] {
  const similar = SIMILAR_PAIRS
    .filter(([a, b]) => a === target || b === target)
    .flatMap(([a, b]) => [a, b])
    .filter((s) => s !== target)

  const distractors: string[] = [...similar]
  for (const item of pool) {
    if (distractors.length >= 3) break
    if (item.content !== target && !distractors.includes(item.content)) {
      distractors.push(item.content)
    }
  }
  return distractors.slice(0, 3)
}

function buildItems(flashDurationMs: number, seed: number): FlashItem[] {
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
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashSymbolsExperience(): React.JSX.Element {
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
    return <SessionResultScreen exerciseName="Flash Symbols™" summary={summary} trainsAbility="Visual discrimination" labHref={LAB_HREF} onPracticeAgain={() => { setSummary(null); setSessionKey((k) => k + 1) }} />
  }

  return <FlashCanvas key={sessionKey} exerciseId={EXERCISE_ID} exerciseName="Flash Symbols™" items={items} flashDurationMs={flashDurationMs} onComplete={handleComplete} onExit={() => router.push(LAB_HREF)} />
}
