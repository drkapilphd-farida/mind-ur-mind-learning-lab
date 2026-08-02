// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-provider/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file.
import type { ConversationContext, JourneyContext, MentorPersona, MindContext, UserContext } from './types'

export function makeUserContext(overrides: Partial<UserContext> = {}): UserContext {
  return {
    userProfile: { id: 'user-1', displayName: 'Ada' },
    ageGroup: 'adult',
    preferredLanguage: 'en',
    currentJourney: 'quantum-speed-reading',
    currentLab: 'quantum-speed-reading',
    activeExercise: 'eye-warm-up',
    learningGoal: 'Read faster with better comprehension',
    difficultyLevel: 'beginner',
    ...overrides,
  }
}

export function makeMindContext(overrides: Partial<MindContext> = {}): MindContext {
  return {
    mindScore: 42,
    readingScore: 10,
    memoryScore: 8,
    focusScore: 12,
    visualIntelligenceScore: 12,
    consistency: 5,
    xp: 120,
    streak: 3,
    currentProgress: 40,
    ...overrides,
  }
}

export function makeJourneyContext(overrides: Partial<JourneyContext> = {}): JourneyContext {
  return {
    currentJourney: 'Quantum Speed Reading™',
    currentChapter: 'Visual Activation™',
    currentLesson: 'Breath Awareness',
    currentExercise: 'breath-awareness',
    completionPercent: 40,
    previousMilestones: ['Visual Activation™ complete'],
    ...overrides,
  }
}

export function makeConversationContext(overrides: Partial<ConversationContext> = {}): ConversationContext {
  return {
    currentTopic: 'reading speed',
    previousQuestions: ['How do I read faster?'],
    conversationSummary: 'Learner is starting their reading speed journey.',
    learningIntent: 'improve-reading-speed',
    pendingTasks: ['Complete Reading Preparation™'],
    ...overrides,
  }
}

export function makeMentorPersona(overrides: Partial<MentorPersona> = {}): MentorPersona {
  return {
    id: 'friendly-mentor',
    displayName: 'Friendly Mentor™',
    tone: 'warm, encouraging, conversational',
    focusAreas: [],
    systemPromptFragment: 'You are a friendly, encouraging learning mentor.',
    ...overrides,
  }
}
