'use client'

// Flash Phrases™ — Sprint 5B.1 migration.
// Data now comes from PHRASES_DATASET (45 phrases) via the Universal Dataset Engine.
// No more getPhrasesByDifficulty() from the raw phraseLists.ts.

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

const EXERCISE_ID = 'flash-phrases'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

function buildItems(flashDurationMs: number, seed: number): FlashItem[] {
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
    const shuffled = [
      rawOptions[sortSeed % 4] ?? phrase,
      rawOptions[(sortSeed + 1) % 4] ?? rawOptions[1] ?? 'stay calm',
      rawOptions[(sortSeed + 2) % 4] ?? rawOptions[2] ?? 'think clear',
      rawOptions[(sortSeed + 3) % 4] ?? rawOptions[3] ?? 'go deeper',
    ]
    const correctIndex = shuffled.indexOf(phrase)
    return {
      id: `${EXERCISE_ID}-${item.id}`,
      stimulus: phrase,
      stimulusLabel: phrase,
      options: shuffled.slice(0, 4),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashPhrasesExperience(): React.JSX.Element {
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
    return <SessionResultScreen exerciseName="Flash Phrases™" summary={summary} trainsAbility="Phrase recognition and chunking" labHref={LAB_HREF} onPracticeAgain={() => { setSummary(null); setSessionKey((k) => k + 1) }} />
  }

  return <FlashCanvas key={sessionKey} exerciseId={EXERCISE_ID} exerciseName="Flash Phrases™" items={items} flashDurationMs={flashDurationMs} onComplete={handleComplete} onExit={() => router.push(LAB_HREF)} />
}
