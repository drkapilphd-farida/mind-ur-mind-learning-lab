'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FlashCanvas, type FlashItem } from './FlashCanvas'
import { SessionResultScreen } from './SessionResultScreen'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { getStoredDuration, saveDuration, shuffleIndices, type SessionSummary, ITEMS_PER_SESSION } from '../adaptiveEngine'
import { getPhrasesByDifficulty } from '../data/phraseLists'
import { LAB_ID } from '../rapidVisualModule'

const EXERCISE_ID = 'flash-phrases'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

function buildItems(flashDurationMs: number, seed: number): FlashItem[] {
  const phrases = getPhrasesByDifficulty(flashDurationMs)
  const all = [...phrases]
  const indices = shuffleIndices(all.length, seed)

  return indices.slice(0, ITEMS_PER_SESSION).map((idx, i) => {
    const phrase = all[idx % all.length] ?? 'read fast'
    const distractorIndices = indices.filter((n) => n !== idx).slice(i + 1, i + 4)
    const options = [phrase, ...distractorIndices.map((n) => all[n % all.length] ?? 'stay calm')]
    const sortSeed = (seed + i) % 4
    const shuffled = [
      options[sortSeed % 4] ?? phrase,
      options[(sortSeed + 1) % 4] ?? options[1] ?? 'stay calm',
      options[(sortSeed + 2) % 4] ?? options[2] ?? 'think clear',
      options[(sortSeed + 3) % 4] ?? options[3] ?? 'go deeper',
    ]
    const correctIndex = shuffled.indexOf(phrase)

    return {
      id: `${EXERCISE_ID}-${i}`,
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
