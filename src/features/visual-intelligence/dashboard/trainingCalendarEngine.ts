// Visual Intelligence Lab™ — Visual Intelligence Dashboard™, Sprint 9.
// Training Calendar™ — a GitHub-contribution-style heatmap over the last
// 12 weeks, reusing weeklyProgressEngine's exact per-day computation
// (computeDailyBuckets) over a longer range — no duplicated logic.

import { computeDailyBuckets, type DayBucket } from './weeklyProgressEngine'
import type { DnaContext } from '../dna/dnaContext'

const CALENDAR_DAYS = 84 // 12 weeks

export function computeTrainingCalendar(context: DnaContext): readonly DayBucket[] {
  return computeDailyBuckets(context, CALENDAR_DAYS)
}
