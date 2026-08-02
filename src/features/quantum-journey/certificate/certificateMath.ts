import type { DailyQuantumSessionRecord } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'

// Day 21 Completion Certificate™ — pure functions only, no DB/React.
// Mirrors this project's existing convention (analyticsMath.ts,
// adaptivePacing.ts): small, independently testable transforms.

const FINAL_JOURNEY_DAY = 21

// The real Day 21 result, derived the same ordinal way adaptivePacing.ts's
// getBaselineSession derives Day 1: daily_quantum_sessions has no
// persisted "day number" column, only occurred_at order, so the
// 21st-oldest real session IS Day 21 (true as long as one real session
// exists per day, which the journey's own flow guarantees). Returns null
// until the user has genuinely completed 21 real sessions — a certificate
// is never generated from anything less.
export function getDay21Session(history: readonly DailyQuantumSessionRecord[]): DailyQuantumSessionRecord | null {
  if (history.length < FINAL_JOURNEY_DAY) return null
  const oldestFirst = [...history].reverse()
  return oldestFirst[FINAL_JOURNEY_DAY - 1] ?? null
}

export type CertificateStats = {
  startingWpm: number
  endingWpm: number
  growthPercent: number | null
  averageComprehensionPercent: number
  completionDate: string
}

// Every figure here comes from real, already-persisted rows — never
// fabricated. growthPercent is null only when startingWpm is honestly 0
// (a real possibility under True WPM™ — see trueWpm.ts), since dividing
// by zero has no honest percentage to report.
export function computeCertificateStats(
  baselineWpm: number,
  day21Session: DailyQuantumSessionRecord,
  history: readonly DailyQuantumSessionRecord[],
): CertificateStats {
  const growthPercent = baselineWpm > 0 ? Math.round(((day21Session.readingWpm - baselineWpm) / baselineWpm) * 100) : null
  const averageComprehensionPercent = Math.round(history.reduce((sum, session) => sum + session.accuracyPercent, 0) / history.length)

  return {
    startingWpm: baselineWpm,
    endingWpm: day21Session.readingWpm,
    growthPercent,
    averageComprehensionPercent,
    completionDate: day21Session.occurredAt,
  }
}
