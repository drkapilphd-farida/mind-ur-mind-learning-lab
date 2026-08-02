// AI Reading Coach™ — Sprint 5, Part 7. A separate, additive achievement
// catalog. Sprint-4's achievementCatalog.ts (First Session, 5/10/25/100
// Sessions, 90/95/100% Accuracy, Perfect Comprehension, 250-600 WPM,
// 7/30/100-Day Streak) is never edited — these are new, distinct
// milestones, merged with Sprint-4's list only at render time.

export type AchievementV2Id = 'words-1000' | 'streak-3' | 'comprehension-master' | 'balanced-reader' | 'speed-explorer'

export type AchievementV2Definition = {
  id: AchievementV2Id
  title: string
  description: string
}

export const ACHIEVEMENT_CATALOG_V2: readonly AchievementV2Definition[] = [
  { id: 'words-1000', title: '1000 Words Read', description: 'Read a cumulative 1,000 words across your sessions.' },
  { id: 'streak-3', title: '3-Day Streak', description: 'Read 3 days in a row.' },
  { id: 'comprehension-master', title: 'Comprehension Master', description: 'Average 95%+ comprehension across your last 5 sessions.' },
  { id: 'balanced-reader', title: 'Balanced Reader', description: 'Develop a confident Balanced Reader profile.' },
  { id: 'speed-explorer', title: 'Speed Explorer', description: 'Complete a session in Speed or Quantum reading mode.' },
]
