// Achievement architecture — Sprint 4. Fixed catalog; unlock checking is
// entirely data-driven against real profile/personal-best metrics (see
// achievementEngine.ts) — no per-achievement special-casing.

import type { AchievementDefinition } from './readingIntelligenceTypes'

export const ACHIEVEMENT_CATALOG: readonly AchievementDefinition[] = [
  // Sessions
  { id: 'sessions-1', category: 'sessions', metric: 'sessionsCompleted', threshold: 1, title: 'First Session', description: 'Complete your first reading session.' },
  { id: 'sessions-5', category: 'sessions', metric: 'sessionsCompleted', threshold: 5, title: '5 Sessions', description: 'Complete 5 reading sessions.' },
  { id: 'sessions-10', category: 'sessions', metric: 'sessionsCompleted', threshold: 10, title: '10 Sessions', description: 'Complete 10 reading sessions.' },
  { id: 'sessions-25', category: 'sessions', metric: 'sessionsCompleted', threshold: 25, title: '25 Sessions', description: 'Complete 25 reading sessions.' },
  { id: 'sessions-100', category: 'sessions', metric: 'sessionsCompleted', threshold: 100, title: '100 Sessions', description: 'Complete 100 reading sessions.' },

  // Accuracy / comprehension
  { id: 'accuracy-90', category: 'accuracy', metric: 'bestAccuracy', threshold: 90, title: '90% Accuracy', description: 'Score 90% accuracy in a single session.' },
  { id: 'accuracy-95', category: 'accuracy', metric: 'bestAccuracy', threshold: 95, title: '95% Accuracy', description: 'Score 95% accuracy in a single session.' },
  { id: 'accuracy-100', category: 'accuracy', metric: 'bestAccuracy', threshold: 100, title: '100% Accuracy', description: 'Score perfect accuracy in a single session.' },
  { id: 'perfect-comprehension', category: 'accuracy', metric: 'bestComprehension', threshold: 100, title: 'Perfect Comprehension', description: 'Score 100% comprehension in a single session.' },

  // Speed
  { id: 'wpm-250', category: 'speed', metric: 'highestWpm', threshold: 250, title: '250 WPM', description: 'Reach 250 words per minute.' },
  { id: 'wpm-300', category: 'speed', metric: 'highestWpm', threshold: 300, title: '300 WPM', description: 'Reach 300 words per minute.' },
  { id: 'wpm-400', category: 'speed', metric: 'highestWpm', threshold: 400, title: '400 WPM', description: 'Reach 400 words per minute.' },
  { id: 'wpm-500', category: 'speed', metric: 'highestWpm', threshold: 500, title: '500 WPM', description: 'Reach 500 words per minute.' },
  { id: 'wpm-600', category: 'speed', metric: 'highestWpm', threshold: 600, title: '600 WPM', description: 'Reach 600 words per minute.' },

  // Streak
  { id: 'streak-7', category: 'streak', metric: 'longestStreak', threshold: 7, title: '7-Day Streak', description: 'Read 7 days in a row.' },
  { id: 'streak-30', category: 'streak', metric: 'longestStreak', threshold: 30, title: '30-Day Streak', description: 'Read 30 days in a row.' },
  { id: 'streak-100', category: 'streak', metric: 'longestStreak', threshold: 100, title: '100-Day Streak', description: 'Read 100 days in a row.' },
]
