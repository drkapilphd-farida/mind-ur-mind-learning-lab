// "Session Status" (§ brief) — the one genuinely new data shape this sprint
// adds. No journey-level status summary existed before this; SessionProgress.tsx
// is per-exercise only. Derived entirely from Sprint 46's already-computed
// journey/dailyMission — no new journey computation.
export type ReadingSessionStatus = {
  readonly stageLabel: string
  readonly stagePosition: { readonly index: number; readonly total: number }
  readonly exerciseLabel: string | null
  readonly isComplete: boolean
}
