// Category Intelligence — Sprint 4. Identifies strong/weak/recently-
// practiced/needs-revision categories from real session history, and
// suggests a rotation target — never repeats the same category by default
// when an unpracticed one is available.

import type { PassageCategory } from '../passageLibrary'
import type { ReadingSessionRecord, CategoryIntelligence, CategoryPerformance } from './readingIntelligenceTypes'

const ALL_CATEGORIES: readonly PassageCategory[] = [
  'science', 'history', 'psychology', 'biography', 'business', 'technology', 'motivation', 'general-knowledge',
]

const STRONG_ACCURACY_THRESHOLD = 85
const WEAK_ACCURACY_THRESHOLD = 70
const RECENT_DAYS = 7
const REVISION_STALE_DAYS = 14

function daysSince(isoTimestamp: string, referenceMs: number): number {
  return Math.floor((referenceMs - new Date(isoTimestamp).getTime()) / 86_400_000)
}

export function computeCategoryIntelligence(
  sessions: readonly ReadingSessionRecord[],
  referenceMs: number = Date.now(),
): CategoryIntelligence {
  const completed = sessions.filter((s) => s.completed)

  const byCategory = new Map<PassageCategory, ReadingSessionRecord[]>()
  for (const session of completed) {
    const existing = byCategory.get(session.category) ?? []
    existing.push(session)
    byCategory.set(session.category, existing)
  }

  const strongCategories: PassageCategory[] = []
  const weakCategories: PassageCategory[] = []
  const recentlyPracticed: PassageCategory[] = []
  const needsRevision: PassageCategory[] = []

  for (const [category, categorySessions] of byCategory) {
    const avgAccuracy = categorySessions.reduce((sum, s) => sum + s.accuracyPercent, 0) / categorySessions.length
    if (avgAccuracy >= STRONG_ACCURACY_THRESHOLD) strongCategories.push(category)
    if (avgAccuracy < WEAK_ACCURACY_THRESHOLD) weakCategories.push(category)

    const mostRecentDays = Math.min(...categorySessions.map((s) => daysSince(s.occurredAt, referenceMs)))
    if (mostRecentDays <= RECENT_DAYS) recentlyPracticed.push(category)
    if (mostRecentDays > REVISION_STALE_DAYS) needsRevision.push(category)
  }

  const neverPracticed = ALL_CATEGORIES.find((category) => !byCategory.has(category))
  const suggestedNextCategory = neverPracticed ?? weakCategories[0] ?? needsRevision[0] ?? null

  return { strongCategories, weakCategories, recentlyPracticed, needsRevision, suggestedNextCategory }
}

// Per-category rollup for the analytics view — only categories with at
// least one completed session appear.
export function computeCategoryPerformance(sessions: readonly ReadingSessionRecord[]): readonly CategoryPerformance[] {
  const completed = sessions.filter((s) => s.completed)
  const byCategory = new Map<PassageCategory, ReadingSessionRecord[]>()
  for (const session of completed) {
    const existing = byCategory.get(session.category) ?? []
    existing.push(session)
    byCategory.set(session.category, existing)
  }

  return Array.from(byCategory.entries()).map(([category, categorySessions]) => {
    const averageAccuracy = Math.round(categorySessions.reduce((sum, s) => sum + s.accuracyPercent, 0) / categorySessions.length)
    const mostRecent = categorySessions.reduce((latest, s) => (new Date(s.occurredAt) > new Date(latest.occurredAt) ? s : latest))
    return {
      category,
      sessionCount: categorySessions.length,
      averageAccuracy,
      lastPracticedDateKey: mostRecent.occurredAt.slice(0, 10),
    }
  })
}
