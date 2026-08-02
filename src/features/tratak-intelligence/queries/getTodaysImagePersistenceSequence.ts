import { createClient } from '@/lib/supabase/server'
import { getTratakMissionSessions } from './getTratakMissionSessions'
import { IMAGE_PERSISTENCE_IMAGE_POOL, type ImagePersistenceImageDefinition } from '../imagePersistencePool'
import { DAILY_IMAGE_COUNT, hashSeed, selectDailyImagePersistenceSequence } from '../imagePersistenceDailySequence'
import { computeDailyPersistenceReport, type DailyImageSessionSummary, type DailyPersistenceReport } from '../dailyPersistenceReport'
import type { VisualIntelligenceReport } from '../actions/completeTratakMissionSession'

// Same UTC-calendar-day-key convention as tratakStreak.ts's own local
// toDateKey/dateKeyOffset helpers — a small deliberate duplicate, not a
// cross-import, so this file's "day" concept is entirely self-contained
// and stable within a calendar day regardless of what time-of-day it's
// called (no wall-clock jitter near a day boundary).
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

function extractImagePersistence(analyzerData: unknown): { imageId: string; report: VisualIntelligenceReport } | null {
  if (typeof analyzerData !== 'object' || analyzerData === null) return null
  const record = analyzerData as Record<string, unknown>
  const imagePersistence = record.imagePersistence
  const report = record.report
  if (typeof imagePersistence !== 'object' || imagePersistence === null) return null
  const imageId = (imagePersistence as Record<string, unknown>).imageId
  if (typeof imageId !== 'string' || typeof report !== 'object' || report === null) return null
  return { imageId, report: report as VisualIntelligenceReport }
}

export type TodaysImagePersistenceSequence = {
  sequence: readonly ImagePersistenceImageDefinition[]
  todaysCompletedCount: number
  // Eagerly computed only when today's 5 are already done, so revisiting
  // the route the same day can show "Today's Challenge Complete" with the
  // real aggregate immediately — no extra client round-trip.
  initialTodaysReport: DailyPersistenceReport | null
}

// Deterministically derives TODAY's 5-image sequence from a seed of
// `${userId}-${todayDateKey}` — the exact same sequence every time this
// same user reloads this same day, with zero new persistence. A new day
// (new date key) naturally produces a new sequence.
export async function getTodaysImagePersistenceSequence(): Promise<TodaysImagePersistenceSequence> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const todayKey = todayDateKey()

  // Anonymous-safe: a real, user-agnostic sequence (seeded by date alone),
  // never tracked as progress — mirrors the anonymous-safe convention used
  // by every Server Action in this feature.
  if (!user) {
    const sequence = selectDailyImagePersistenceSequence(IMAGE_PERSISTENCE_IMAGE_POOL, [], hashSeed(todayKey))
    return { sequence, todaysCompletedCount: 0, initialTodaysReport: null }
  }

  const allSessions = await getTratakMissionSessions()
  const imagePersistenceSessions = allSessions.filter((session) => session.missionId === 'image-persistence-challenge')
  const todaysSessions = imagePersistenceSessions.filter((session) => toDateKey(session.occurredAt) === todayKey)

  // "Recent" = real image ids used in the last 3 calendar days (today
  // included) — feeds the "never repeat recent images" preference.
  const recentDateKeys = new Set([todayKey, dateKeyOffset(todayKey, -1), dateKeyOffset(todayKey, -2)])
  const recentImageIds = imagePersistenceSessions
    .filter((session) => recentDateKeys.has(toDateKey(session.occurredAt)))
    .map((session) => extractImagePersistence(session.analyzerData)?.imageId)
    .filter((id): id is string => typeof id === 'string')

  const seed = hashSeed(`${user.id}-${todayKey}`)
  const sequence = selectDailyImagePersistenceSequence(IMAGE_PERSISTENCE_IMAGE_POOL, recentImageIds, seed)

  const todaysCompletedCount = todaysSessions.length
  let initialTodaysReport: DailyPersistenceReport | null = null

  if (todaysCompletedCount >= DAILY_IMAGE_COUNT) {
    const summaries = todaysSessions
      .map((session): DailyImageSessionSummary | null => {
        const extracted = extractImagePersistence(session.analyzerData)
        return extracted === null ? null : { report: extracted.report, xpEarned: session.xpEarned }
      })
      .filter((summary): summary is DailyImageSessionSummary => summary !== null)
    initialTodaysReport = computeDailyPersistenceReport(summaries)
  }

  return { sequence, todaysCompletedCount, initialTodaysReport }
}
