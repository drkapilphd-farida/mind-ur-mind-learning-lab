'use client'

import { ParagraphJourneyScreen } from '@/features/quantum-speed-reading-runtime/components/reading-journey/ParagraphJourneyScreen'
import type { ParagraphAsset } from '@/core/universal-learning-engine/learning-assets'

type QuantumJourneyParagraphStageProps = {
  paragraphAssets: readonly ParagraphAsset[]
  onComplete: () => void
}

// QSR-INTEGRATION-1 — renders the REAL, unmodified Reading Journey
// Experience™'s own Paragraph screen (ParagraphJourneyScreen, Sprint-5),
// fed by this chapter's real paragraph assets — a thin wrapper, not a
// second implementation. Already handles zero paragraphs with its own
// honest empty-state copy.
export function QuantumJourneyParagraphStage({ paragraphAssets, onComplete }: QuantumJourneyParagraphStageProps): React.JSX.Element {
  return <ParagraphJourneyScreen paragraphs={paragraphAssets} onFinished={onComplete} />
}
