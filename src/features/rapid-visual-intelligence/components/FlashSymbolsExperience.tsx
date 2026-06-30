'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FlashCanvas, type FlashItem } from './FlashCanvas'
import { SessionResultScreen } from './SessionResultScreen'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { getStoredDuration, saveDuration, shuffleIndices, type SessionSummary, ITEMS_PER_SESSION } from '../adaptiveEngine'
import { getSymbolsByDifficulty, getSymbolDistractors } from '../data/symbolSets'
import { LAB_ID } from '../rapidVisualModule'

const EXERCISE_ID = 'flash-symbols'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

function buildItems(flashDurationMs: number, seed: number): FlashItem[] {
  const pool = getSymbolsByDifficulty(flashDurationMs)
  const indices = shuffleIndices(pool.length, seed)

  return indices.slice(0, ITEMS_PER_SESSION).map((idx, i) => {
    const target = pool[idx % pool.length] ?? 'A'
    const distractors = getSymbolDistractors(target, pool)
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
      id: `${EXERCISE_ID}-${i}`,
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
