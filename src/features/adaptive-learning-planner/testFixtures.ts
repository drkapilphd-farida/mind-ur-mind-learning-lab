// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-provider/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file.
import type { AnalyzedGoal, LearnerProfile, SkillGap } from './types'

export function makeLearnerProfile(overrides: Partial<LearnerProfile> = {}): LearnerProfile {
  return {
    mindScore: 42,
    journeyProgressPercent: 30,
    assessmentResults: [{ category: 'reading-comprehension', score: 70 }],
    readingLevel: 'beginner',
    memoryLevel: 'intermediate',
    focusLevel: 'beginner',
    learningGoal: 'I want to read faster',
    availableMinutesPerDay: 30,
    ...overrides,
  }
}

export function makeSkillGap(overrides: Partial<SkillGap> = {}): SkillGap {
  return { skill: 'reading', currentLevel: 'beginner', gapScore: 100, ...overrides }
}

export function makeAnalyzedGoal(overrides: Partial<AnalyzedGoal> = {}): AnalyzedGoal {
  return { rawGoal: 'I want to read faster', focusSkill: 'reading', ...overrides }
}
