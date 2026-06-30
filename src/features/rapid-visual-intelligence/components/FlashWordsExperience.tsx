'use client'

// FlashWords™ — the reference AIEE™ consumer.
//
// This component shows how any exercise adopts the Universal Exercise Engine:
//   1. Import the ExerciseDefinition
//   2. Call useExerciseEngine — get speedMs, sessionSeed, completeSession
//   3. Build items from the engine's seed (deterministic, varied)
//   4. Render FlashCanvas (unchanged — it handles the UX timing)
//   5. On complete, call engine.completeSession → get metrics + recommendation
//   6. Render ExerciseResultScreen with the engine's output
//
// No local state for speed, difficulty, or session tracking — the engine owns all of it.

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FlashCanvas, type FlashItem } from './FlashCanvas'
import { ExerciseResultScreen } from '@/components/exercise-engine/ExerciseResultScreen'
import { useExerciseEngine } from '@/hooks/exercise-engine/useExerciseEngine'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { shuffleIndices, ITEMS_PER_SESSION, type FlashDuration } from '../adaptiveEngine'
import { getWordsByDifficulty } from '../data/wordLists'
import { LAB_ID } from '../rapidVisualModule'
import { FLASH_WORDS_DEFINITION } from '../definitions/flashWordsDefinition'
import type { PerformanceMetrics, ExerciseRecommendation } from '@/types/exercise-engine'

const EXERCISE_ID = 'flash-words'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

// Item generation is unchanged from Sprint 4C-1 — the engine provides
// the speed and seed; the item-building logic stays in the feature layer.
function buildItems(flashDurationMs: FlashDuration, seed: number): FlashItem[] {
  const words = getWordsByDifficulty(flashDurationMs)
  const allWords = [...words]
  const indices = shuffleIndices(allWords.length, seed)

  return indices.slice(0, ITEMS_PER_SESSION).map((idx, i) => {
    const word = allWords[idx] ?? 'read'
    const distractorIndices = indices.filter((n) => n !== idx).slice(i + 1, i + 4)
    const options = [word, ...distractorIndices.map((n) => allWords[n] ?? 'scan')]
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

type CompletedResult = {
  metrics: PerformanceMetrics
  recommendation: ExerciseRecommendation
  accuracyMessage: string
}

export function FlashWordsExperience(): React.JSX.Element {
  const router = useRouter()

  // ── Engine integration ────────────────────────────────────────────────────
  const engine = useExerciseEngine({ definition: FLASH_WORDS_DEFINITION })
  const [result, setResult] = useState<CompletedResult | null>(null)
  const [canvasKey, setCanvasKey] = useState(0)

  // Items are seeded by the engine — deterministic per session, always varied
  // engine.speedMs is SpeedMs (universal); FlashCanvas expects FlashDuration (subset).
  // The definition caps maxSpeedMs at 500 so this cast is always safe for Flash Words.
  const flashDuration = engine.speedMs as FlashDuration

  const items = useMemo(
    () => buildItems(flashDuration, engine.sessionSeed + canvasKey),
    [flashDuration, engine.sessionSeed, canvasKey],
  )

  // ── Session completion ────────────────────────────────────────────────────
  async function handleComplete(input: {
    correctCount: number
    totalCount: number
    durationMs: number
  }): Promise<void> {
    // Engine computes metrics, updates localStorage, returns recommendation
    const outcome = engine.completeSession({
      correctCount: input.correctCount,
      totalCount: input.totalCount,
      durationMs: input.durationMs,
    })
    setResult(outcome)

    // Record to Supabase for Mind Score and dashboard analytics
    await savePracticeSession({
      labId: LAB_ID,
      exerciseId: EXERCISE_ID,
      durationMs: Math.max(1, input.durationMs),
      completed: outcome.metrics.accuracyPercent >= FLASH_WORDS_DEFINITION.adaptiveRules.minAccuracyToComplete,
    })
  }

  // ── Practice Again ────────────────────────────────────────────────────────
  function handlePracticeAgain(): void {
    setResult(null)
    setCanvasKey((k) => k + 1)
    engine.startNewSession()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (result !== null) {
    return (
      <ExerciseResultScreen
        exerciseName="Flash Words™"
        trainsAbility={FLASH_WORDS_DEFINITION.trainsAbility}
        metrics={result.metrics}
        recommendation={result.recommendation}
        accuracyMessage={result.accuracyMessage}
        labHref={LAB_HREF}
        onPracticeAgain={handlePracticeAgain}
      />
    )
  }

  return (
    <FlashCanvas
      key={canvasKey}
      exerciseId={EXERCISE_ID}
      exerciseName={FLASH_WORDS_DEFINITION.title}
      items={items}
      flashDurationMs={flashDuration}
      onComplete={(summary) =>
        handleComplete({
          correctCount: summary.correctCount,
          totalCount: summary.totalCount,
          durationMs: summary.prevDurationMs * summary.totalCount,  // approximate
        })
      }
      onExit={() => router.push(LAB_HREF)}
    />
  )
}
