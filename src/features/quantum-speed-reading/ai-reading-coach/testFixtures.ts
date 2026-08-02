// Shared test-only fixture builder for the AI Reading Coach™ test suite —
// mirrors adaptive-intelligence/testFixtures.ts's exact convention.
import type { ReadingSessionRecord } from '../adaptive-intelligence/readingIntelligenceTypes'

let idCounter = 0

export function buildSession(overrides: Partial<ReadingSessionRecord> = {}): ReadingSessionRecord {
  idCounter += 1
  return {
    id: `coach-session-${idCounter}`,
    passageId: 'science-easy-1',
    category: 'science',
    difficulty: 'easy',
    mode: 'focus',
    wpm: 200,
    readingTimeMs: 60_000,
    comprehensionPercent: 80,
    accuracyPercent: 80,
    readingIntelligenceScore: 80,
    focusMode: false,
    hintsUsed: 0,
    completed: true,
    occurredAt: new Date().toISOString(),
    ...overrides,
  }
}
