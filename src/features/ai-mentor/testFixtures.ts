// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/learning-intelligence/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file.
import type { LearningPlan } from '@/features/learning-intelligence/types'
import type { Clock, IdGenerator } from './contracts'
import type { Conversation, MentorActivitySnapshot, MentorMessage, MentorRecommendation, MentorSession } from './types'

export function makeMentorSession(overrides: Partial<MentorSession> = {}): MentorSession {
  return {
    id: 'session-1',
    learningProjectId: 'project-1',
    status: 'active',
    startedAt: '2026-01-01T00:00:00.000Z',
    endedAt: null,
    ...overrides,
  }
}

export function makeMentorMessage(overrides: Partial<MentorMessage> = {}): MentorMessage {
  return {
    id: 'message-1',
    role: 'learner',
    content: 'Hello',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conversation-1',
    learningProjectId: 'project-1',
    messages: [],
    startedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeMentorRecommendation(overrides: Partial<MentorRecommendation> = {}): MentorRecommendation {
  return {
    id: 'recommendation-1',
    category: 'next-step',
    priority: 'medium',
    title: 'Try a quiz',
    description: 'Test your understanding of the concepts covered so far.',
    ...overrides,
  }
}

export function makeMentorActivitySnapshot(overrides: Partial<MentorActivitySnapshot> = {}): MentorActivitySnapshot {
  return {
    learningProjectId: 'project-1',
    conceptsEncountered: ['Introduction', 'Core Content'],
    studyModesUsed: ['flashcard', 'quiz'],
    sessionCount: 2,
    ...overrides,
  }
}

// A fixed Clock/IdGenerator pair for asserting exact timestamps/ids in
// conversation/ tests, rather than asserting "is a string."
export function makeFixedClock(fixedNow = '2026-01-01T00:00:00.000Z'): Clock {
  return { now: () => fixedNow }
}

export function makeSequentialIdGenerator(prefix = 'id'): IdGenerator {
  let counter = 0
  return {
    generate: () => {
      counter += 1
      return `${prefix}-${counter}`
    },
  }
}

// A plain, valid LearningPlan fixture — this feature's own, not a
// re-export of `@/features/learning-intelligence/testFixtures.ts`
// (test-only code stays scoped to its own feature, same as production
// code).
export function makeLearningPlan(overrides: Partial<LearningPlan> = {}): LearningPlan {
  return {
    documentId: 'document-1',
    summary: { overview: 'A short overview.', keyPoints: ['Introduction', 'Core Content'] },
    concepts: [
      { id: 'concept-0', title: 'Introduction', description: 'An opening overview.', relatedConceptIds: ['concept-1'] },
      { id: 'concept-1', title: 'Core Content', description: 'The primary ideas.', relatedConceptIds: ['concept-0'] },
    ],
    flashcards: [],
    quizQuestions: [],
    practiceQuestions: [],
    revisionBlocks: [],
    mindMapNodes: [],
    teachingOutline: { sections: [] },
    availableStudyModes: ['concept', 'flashcard', 'quiz-question'],
    recommendations: [],
    ...overrides,
  }
}
