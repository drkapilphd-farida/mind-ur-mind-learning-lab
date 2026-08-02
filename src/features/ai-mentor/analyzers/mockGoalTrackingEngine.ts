import type { GoalTrackingEngine } from '../contracts'
import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implements GoalTrackingEngine. `MentorActivitySnapshot` (Chunk 1,
// locked) carries no goal field — there is no goal-setting feature
// yet anywhere in the product — so this honestly reports "no goal set"
// rather than fabricating a target or a completion percentage against
// one. Real session count still shapes the message, so it isn't a
// static string regardless of input.
export class MockGoalTrackingEngine implements GoalTrackingEngine {
  async track(snapshot: MentorActivitySnapshot): Promise<MentorInsight> {
    const hasStarted = snapshot.sessionCount > 0

    return {
      id: `goal-${snapshot.learningProjectId}`,
      type: 'goal',
      summary: hasStarted ? 'No goal set yet' : 'Ready to set a goal',
      detail: hasStarted
        ? `You've completed ${snapshot.sessionCount} session${snapshot.sessionCount === 1 ? '' : 's'} so far. Setting a specific goal can help you stay focused.`
        : 'Set a learning goal to track progress toward it here.',
    }
  }
}

export function createGoalTrackingEngine(): GoalTrackingEngine {
  return new MockGoalTrackingEngine()
}
