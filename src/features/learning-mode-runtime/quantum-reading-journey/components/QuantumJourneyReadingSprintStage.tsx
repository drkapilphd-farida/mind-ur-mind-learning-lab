'use client'

import { ReadingSprintView } from '@/features/quantum-speed-reading-runtime/components/ReadingSprintView'
import { QuantumJourneyEmptyStage } from './QuantumJourneyEmptyStage'

type QuantumJourneyReadingSprintStageProps = {
  chapterContent: string
  onComplete: (wpm: number) => void
  onSkip: () => void
}

// A real sprint needs real text to time against — unlike
// PhraseJourneyScreen/SentenceJourneyScreen/ParagraphJourneyScreen (which
// each handle an empty asset list with their own honest copy),
// ReadingSprintView has no such guard, so this wrapper adds the same
// real "not enough content, keep moving" pattern QuantumJourneyWordFlashStage/
// QuantumJourneyChunkReadingStage already use.
const MIN_CONTENT_LENGTH = 40

// QSR-INTEGRATION-1 — renders the REAL, unmodified Quantum Speed Reading
// Experience Engine™'s own Reading Sprint (ReadingSprintView) — a thin
// wrapper, not a second implementation. Fed by this chapter's own real
// text (the same source buildChunkExerciseAssets already reads), never
// demo content.
export function QuantumJourneyReadingSprintStage({ chapterContent, onComplete, onSkip }: QuantumJourneyReadingSprintStageProps): React.JSX.Element {
  if (chapterContent.trim().length < MIN_CONTENT_LENGTH) {
    return <QuantumJourneyEmptyStage message="This chapter is too short for a real Reading Sprint." onSkip={onSkip} />
  }

  return <ReadingSprintView content={chapterContent} onComplete={onComplete} />
}
