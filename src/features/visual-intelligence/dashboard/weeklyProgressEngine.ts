// Visual Intelligence Lab™ — Visual Intelligence Dashboard™, Sprint 9.
// Weekly Progress™ — real daily buckets derived from the same already-
// fetched raw session rows, mirroring Sprint-8's evolutionNotesEngine
// week-bucketing pattern but per-day. computeDailyBuckets is shared with
// trainingCalendarEngine.ts (same computation, different range) — no
// duplicated logic between the two.

import type { DnaContext } from '../dna/dnaContext'

const IMAGE_PERSISTENCE_XP = 25
const FIXATION_XP = 20
const PERSISTENCE_CHALLENGE_XP = 25

export type DayBucket = {
  dateKey: string
  sessionsCount: number
  trainingMinutes: number
  xp: number
  /** null on days with no persistence-challenge session — an honest gap. */
  observationScore: number | null
  /** real day-over-day cumulative-session growth; null with no prior baseline. */
  growthPercent: number | null
}

function toDateKey(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10)
}

function dateKeyOffset(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function computeDailyBuckets(context: DnaContext, days: number, referenceDateKey: string = todayDateKey()): readonly DayBucket[] {
  const dateKeys = Array.from({ length: days }, (_, i) => dateKeyOffset(referenceDateKey, -(days - 1 - i)))

  const perDay = new Map<string, { sessionsCount: number; trainingMinutes: number; xp: number; journalUsed: number; journalTotal: number }>()
  for (const dateKey of dateKeys) {
    perDay.set(dateKey, { sessionsCount: 0, trainingMinutes: 0, xp: 0, journalUsed: 0, journalTotal: 0 })
  }

  function record(dateKey: string, durationSeconds: number, xp: number): void {
    const bucket = perDay.get(dateKey)
    if (!bucket) return // outside the requested range
    bucket.sessionsCount += 1
    bucket.trainingMinutes += durationSeconds / 60
    bucket.xp += xp
  }

  for (const session of context.raw.imagePersistence) {
    if (session.completed) record(toDateKey(session.occurredAt), session.durationSeconds, IMAGE_PERSISTENCE_XP)
  }
  for (const session of context.raw.fixation) {
    if (session.completed) record(toDateKey(session.occurredAt), session.durationSeconds, FIXATION_XP)
  }
  for (const session of context.raw.persistenceChallenge) {
    if (!session.completed) continue
    record(toDateKey(session.occurredAt), session.durationSeconds, PERSISTENCE_CHALLENGE_XP)
    const bucket = perDay.get(toDateKey(session.occurredAt))
    if (bucket) {
      bucket.journalTotal += 1
      if (session.journalNotes !== null && session.journalNotes.trim().length > 0) bucket.journalUsed += 1
    }
  }
  // visualPreparation sessions count toward frequency but carry no XP
  // (Sprint-8's honest exclusion — no completion screen ever disclosed one).
  for (const session of context.raw.visualPreparation) {
    if (session.completed) record(toDateKey(session.occurredAt), session.durationSeconds, 0)
  }

  let previousCumulative = 0
  return dateKeys.map((dateKey) => {
    const bucket = perDay.get(dateKey)!
    const cumulative = previousCumulative + bucket.sessionsCount
    const growthPercent = previousCumulative > 0 ? Math.round(((cumulative - previousCumulative) / previousCumulative) * 100) : null
    previousCumulative = cumulative

    return {
      dateKey,
      sessionsCount: bucket.sessionsCount,
      trainingMinutes: Math.round(bucket.trainingMinutes),
      xp: bucket.xp,
      observationScore: bucket.journalTotal === 0 ? null : Math.round((bucket.journalUsed / bucket.journalTotal) * 100),
      growthPercent,
    }
  })
}

export function computeWeeklyProgress(context: DnaContext): readonly DayBucket[] {
  return computeDailyBuckets(context, 7)
}
