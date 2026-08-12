// Best-stats store for Sensory Hologram Builder™ — a small, narrowly
// scoped parallel to every other exercise's own local-history file in
// this project (numberFlashGridLocalHistory.ts, dotMemoryGridLocalHistory.ts),
// not shared with any of them. Same SSR-safe localStorage convention and
// "0 means no record yet" sentinel those files already establish.
//
// This exercise has no right/wrong answer to score, so "accuracy" here is
// the user's own self-reported Sensory Immersion Score from the
// post-session reflection (see SensoryHologramBuilderReflectionScreen.tsx)
// — an honest metric, not a fabricated one. "Streak" is a genuinely
// different concept from the flash-grid exercises' same-session round
// streak: it's a cross-visit count of consecutive FULLY completed
// sessions (never broken by an early exit), fitting this exercise's own
// meditation-habit framing far better than a within-session streak would.
export type SensoryHologramBuilderBestStats = {
  bestScorePercent: number
  bestStreak: number
}

export type SensoryHologramBuilderStoredRecord = SensoryHologramBuilderBestStats & { currentStreak: number }
type StoredRecord = SensoryHologramBuilderStoredRecord

const EMPTY_RECORD: StoredRecord = { bestScorePercent: 0, bestStreak: 0, currentStreak: 0 }

function loadStoredRecord(storageKey: string): StoredRecord {
  if (typeof window === 'undefined') return EMPTY_RECORD
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return EMPTY_RECORD
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_RECORD
    const record = parsed as { bestScorePercent?: unknown; bestStreak?: unknown; currentStreak?: unknown }
    const bestScorePercent =
      typeof record.bestScorePercent === 'number' && Number.isFinite(record.bestScorePercent) ? record.bestScorePercent : 0
    const bestStreak = typeof record.bestStreak === 'number' && Number.isFinite(record.bestStreak) ? record.bestStreak : 0
    const currentStreak = typeof record.currentStreak === 'number' && Number.isFinite(record.currentStreak) ? record.currentStreak : 0
    return { bestScorePercent, bestStreak, currentStreak }
  } catch {
    return EMPTY_RECORD
  }
}

function persistRecord(storageKey: string, record: StoredRecord): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey, JSON.stringify(record))
  } catch {
    // localStorage full or blocked — fail silently, best record just resets next visit
  }
}

export function loadBestSensoryHologramBuilderStats(storageKey: string): SensoryHologramBuilderBestStats {
  const record = loadStoredRecord(storageKey)
  return { bestScorePercent: record.bestScorePercent, bestStreak: record.bestStreak }
}

// Called only when a session reaches the reflection screen and is fully
// completed — never on an early exit, matching every sibling exercise's
// "an abandoned attempt is never marked complete" convention. Returns the
// freshly updated currentStreak too (not just the two "best-ever" fields)
// so the completion screen can honestly show "Session Streak" — how many
// sessions in a row right now — distinct from "Best Streak (All-Time)".
export function recordSensoryHologramBuilderCompletion(storageKey: string, immersionScorePercent: number): StoredRecord {
  const previous = loadStoredRecord(storageKey)
  const nextCurrentStreak = previous.currentStreak + 1
  const next: StoredRecord = {
    bestScorePercent: Math.max(previous.bestScorePercent, immersionScorePercent),
    bestStreak: Math.max(previous.bestStreak, nextCurrentStreak),
    currentStreak: nextCurrentStreak,
  }
  persistRecord(storageKey, next)
  return next
}

// Called on a real early exit mid-journey — breaks the consecutive-
// completions streak without touching either best-ever value.
export function recordSensoryHologramBuilderEarlyExit(storageKey: string): void {
  const previous = loadStoredRecord(storageKey)
  if (previous.currentStreak === 0) return
  persistRecord(storageKey, { ...previous, currentStreak: 0 })
}
