import type { AnalyzedGoal, SkillArea } from '../types'
import type { LearningGoalAnalyzer } from '../contracts'

// Ordered so the first matching keyword wins — deterministic,
// no ambiguity between overlapping matches.
const KEYWORDS_BY_SKILL: readonly { skill: SkillArea; keywords: readonly string[] }[] = [
  { skill: 'reading', keywords: ['read', 'speed reading', 'comprehension', 'fluency'] },
  { skill: 'memory', keywords: ['memory', 'remember', 'recall', 'retention'] },
  { skill: 'focus', keywords: ['focus', 'concentrat', 'attention', 'distraction'] },
]

// Implements LearningGoalAnalyzer. Deterministic substring keyword
// matching on the lowercased goal — no LLM call. A goal matching no
// known keyword classifies as 'general' (an honest "doesn't map
// cleanly," never a guessed skill).
export class DefaultLearningGoalAnalyzer implements LearningGoalAnalyzer {
  analyze(rawGoal: string): AnalyzedGoal {
    const normalized = rawGoal.toLowerCase()
    const match = KEYWORDS_BY_SKILL.find(({ keywords }) => keywords.some((keyword) => normalized.includes(keyword)))

    return { rawGoal, focusSkill: match?.skill ?? 'general' }
  }
}

export function createLearningGoalAnalyzer(): LearningGoalAnalyzer {
  return new DefaultLearningGoalAnalyzer()
}
