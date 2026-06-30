'use client'

// FlashWords™ — reference AIEE™ consumer, Sprint 5A-1 migration.
//
// No hardcoded word lists. All content comes from the Universal Dataset Engine™.
// getContentForExercise() queries the registry across all registered word
// datasets, applying difficulty tier and seeded randomization automatically.
//
// To swap content: add a new dataset file, import it in datasets/index.ts.
// This component never changes — it only receives ContentItems.

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FlashCanvas, type FlashItem } from './FlashCanvas'
import { ExerciseResultScreen } from '@/components/exercise-engine/ExerciseResultScreen'
import { useExerciseEngine } from '@/hooks/exercise-engine/useExerciseEngine'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { ITEMS_PER_SESSION, type FlashDuration } from '../adaptiveEngine'
import { LAB_ID } from '../rapidVisualModule'
import { FLASH_WORDS_DEFINITION } from '../definitions/flashWordsDefinition'
import type { PerformanceMetrics, ExerciseRecommendation, DifficultyTier } from '@/types/exercise-engine'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'

// Import dataset index — this triggers registration of all demo datasets
// with the content engine. Without this import, the registry would be empty.
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-words'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

// Map flash duration to difficulty tier.
// Shorter flash → simpler, shorter words (easier to process in limited time).
// Longer flash → harder, more complex words are fair game.
function flashDurationToDifficulty(ms: number): DifficultyTier {
  if (ms >= 300) return 'medium'
  if (ms >= 150) return 'easy'
  return 'beginner'
}

// Build FlashItems from the Dataset Engine — no raw word arrays.
// The dataset engine handles: difficulty filtering, seeded randomization,
// avoidRecentRepeats (future sessions). All 20 stimuli + their distractors
// come from a single pool request, eliminating repeated lookups.
function buildItems(flashDurationMs: FlashDuration, seed: number): FlashItem[] {
  const difficulty = flashDurationToDifficulty(flashDurationMs)

  // Request ITEMS_PER_SESSION stimuli + 3× distractor buffer
  const pool = getContentForExercise({
    contentType: 'word',
    locale: 'en',
    difficulty,
    count: ITEMS_PER_SESSION + 15,  // 20 stimuli + 15 buffer for distractors
    seed,
  })

  const stimuli = pool.slice(0, ITEMS_PER_SESSION)
  const distractorPool = pool.slice(ITEMS_PER_SESSION)  // non-overlapping

  return stimuli.map((item, i) => {
    // Pick 3 distractors from the buffer; fall back to neighbouring stimuli
    const d1 = distractorPool[i % distractorPool.length] ?? stimuli[(i + 1) % stimuli.length]
    const d2 = distractorPool[(i + 1) % distractorPool.length] ?? stimuli[(i + 2) % stimuli.length]
    const d3 = distractorPool[(i + 2) % distractorPool.length] ?? stimuli[(i + 3) % stimuli.length]

    const rawOptions = [
      item.content,
      (d1 ?? item).content,
      (d2 ?? item).content,
      (d3 ?? item).content,
    ]
    // Deterministic option shuffle (same pattern used in Sprint 4C-1)
    const sortSeed = (seed + i) % 4
    const options = [
      rawOptions[sortSeed % 4] ?? item.content,
      rawOptions[(sortSeed + 1) % 4] ?? rawOptions[1] ?? item.content,
      rawOptions[(sortSeed + 2) % 4] ?? rawOptions[2] ?? item.content,
      rawOptions[(sortSeed + 3) % 4] ?? rawOptions[3] ?? item.content,
    ]
    const correctIndex = options.indexOf(item.content)

    return {
      id: `${EXERCISE_ID}-${item.id}`,
      stimulus: item.content,
      stimulusLabel: item.contentLabel,
      options,
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

  const engine = useExerciseEngine({ definition: FLASH_WORDS_DEFINITION })
  const [result, setResult] = useState<CompletedResult | null>(null)
  const [canvasKey, setCanvasKey] = useState(0)

  // Cast: definition caps maxSpeedMs at 500, so engine.speedMs always fits FlashDuration
  const flashDuration = engine.speedMs as FlashDuration

  const items = useMemo(
    () => buildItems(flashDuration, engine.sessionSeed + canvasKey),
    [flashDuration, engine.sessionSeed, canvasKey],
  )

  async function handleComplete(input: {
    correctCount: number
    totalCount: number
    durationMs: number
  }): Promise<void> {
    const outcome = engine.completeSession({
      correctCount: input.correctCount,
      totalCount: input.totalCount,
      durationMs: input.durationMs,
    })
    setResult(outcome)

    await savePracticeSession({
      labId: LAB_ID,
      exerciseId: EXERCISE_ID,
      durationMs: Math.max(1, input.durationMs),
      completed: outcome.metrics.accuracyPercent >= FLASH_WORDS_DEFINITION.adaptiveRules.minAccuracyToComplete,
    })
  }

  function handlePracticeAgain(): void {
    setResult(null)
    setCanvasKey((k) => k + 1)
    engine.startNewSession()
  }

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
          durationMs: summary.prevDurationMs * summary.totalCount,
        })
      }
      onExit={() => router.push(LAB_HREF)}
    />
  )
}
