import type { AnalyzedGoal } from '../types'

// Pure, deterministic keyword classification — never an LLM call.
export interface LearningGoalAnalyzer {
  analyze(rawGoal: string): AnalyzedGoal
}
