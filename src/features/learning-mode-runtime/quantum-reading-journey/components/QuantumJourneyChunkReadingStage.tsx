'use client'

import { useMemo } from 'react'
import { ProgressiveChunkReadingExperience } from '@/features/progressive-chunk-reading/components/ProgressiveChunkReadingExperience'
import { CHUNK_READING_DATASET } from '@/features/chunk-reading/chunkDataset'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
import type { ExerciseDefinition } from '@/types/exercise-engine'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { ChunkExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import { toChunkReadingContentItems } from '@/features/learning-mode-runtime/exercise-assets/toChunkReadingContentItems'
import { QuantumJourneyEmptyStage } from './QuantumJourneyEmptyStage'

type QuantumJourneyChunkReadingStageProps = {
  projectId: string
  chunkAssets: readonly ChunkExerciseAsset[]
  onComplete: (result: RuntimeResult) => void
  onSkip: () => void
}

// A real recognition question needs 1 stimulus + 3 distractors (see
// buildProgressiveChunkReadingBlock's own real minimum) — below that, the
// real mission has nothing to build even Level 1's first round from.
const MIN_POOL_SIZE = 4

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.6: Quantum
// Experience Parity™. Renders the REAL, unmodified Progressive Chunk
// Reading™ mission (Level 1-5 mastery gating, HUD, Pass/Fail loop, Micro
// Victory, Runtime Result, session analytics — all of it) — this is a
// thin wrapper, not a second implementation. Only the content source
// changes: the document's own chunk assets (pooled across every chapter,
// not just this one — the mastery system needs far more distinct chunks
// than one chapter supplies to reach its higher levels) instead of the
// global curated dataset. A distinct exerciseId
// ('quantum-journey-chunk-reading') keeps this stage's own
// practice_sessions/history rows separate from the standalone Progressive
// Chunk Reading™ mission's, exactly like QuantumJourneyWordFlashStage
// already does for Word Flash.
export function QuantumJourneyChunkReadingStage({ projectId, chunkAssets, onComplete, onSkip }: QuantumJourneyChunkReadingStageProps): React.JSX.Element {
  const contentPool = useMemo(() => toChunkReadingContentItems(chunkAssets), [chunkAssets])

  const definition: ExerciseDefinition = useMemo(
    () => ({
      id: 'quantum-journey-chunk-reading',
      labId: 'quantum-speed-reading',
      title: 'Progressive Chunk Reading™',
      description: 'Word groups from your document appear automatically, in flow — read naturally, then answer recognition questions to unlock the next level.',
      trainsAbility: 'Sustained reading rhythm at an expanding chunk size',
      exerciseType: 'reading',
      contentType: 'chunk',
      interactionType: 'multiple-choice',
      dataset: CHUNK_READING_DATASET,
      adaptiveRules: { increaseSpeedAbove: 90, decreaseSpeedBelow: 70, minSpeedMs: 60, maxSpeedMs: 1000, defaultSpeedMs: 400, itemsPerSession: 4, minAccuracyToComplete: 60 },
      speedMode: 'auto',
      scoringRules: DEFAULT_SCORING_RULES,
      intelligenceDimension: 'reading',
      href: `/preview/learning-projects/${projectId}/quantum-journey`,
      labHref: `/preview/learning-projects/${projectId}`,
      locale: 'en',
      i18nKeys: {
        title: 'Progressive Chunk Reading™',
        description: 'Read naturally, then answer recognition questions to unlock the next level.',
        instruction: 'Which of these did you just read?',
        startLabel: 'Begin Reading',
        pauseLabel: 'Pause',
        resumeLabel: 'Resume',
        exitLabel: 'Exit',
        correctLabel: 'Correct',
        incorrectLabel: 'Not quite',
        completedLabel: 'Complete',
        practiceAgainLabel: 'Retry Mission',
        questionPrompt: 'Which of these did you just read?',
        keyboardHint: 'Use 1-4 to answer',
      },
      config: {},
    }),
    [projectId],
  )

  // Generated once per mount — this stage only ever renders client-side
  // (reached via the Journey controller's own client state), so there is
  // no SSR/hydration render to stay consistent with, unlike the standalone
  // route's server-generated seed.
  const initialSeed = useMemo(() => Date.now(), [])

  if (contentPool.length < MIN_POOL_SIZE) {
    return <QuantumJourneyEmptyStage message="This document doesn't have enough distinct word groups yet for Chunk Reading." onSkip={onSkip} />
  }

  return (
    <ProgressiveChunkReadingExperience
      initialSeed={initialSeed}
      definition={definition}
      contentPool={contentPool}
      exitHref={`/preview/learning-projects/${projectId}`}
      onComplete={onComplete}
    />
  )
}
