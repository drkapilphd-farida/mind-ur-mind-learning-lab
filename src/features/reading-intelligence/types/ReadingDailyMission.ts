// A view-model derivation for the Reading Intelligence Experience — distinct
// from the existing `TodaysMissionCard` prop shapes (dashboard and
// visual-intelligence versions), which stay untouched. Derived from the real
// JourneyProgress, never recomputed.
export type ReadingDailyMission = {
  readonly stageId: string
  readonly stageTitle: string
  readonly actionLabel: string
  readonly continueHref: string
  readonly isAllDone: boolean
}
