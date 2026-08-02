import type { SessionPlan, SessionSegment, SkillGap } from '../types'
import type { SessionPlanningEngine } from '../contracts'

// Implements SessionPlanningEngine. Splits `availableMinutes`
// proportionally to each skill's gapScore (bigger gap = more time);
// skills with a zero gap get no segment at all. Rounds each segment to
// a whole minute, then assigns any leftover-from-rounding remainder to
// the largest segment, so `segments` always sums to exactly
// `totalMinutes` — never off by a minute due to rounding.
export class DefaultSessionPlanningEngine implements SessionPlanningEngine {
  planSession(availableMinutes: number, skillGaps: readonly SkillGap[]): SessionPlan {
    if (availableMinutes <= 0) return { totalMinutes: 0, segments: [] }

    const totalGapScore = skillGaps.reduce((sum, gap) => sum + gap.gapScore, 0)
    if (totalGapScore === 0) return { totalMinutes: availableMinutes, segments: [] }

    const segments: SessionSegment[] = skillGaps
      .filter((gap) => gap.gapScore > 0)
      .map((gap) => ({ skill: gap.skill, minutes: Math.round((gap.gapScore / totalGapScore) * availableMinutes) }))

    const allocatedMinutes = segments.reduce((sum, segment) => sum + segment.minutes, 0)
    const roundingRemainder = availableMinutes - allocatedMinutes

    if (roundingRemainder !== 0) {
      const largestSegment = [...segments].sort((a, b) => b.minutes - a.minutes)[0]
      if (largestSegment) largestSegment.minutes += roundingRemainder
    }

    return { totalMinutes: availableMinutes, segments }
  }
}

export function createSessionPlanningEngine(): SessionPlanningEngine {
  return new DefaultSessionPlanningEngine()
}
