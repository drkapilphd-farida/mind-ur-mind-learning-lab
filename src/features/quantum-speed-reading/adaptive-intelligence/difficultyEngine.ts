// Smart Difficulty Engine — Sprint 4. Never forces progression: Sprint-1's
// Passage/Difficulty Selection screen is locked and unaware of this engine.
// This only produces an advisory suggestion shown in the AI Coach panel.

import type { PassageDifficulty } from '../passageDifficulty'
import type { ReadingSessionRecord } from './readingIntelligenceTypes'

export type DifficultySuggestionKind = 'advance' | 'repeat' | 'balance' | 'steady'

export type DifficultySuggestion = {
  kind: DifficultySuggestionKind
  message: string
  suggestedDifficulty: PassageDifficulty | null
}

const DIFFICULTY_LABEL: Record<PassageDifficulty, string> = { easy: 'Beginner', medium: 'Intermediate', hard: 'Advanced' }

function nextDifficulty(current: PassageDifficulty): PassageDifficulty | null {
  if (current === 'easy') return 'medium'
  if (current === 'medium') return 'hard'
  return null
}

export function suggestNextDifficulty(
  latest: ReadingSessionRecord,
  previous: ReadingSessionRecord | null,
): DifficultySuggestion {
  // Reading speed increased BUT comprehension decreased → recommend
  // Balanced Mode (checked first — a real regression signal outranks a
  // single good score).
  if (previous && latest.wpm > previous.wpm && latest.comprehensionPercent < previous.comprehensionPercent) {
    return {
      kind: 'balance',
      message: 'Reading speed increased, but comprehension dropped. Recommend Balanced Mode to steady both.',
      suggestedDifficulty: latest.difficulty,
    }
  }

  if (latest.accuracyPercent > 90 && latest.comprehensionPercent > 90) {
    const next = nextDifficulty(latest.difficulty)
    if (next) {
      return {
        kind: 'advance',
        message: `Excellent work. You maintained ${latest.comprehensionPercent}% comprehension. Ready for ${DIFFICULTY_LABEL[next]}.`,
        suggestedDifficulty: next,
      }
    }
    return {
      kind: 'steady',
      message: `Excellent work at ${DIFFICULTY_LABEL[latest.difficulty]} — you're at the top level for now.`,
      suggestedDifficulty: latest.difficulty,
    }
  }

  if (latest.accuracyPercent < 70) {
    return {
      kind: 'repeat',
      message: `Comprehension dropped. Practice another ${DIFFICULTY_LABEL[latest.difficulty]} passage before advancing.`,
      suggestedDifficulty: latest.difficulty,
    }
  }

  return {
    kind: 'steady',
    message: `Solid, steady progress at ${DIFFICULTY_LABEL[latest.difficulty]}. Keep practicing here a little longer.`,
    suggestedDifficulty: latest.difficulty,
  }
}
