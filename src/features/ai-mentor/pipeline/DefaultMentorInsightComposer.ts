import {
  createGoalTrackingEngine,
  createLearningPatternAnalyzer,
  createMotivationEngine,
  createProgressAnalyzer,
  createStrengthDetector,
  createWeaknessDetector,
} from '../analyzers'
import type {
  GoalTrackingEngine,
  LearningPatternAnalyzer,
  MentorInsightComposer,
  MotivationEngine,
  ProgressAnalyzer,
  StrengthDetector,
  WeaknessDetector,
} from '../contracts'
import type { MentorActivitySnapshot, MentorInsight } from '../types'

export type MentorInsightComposerDependencies = {
  progressAnalyzer: ProgressAnalyzer
  patternAnalyzer: LearningPatternAnalyzer
  weaknessDetector: WeaknessDetector
  strengthDetector: StrengthDetector
  motivationEngine: MotivationEngine
  goalTrackingEngine: GoalTrackingEngine
}

// Implements MentorInsightComposer — runs all six Chunk 2 first-order
// analyzers in parallel and flattens their output into one list. Each
// analyzer stays completely unmodified (imported via its own
// `createXxx()` factory, never a concrete class); this class only
// sequences and aggregates.
export class DefaultMentorInsightComposer implements MentorInsightComposer {
  constructor(private readonly deps: MentorInsightComposerDependencies) {}

  async compose(snapshot: MentorActivitySnapshot): Promise<readonly MentorInsight[]> {
    const [progress, pattern, weaknesses, strengths, motivation, goal] = await Promise.all([
      this.deps.progressAnalyzer.analyze(snapshot),
      this.deps.patternAnalyzer.analyze(snapshot),
      this.deps.weaknessDetector.detect(snapshot),
      this.deps.strengthDetector.detect(snapshot),
      this.deps.motivationEngine.assess(snapshot),
      this.deps.goalTrackingEngine.track(snapshot),
    ])

    return [progress, pattern, ...weaknesses, ...strengths, motivation, goal]
  }
}

export function createMentorInsightComposer(overrides: Partial<MentorInsightComposerDependencies> = {}): MentorInsightComposer {
  const deps: MentorInsightComposerDependencies = {
    progressAnalyzer: createProgressAnalyzer(),
    patternAnalyzer: createLearningPatternAnalyzer(),
    weaknessDetector: createWeaknessDetector(),
    strengthDetector: createStrengthDetector(),
    motivationEngine: createMotivationEngine(),
    goalTrackingEngine: createGoalTrackingEngine(),
    ...overrides,
  }
  return new DefaultMentorInsightComposer(deps)
}
