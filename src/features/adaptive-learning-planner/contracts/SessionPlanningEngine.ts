import type { SessionPlan, SkillGap } from '../types'

// Distributes `availableMinutes` across skill areas proportional to
// each one's gapScore — a bigger gap gets more time in the session.
export interface SessionPlanningEngine {
  planSession(availableMinutes: number, skillGaps: readonly SkillGap[]): SessionPlan
}
