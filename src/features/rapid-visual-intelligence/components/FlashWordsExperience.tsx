'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FlashCanvas, type FlashItem } from './FlashCanvas'
import { SessionResultScreen } from './SessionResultScreen'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { getStoredDuration, saveDuration, shuffleIndices, type SessionSummary } from '../adaptiveEngine'
import { getWordsByDifficulty } from '../data/wordLists'
import { LAB_ID } from '../rapidVisualModule'
import { ITEMS_PER_SESSION } from '../adaptiveEngine'

const EXERCISE_ID = 'flash-words'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

function buildItems(flashDurationMs: number, seed: number): FlashItem[] {
  const words = getWordsByDifficulty(flashDurationMs)
  const allWords = [...words]
  const indices = shuffleIndices(allWords.length, seed)

  return indices.slice(0, ITEMS_PER_SESSION).map((idx, i) => {
    const word = allWords[idx] ?? 'read'
    // Three distractors: other words from the list
    const distractorIndices = indices
      .filter((n) => n !== idx)
      .slice(i + 1, i + 4)
    const options = [word, ...distractorIndices.map((n) => allWords[n] ?? 'scan')]
    // Shuffle options, track where correct answer landed
    const shuffled = [...options].sort((_, __) => ((idx + i) % 3 === 0 ? 1 : -1))
    const correctIndex = shuffled.indexOf(word)

    return {
      id: `${EXERCISE_ID}-${i}`,
      stimulus: word,
      stimulusLabel: word,
      options: shuffled.slice(0, 4),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashWordsExperience(): React.JSX.Element {
  const router = useRouter()
  const [sessionKey, setSessionKey] = useState(0)  // increment to restart
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  const flashDurationMs = getStoredDuration(EXERCISE_ID)
  const items = useMemo(
    () => buildItems(flashDurationMs, Date.now() + sessionKey),
    [flashDurationMs, sessionKey],
  )

  async function handleComplete(result: SessionSummary): Promise<void> {
    saveDuration(EXERCISE_ID, result.nextDurationMs)
    await savePracticeSession({
      labId: LAB_ID,
      exerciseId: EXERCISE_ID,
      durationMs: Date.now(),  // approximate — canvas doesn't track wall time
      completed: result.accuracyPercent >= 60,
    })
    setSummary(result)
  }

  function handlePracticeAgain(): void {
    setSummary(null)
    setSessionKey((k) => k + 1)
  }

  if (summary !== null) {
    return (
      <SessionResultScreen
        exerciseName="Flash Words™"
        summary={summary}
        trainsAbility="Word recognition speed"
        labHref={LAB_HREF}
        onPracticeAgain={handlePracticeAgain}
      />
    )
  }

  return (
    <FlashCanvas
      key={sessionKey}
      exerciseId={EXERCISE_ID}
      exerciseName="Flash Words™"
      items={items}
      flashDurationMs={flashDurationMs}
      onComplete={handleComplete}
      onExit={() => router.push(LAB_HREF)}
    />
  )
}
