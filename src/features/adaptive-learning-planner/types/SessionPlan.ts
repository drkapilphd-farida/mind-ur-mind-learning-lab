import type { SessionSegment } from './SessionSegment'

// The Session Planning Engine's™ output — the structure of a single
// study session, split by skill area. `segments` always sums to
// `totalMinutes`.
export type SessionPlan = {
  totalMinutes: number
  segments: readonly SessionSegment[]
}
