// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// AI Evolution Notes™ — derived LIVE from real session timestamps grouped
// by ISO week (Monday-start). No new log table, no scheduled job: weeks
// with no data are simply skipped, deltas are only ever emitted between
// two real weeks that both have data — never interpolated or invented.

import type { FixationSessionRecord } from '../fixation/fixationTypes'
import type { PersistenceChallengeSessionRecord } from '../persistence-challenge/persistenceChallengeTypes'
import type { DnaContext } from './dnaContext'
import type { EvolutionNote } from './dnaTypes'

function isoWeekKey(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  const dayIndex = (date.getUTCDay() + 6) % 7 // 0 = Monday
  const monday = new Date(date)
  monday.setUTCDate(date.getUTCDate() - dayIndex)
  monday.setUTCHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

function weekLabel(mondayDateKey: string): string {
  const date = new Date(`${mondayDateKey}T00:00:00.000Z`)
  return `Week of ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`
}

type WeekBucket = {
  fixation: FixationSessionRecord[]
  persistenceChallenge: PersistenceChallengeSessionRecord[]
}

function bucketByWeek(
  fixation: readonly FixationSessionRecord[],
  persistenceChallenge: readonly PersistenceChallengeSessionRecord[],
): Map<string, WeekBucket> {
  const buckets = new Map<string, WeekBucket>()

  function ensure(key: string): WeekBucket {
    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = { fixation: [], persistenceChallenge: [] }
      buckets.set(key, bucket)
    }
    return bucket
  }

  for (const session of fixation) {
    if (session.completed) ensure(isoWeekKey(session.occurredAt)).fixation.push(session)
  }
  for (const session of persistenceChallenge) {
    if (session.completed) ensure(isoWeekKey(session.occurredAt)).persistenceChallenge.push(session)
  }

  return buckets
}

const MAX_NOTES = 8

export function computeEvolutionNotes(context: DnaContext): readonly EvolutionNote[] {
  const buckets = bucketByWeek(context.raw.fixation, context.raw.persistenceChallenge)
  const sortedWeekKeys = Array.from(buckets.keys()).sort()

  let previousObservationRate: number | null = null
  let previousFixationAccuracy: number | null = null
  const notes: EvolutionNote[] = []

  for (const weekKey of sortedWeekKeys) {
    const bucket = buckets.get(weekKey)!
    const lines: string[] = []

    const journalUsedCount = bucket.persistenceChallenge.filter((s) => s.journalNotes !== null && s.journalNotes.trim().length > 0).length
    const observationRate = bucket.persistenceChallenge.length === 0 ? null : journalUsedCount / bucket.persistenceChallenge.length

    const accuracySamples = bucket.fixation.map((s) => s.accuracyPercent).filter((v): v is number => v !== null)
    const fixationAccuracy = accuracySamples.length === 0 ? null : accuracySamples.reduce((sum, v) => sum + v, 0) / accuracySamples.length

    if (observationRate !== null && previousObservationRate !== null && previousObservationRate > 0) {
      const deltaPercent = Math.round(((observationRate - previousObservationRate) / previousObservationRate) * 100)
      if (deltaPercent > 0) lines.push(`Observation improved ${deltaPercent}%`)
      else if (deltaPercent < 0) lines.push(`Observation dipped ${Math.abs(deltaPercent)}%`)
    }

    if (fixationAccuracy !== null && previousFixationAccuracy !== null && previousFixationAccuracy > 0) {
      const deltaPercent = Math.round(((fixationAccuracy - previousFixationAccuracy) / previousFixationAccuracy) * 100)
      if (deltaPercent > 0) lines.push(`Fixation accuracy improved ${deltaPercent}%`)
      else if (deltaPercent < 0) lines.push(`Fixation accuracy dipped ${Math.abs(deltaPercent)}%`)
    }

    if (bucket.persistenceChallenge.length > 0 && lines.length === 0) {
      lines.push('Image Persistence improving steadily.')
    }

    if (lines.length > 0) {
      notes.push({ weekLabel: weekLabel(weekKey), lines })
    }

    if (observationRate !== null) previousObservationRate = observationRate
    if (fixationAccuracy !== null) previousFixationAccuracy = fixationAccuracy
  }

  return notes.slice(-MAX_NOTES).reverse()
}
