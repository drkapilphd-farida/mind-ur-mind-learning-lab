'use client'

import { useMemo } from 'react'
import { WordFlashExperience } from '@/features/flash-intelligence/components/WordFlashExperience'
import { WORD_FLASH_DATASET } from '@/features/flash-intelligence/wordFlashDataset'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
import type { ExerciseDefinition } from '@/types/exercise-engine'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { WordExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import { toWordFlashContentItems } from '@/features/learning-mode-runtime/exercise-assets/toWordFlashContentItems'
import { QuantumJourneyEmptyStage } from './QuantumJourneyEmptyStage'

type QuantumJourneyWordFlashStageProps = {
  projectId: string
  wordAssets: readonly WordExerciseAsset[]
  onComplete: (result: RuntimeResult) => void
  onSkip: () => void
}

// A real Word Flash session needs at least one word; buildWordFlashItems
// itself degrades gracefully (returns []) below this, but an empty mission
// is a bad experience worth pre-empting — same threshold as
// QuantumJourneyChunkReadingStage's own MIN_POOL_SIZE guard.
const MIN_POOL_SIZE = 4

// Reading Intelligence Engine™ Upgrade — Sprint QSR-3: Word Flash
// Experience Unification™. Renders the REAL, unmodified Word Flash™
// mission (5-level speed ramp, HUD, combo/focus displays, Micro Victory,
// Runtime Result, session analytics — all of it) — this is a thin
// wrapper, not a second implementation. Only the content source changes:
// the document's own word assets (pooled across every chapter, not just
// this one, for the same real-volume reason Chunk Reading's Journey stage
// already pools the whole document — see QuantumJourneyChunkReadingStage)
// instead of the global curated dataset. A distinct exerciseId
// ('quantum-journey-word-flash') keeps this stage's own
// practice_sessions/history rows separate from the standalone Word
// Flash™ mission's.
export function QuantumJourneyWordFlashStage({ projectId, wordAssets, onComplete, onSkip }: QuantumJourneyWordFlashStageProps): React.JSX.Element {
  const contentPool = useMemo(() => toWordFlashContentItems(wordAssets), [wordAssets])

  const definition: ExerciseDefinition = useMemo(
    () => ({
      id: 'quantum-journey-word-flash',
      labId: 'quantum-speed-reading',
      title: 'Word Flash',
      description: 'Words from your document flash briefly — identify each one before it disappears.',
      trainsAbility: 'Instant word recognition',
      exerciseType: 'flash',
      contentType: 'word',
      interactionType: 'multiple-choice',
      dataset: WORD_FLASH_DATASET,
      adaptiveRules: { increaseSpeedAbove: 90, decreaseSpeedBelow: 70, minSpeedMs: 200, maxSpeedMs: 600, defaultSpeedMs: 600, itemsPerSession: 20, minAccuracyToComplete: 50 },
      speedMode: 'adaptive',
      scoringRules: DEFAULT_SCORING_RULES,
      intelligenceDimension: 'reading',
      href: `/preview/learning-projects/${projectId}/quantum-journey`,
      labHref: `/preview/learning-projects/${projectId}`,
      locale: 'en',
      i18nKeys: {
        title: 'Word Flash',
        description: 'Words from your document flash briefly — identify each one before it disappears.',
        instruction: 'Select the word you saw.',
        startLabel: 'Start',
        pauseLabel: 'Pause',
        resumeLabel: 'Resume',
        exitLabel: 'Exit',
        correctLabel: 'Correct',
        incorrectLabel: 'Not quite',
        completedLabel: 'Complete',
        practiceAgainLabel: 'Practice Again',
        questionPrompt: 'What did you see?',
        keyboardHint: 'Use 1-4 to answer',
      },
      config: {},
    }),
    [projectId],
  )

  if (contentPool.length < MIN_POOL_SIZE) {
    return <QuantumJourneyEmptyStage message="This document doesn't have enough distinct words yet for Word Flash." onSkip={onSkip} />
  }

  return <WordFlashExperience definition={definition} contentPool={contentPool} onComplete={onComplete} />
}
