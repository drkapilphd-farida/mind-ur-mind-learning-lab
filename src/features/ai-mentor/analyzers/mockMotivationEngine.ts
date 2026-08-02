import type { MotivationEngine } from '../contracts'
import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implements MotivationEngine. Session count is the only real
// consistency signal this snapshot carries — bucketed into three
// honest bands rather than a fabricated "motivation score."
export class MockMotivationEngine implements MotivationEngine {
  async assess(snapshot: MentorActivitySnapshot): Promise<MentorInsight> {
    const summary = snapshot.sessionCount === 0 ? 'Ready to begin' : snapshot.sessionCount < 3 ? 'Building a habit' : 'Strong momentum'

    const detail =
      snapshot.sessionCount === 0
        ? "You haven't started a session yet — the first one is often the hardest to begin."
        : `${snapshot.sessionCount} session${snapshot.sessionCount === 1 ? '' : 's'} completed so far. Momentum builds with each one.`

    return { id: `motivation-${snapshot.learningProjectId}`, type: 'motivation', summary, detail }
  }
}

export function createMotivationEngine(): MotivationEngine {
  return new MockMotivationEngine()
}
