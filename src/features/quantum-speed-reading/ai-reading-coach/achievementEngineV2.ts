// Unlock-checking for the Sprint-5 achievement catalog. Each achievement
// here needs a different real signal (cumulative words, DNA trait match,
// reading mode, rolling comprehension average) so — unlike Sprint-4's
// single-metric-per-achievement design — this is a small set of named
// checks rather than one generic comparison, but every check is still a
// real computation over real data, never fabricated.

import { ACHIEVEMENT_CATALOG_V2, type AchievementV2Definition } from './achievementCatalogV2'
import type { ReadingSessionRecord, ReadingDnaTrait } from '../adaptive-intelligence/readingIntelligenceTypes'

export type UnlockedAchievementV2 = AchievementV2Definition & { unlocked: boolean; progressToward: number }

const COMPREHENSION_MASTER_WINDOW = 5
const COMPREHENSION_MASTER_BAR = 95
const BALANCED_READER_CONFIDENCE_BAR = 50
const WORDS_TARGET = 1000
const STREAK_TARGET = 3

function estimateWordsRead(session: ReadingSessionRecord): number {
  return Math.round((session.wpm * session.readingTimeMs) / 60_000)
}

export function computeUnlockedAchievementsV2(
  sessions: readonly ReadingSessionRecord[],
  dnaTraits: readonly ReadingDnaTrait[],
  longestStreak: number,
): readonly UnlockedAchievementV2[] {
  const completed = sessions.filter((s) => s.completed)

  const totalWordsRead = completed.reduce((sum, s) => sum + estimateWordsRead(s), 0)

  const recentComprehension = completed.slice(0, COMPREHENSION_MASTER_WINDOW).map((s) => s.comprehensionPercent)
  const avgRecentComprehension = recentComprehension.length > 0
    ? recentComprehension.reduce((sum, v) => sum + v, 0) / recentComprehension.length
    : 0

  const isBalancedReader = dnaTraits.some(
    (trait) => (trait.label === 'Balanced Reader' || trait.label === 'Balanced Strategy') && trait.confidence >= BALANCED_READER_CONFIDENCE_BAR,
  )

  const isSpeedExplorer = completed.some((s) => s.mode === 'speed' || s.mode === 'quantum')

  const progressAndUnlocked: Record<AchievementV2Definition['id'], { unlocked: boolean; progressToward: number }> = {
    'words-1000': { unlocked: totalWordsRead >= WORDS_TARGET, progressToward: Math.min(1, totalWordsRead / WORDS_TARGET) },
    'streak-3': { unlocked: longestStreak >= STREAK_TARGET, progressToward: Math.min(1, longestStreak / STREAK_TARGET) },
    'comprehension-master': {
      unlocked: recentComprehension.length >= COMPREHENSION_MASTER_WINDOW && avgRecentComprehension >= COMPREHENSION_MASTER_BAR,
      progressToward: recentComprehension.length >= COMPREHENSION_MASTER_WINDOW ? Math.min(1, avgRecentComprehension / COMPREHENSION_MASTER_BAR) : recentComprehension.length / COMPREHENSION_MASTER_WINDOW,
    },
    'balanced-reader': { unlocked: isBalancedReader, progressToward: isBalancedReader ? 1 : 0 },
    'speed-explorer': { unlocked: isSpeedExplorer, progressToward: isSpeedExplorer ? 1 : 0 },
  }

  return ACHIEVEMENT_CATALOG_V2.map((definition) => ({ ...definition, ...progressAndUnlocked[definition.id] }))
}
