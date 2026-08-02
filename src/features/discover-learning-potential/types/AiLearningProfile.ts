import type { LearnerType } from './LearnerContext'

// Discover Your Learning Potential™ — Sprint-1 Foundation. Deliberately
// honest and minimal: `reading_discovery_sessions`/`memory_discovery_sessions`/
// `focus_discovery_sessions` are real but intentionally UNSCORED
// observation logs (per their own migrations' comments) — there is no
// real WPM/accuracy/memory/focus number anywhere in this data yet.
// Reporting fabricated scores here would violate this project's own
// standing "never guess" discipline. This model reports what genuinely
// happened (which stages were completed, how many times, when) — the
// rich, scored report (real reading speed, real memory/focus summaries,
// realistic estimated potential) is a later sprint's job, built by
// extending this same real model once the engines that produce those
// real numbers exist — never a refactor of this shape.
export type DiscoveryStageStatus = {
  completed: boolean
  lastCompletedAt: string | null
  sessionCount: number
}

export type AiLearningProfile = {
  learnerType: LearnerType | null
  reading: DiscoveryStageStatus
  memory: DiscoveryStageStatus
  focus: DiscoveryStageStatus
  // True only once every stage has at least one real completed session —
  // gates the future rich/scored report, not this Sprint-1 honest summary.
  hasEnoughDataForFullProfile: boolean
  recommendedNextStep: string
}
