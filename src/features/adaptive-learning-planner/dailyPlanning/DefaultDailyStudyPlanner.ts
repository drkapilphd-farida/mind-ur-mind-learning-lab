import type { DailyStudyPlan, SkillGap } from '../types'
import type { DailyStudyPlanner, SessionPlanningEngine } from '../contracts'
import { createSessionPlanningEngine } from '../sessionPlanning'

const SINGLE_SESSION_MAX_MINUTES = 45

export type DailyStudyPlannerDependencies = {
  sessionPlanningEngine: SessionPlanningEngine
}

function createDefaultDependencies(): DailyStudyPlannerDependencies {
  return { sessionPlanningEngine: createSessionPlanningEngine() }
}

// Implements DailyStudyPlanner. <=45 available minutes produces one
// session; more than that splits into 2 roughly-equal sessions
// (a real single sitting rarely stays effective much past 45 minutes)
// — each built via the injected SessionPlanningEngine, so the
// per-skill segment split logic is never duplicated here.
export class DefaultDailyStudyPlanner implements DailyStudyPlanner {
  constructor(private readonly dependencies: DailyStudyPlannerDependencies) {}

  planDay(availableMinutesPerDay: number, skillGaps: readonly SkillGap[]): DailyStudyPlan {
    if (availableMinutesPerDay <= 0) return { totalMinutesPerDay: 0, sessions: [] }

    if (availableMinutesPerDay <= SINGLE_SESSION_MAX_MINUTES) {
      const session = this.dependencies.sessionPlanningEngine.planSession(availableMinutesPerDay, skillGaps)
      return { totalMinutesPerDay: session.totalMinutes, sessions: [session] }
    }

    const firstSessionMinutes = Math.round(availableMinutesPerDay / 2)
    const secondSessionMinutes = availableMinutesPerDay - firstSessionMinutes
    const sessions = [
      this.dependencies.sessionPlanningEngine.planSession(firstSessionMinutes, skillGaps),
      this.dependencies.sessionPlanningEngine.planSession(secondSessionMinutes, skillGaps),
    ]

    return { totalMinutesPerDay: sessions.reduce((sum, session) => sum + session.totalMinutes, 0), sessions }
  }
}

export function createDailyStudyPlanner(overrides: Partial<DailyStudyPlannerDependencies> = {}): DailyStudyPlanner {
  return new DefaultDailyStudyPlanner({ ...createDefaultDependencies(), ...overrides })
}
