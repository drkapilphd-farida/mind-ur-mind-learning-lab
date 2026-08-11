'use client'

import { QuantumReadingSprintPhase, type QuantumReadingSprintResult } from './QuantumReadingSprintPhase'
import { computeReadingPowerScore, computeReadingXp } from './quantumReadingSprintDataset'
import type { Phase3PoolExerciseId } from './qsrProCircuitRotation'
import { RapidVisualSpanExpanderExperience } from '@/features/rapid-visual-span-expander/components/RapidVisualSpanExpanderExperience'
import { DynamicChunkSlidingExperience } from '@/features/dynamic-chunk-sliding/components/DynamicChunkSlidingExperience'
import { FlashRecallSprintExperience } from '@/features/flash-recall-sprint/components/FlashRecallSprintExperience'
import { VerticalWordReadingExperience } from '@/features/vertical-word-reading/components/VerticalWordReadingExperience'
import { GuidedParagraphReadingModeExperience } from '@/features/guided-paragraph-reading-mode/components/GuidedParagraphReadingModeExperience'
import type { ReadingSessionResult } from '@/features/reading-engine/types'

// The one thing Phase 4 (Retention Check) genuinely needs — a
// `ReadingSet` with passage + retention MCQs — only the bespoke Quantum
// Reading Sprint drill produces. Every other Phase 3 pool member
// produces a `ReadingSessionResult` instead (averageWpm/completionPercent/
// etc., confirmed by reading each component's own real type), which
// simply has no passage to quiz on. UnifiedQuantumSession.tsx branches
// its own next-step decision on this same union.
export type QsrCircuitReadingCompletion =
  | { supportsRetention: true; result: QuantumReadingSprintResult }
  | { supportsRetention: false; xpEarned: number; statLine: string; wpm: number; accuracyPercent: number; readingScore: number }

type RotatingQuantumReadingSprintPhaseProps = {
  // Decided once, up front, by UnifiedQuantumSession.tsx (single source
  // of truth, same reasoning as RotatingVisualActivationPhase's own
  // `pickedId` prop — this value also determines totalSteps for the
  // progress bar, so it can't be computed independently here without
  // risking the two disagreeing).
  pickedId: Phase3PoolExerciseId
  onComplete: (completion: QsrCircuitReadingCompletion) => void
}

// QSR Pro Circuit™ — Phase 3 (Core Speed Training). Free users always get
// today's exact bespoke Quantum Reading Sprint — zero regression risk,
// Retention Check always follows. Pro users rotate across the bespoke
// drill plus 5 other reading exercises (Category B — each needed one
// small additive onComplete prop, see ReadingSessionCompleteScreen.tsx's
// own comment); on those days Retention Check is skipped, mirroring
// QuantumJourneySession.tsx's own accommodation for its rotating Dynamic
// Chunking day.
export function RotatingQuantumReadingSprintPhase({ pickedId, onComplete }: RotatingQuantumReadingSprintPhaseProps): React.JSX.Element {
  function handlePoolReadingComplete(result: ReadingSessionResult): void {
    const readingScore = computeReadingPowerScore(result.averageWpm, result.completionPercent)
    onComplete({
      supportsRetention: false,
      xpEarned: computeReadingXp(readingScore),
      statLine: `${result.averageWpm} WPM • ${result.completionPercent}% Completion`,
      wpm: result.averageWpm,
      accuracyPercent: result.completionPercent,
      readingScore,
    })
  }

  switch (pickedId) {
    case 'rapid-visual-span-expander':
      return <RapidVisualSpanExpanderExperience onComplete={handlePoolReadingComplete} />
    case 'dynamic-chunk-sliding':
      return <DynamicChunkSlidingExperience onComplete={handlePoolReadingComplete} />
    case 'flash-recall-sprint':
      return <FlashRecallSprintExperience onComplete={handlePoolReadingComplete} />
    case 'vertical-word-reading':
      return <VerticalWordReadingExperience onComplete={handlePoolReadingComplete} />
    case 'guided-paragraph-reading-mode':
      return <GuidedParagraphReadingModeExperience onComplete={handlePoolReadingComplete} />
    case 'quantum-reading-sprint':
    default:
      return <QuantumReadingSprintPhase onComplete={(result) => onComplete({ supportsRetention: true, result })} />
  }
}
