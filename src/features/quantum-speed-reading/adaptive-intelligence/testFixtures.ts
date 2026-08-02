// Shared test-only fixture builder for the Adaptive Intelligence Engine's
// test suite — every *.test.ts in this folder constructs ReadingSessionRecord
// arrays, so one builder avoids repeating the same object shape 8 times.
import type { ReadingSessionRecord } from './readingIntelligenceTypes'

let idCounter = 0

export function buildSession(overrides: Partial<ReadingSessionRecord> = {}): ReadingSessionRecord {
  idCounter += 1
  return {
    id: `session-${idCounter}`,
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
