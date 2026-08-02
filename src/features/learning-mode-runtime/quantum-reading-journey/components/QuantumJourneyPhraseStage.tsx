'use client'

import { useMemo } from 'react'
import { PhraseReadingExperience } from '@/features/phrase-reading/components/PhraseReadingExperience'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { PhraseAsset } from '@/core/universal-learning-engine/learning-assets'
import { toPhraseReadingClusters } from '@/features/learning-mode-runtime/exercise-assets/toPhraseReadingClusters'
import { QuantumJourneyEmptyStage } from './QuantumJourneyEmptyStage'

type QuantumJourneyPhraseStageProps = {
  projectId: string
  phraseAssets: readonly PhraseAsset[]
  onComplete: (result: RuntimeResult) => void
  onSkip: () => void
}

// A real cluster needs 4 distinct phrases (1 stimulus + 3 real
// distractors) — see toPhraseReadingClusters's own guard.
const MIN_POOL_SIZE = 4

// QSR-ENGINE-SWAP-1 — renders the REAL, unmodified Phrase Reading™
// mission (Level 1-5 mastery gating, HUD, Brain Challenge, Pass/Fail loop,
// Micro Victory, Runtime Result, session analytics — all of it), the same
// mission the standalone Lab uses — a thin wrapper, not a second
// implementation. Only the content source changes: this document's own
// real phrases (pooled across every chapter, same rationale as
// QuantumJourneyChunkReadingStage/QuantumJourneyWordFlashStage) instead
// of the global curated dataset. Replaces the earlier passive
// PhraseJourneyScreen reveal from QSR-INTEGRATION-1.
export function QuantumJourneyPhraseStage({ projectId, phraseAssets, onComplete, onSkip }: QuantumJourneyPhraseStageProps): React.JSX.Element {
  const clusters = useMemo(() => toPhraseReadingClusters(phraseAssets), [phraseAssets])
  const initialSeed = useMemo(() => Date.now(), [])

  if (clusters.length < MIN_POOL_SIZE) {
    return <QuantumJourneyEmptyStage message="This document doesn't have enough distinct phrases yet for Phrase Reading." onSkip={onSkip} />
  }

  return (
    <PhraseReadingExperience
      initialSeed={initialSeed}
      assetPool={clusters}
      exitHref={`/preview/learning-projects/${projectId}/quantum-journey`}
      onComplete={onComplete}
    />
  )
}
