'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FlashCanvas, type FlashItem } from './FlashCanvas'
import { SessionResultScreen } from './SessionResultScreen'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { getStoredDuration, saveDuration, shuffleIndices, type SessionSummary, ITEMS_PER_SESSION } from '../adaptiveEngine'
import { LAB_ID } from '../rapidVisualModule'

const EXERCISE_ID = 'flash-numbers'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

function digitCount(flashDurationMs: number): number {
  if (flashDurationMs >= 400) return 2
  if (flashDurationMs >= 250) return 3
  if (flashDurationMs >= 150) return 4
  if (flashDurationMs >= 75) return 5
  return 6
}

function randomNumber(digits: number, seed: number): string {
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  // Deterministic but varied: use seed to pick
  return String(min + (((seed * 1664525 + 1013904223) >>> 0) % (max - min + 1)))
}

function generateDistractor(target: string, seed: number): string {
  const n = Number(target)
  // Change 1 digit to make a plausible distractor
  const offset = (((seed * 22695477 + 1) >>> 0) % 9) + 1
  return String(Math.abs(n + offset * (seed % 2 === 0 ? 1 : -1)))
    .padStart(target.length, '0')
    .slice(0, target.length)
}

function buildItems(flashDurationMs: number, seed: number): FlashItem[] {
  const digits = digitCount(flashDurationMs)
  const shuffled = shuffleIndices(ITEMS_PER_SESSION, seed)

  return shuffled.map((_, i) => {
    const itemSeed = seed + i * 31337
    const number = randomNumber(digits, itemSeed)
    const d1 = generateDistractor(number, itemSeed + 1)
    const d2 = generateDistractor(number, itemSeed + 2)
    const d3 = generateDistractor(number, itemSeed + 3)
    const rawOptions = [number, d1, d2, d3]
    const correct = number
    const sortSeed = itemSeed % 4
    const options = [
      rawOptions[sortSeed % 4] ?? number,
      rawOptions[(sortSeed + 1) % 4] ?? d1,
      rawOptions[(sortSeed + 2) % 4] ?? d2,
      rawOptions[(sortSeed + 3) % 4] ?? d3,
    ]
    const correctIndex = options.indexOf(correct)

    return {
      id: `${EXERCISE_ID}-${i}`,
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
