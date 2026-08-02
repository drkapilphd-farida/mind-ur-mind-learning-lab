'use client'

import { useMemo } from 'react'
import { SentenceReadingExperience } from '@/features/quantum-speed-reading/components/SentenceReadingExperience'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { SentenceAsset } from '@/core/universal-learning-engine/learning-assets'
import { toSentenceReadingChapters } from '@/features/learning-mode-runtime/exercise-assets/toSentenceReadingChapters'
import { QuantumJourneyEmptyStage } from './QuantumJourneyEmptyStage'

type QuantumJourneySentenceStageProps = {
  projectId: string
  chapterId: string
  sentenceAssets: readonly SentenceAsset[]
  onComplete: (result: RuntimeResult) => void
  onSkip: () => void
}

// A real chapter unit needs exactly 5 real sentences — see
// toSentenceReadingChapters's own fixed-tuple requirement.
const MIN_POOL_SIZE = 5

// QSR-ENGINE-SWAP-1 — renders the REAL, unmodified Sentence Reading™
// mission (Level 1-5 mastery gating, HUD, Brain Challenge, Pass/Fail loop,
// Micro Victory, Runtime Result, session analytics — all of it), the same
// mission the standalone Lab uses — a thin wrapper, not a second
// implementation. Only the content source changes: this document's own
// real sentences (pooled across every chapter) instead of the global
// curated dataset — and only the `sequence` challenge type is ever
// requested for real data (sentenceEngine.ts's own graceful filter),
// never a fabricated theme/summary/distractor. Replaces the earlier
// passive SentenceJourneyScreen reveal from QSR-INTEGRATION-1.
export function QuantumJourneySentenceStage({ projectId, chapterId, sentenceAssets, onComplete, onSkip }: QuantumJourneySentenceStageProps): React.JSX.Element {
  const chapters = useMemo(() => toSentenceReadingChapters(sentenceAssets, chapterId), [sentenceAssets, chapterId])
  const initialSeed = useMemo(() => Date.now(), [])

  if (sentenceAssets.length < MIN_POOL_SIZE || chapters.length === 0) {
    return <QuantumJourneyEmptyStage message="This document doesn't have enough distinct sentences yet for Sentence Reading." onSkip={onSkip} />
  }

  return (
    <SentenceReadingExperience
      initialSeed={initialSeed}
      assetPool={chapters}
      exitHref={`/preview/learning-projects/${projectId}/quantum-journey`}
      onComplete={onComplete}
    />
  )
}
