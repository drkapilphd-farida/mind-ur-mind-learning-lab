import type { LearningPatternAnalyzer } from '../contracts'
import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implements LearningPatternAnalyzer. Pattern signal comes from the
// real diversity of `studyModesUsed` — how many distinct modes, and
// which ones — never invented.
export class MockLearningPatternAnalyzer implements LearningPatternAnalyzer {
  async analyze(snapshot: MentorActivitySnapshot): Promise<MentorInsight> {
    const uniqueModes = [...new Set(snapshot.studyModesUsed)]

    const summary = uniqueModes.length === 0 ? 'No study pattern yet' : uniqueModes.length === 1 ? `Focused on ${uniqueModes[0]}` : 'Mixing multiple study modes'

    const detail =
      uniqueModes.length === 0
        ? 'Once you start studying, patterns in how you learn will appear here.'
        : `You've used ${uniqueModes.length} different study mode${uniqueModes.length === 1 ? '' : 's'}: ${uniqueModes.join(', ')}.`

    return { id: `pattern-${snapshot.learningProjectId}`, type: 'pattern', summary, detail }
  }
}

export function createLearningPatternAnalyzer(): LearningPatternAnalyzer {
  return new MockLearningPatternAnalyzer()
}
