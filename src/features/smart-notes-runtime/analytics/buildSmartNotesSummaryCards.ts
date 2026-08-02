import type { SmartNotesLearningProfile } from '../intelligence'
import type { SmartNotesConsistencyMetrics } from './types/SmartNotesConsistencyMetrics'
import type { SmartNotesEngagementDistribution } from './types/SmartNotesEngagementLevel'
import type { SmartNotesSummaryCardData } from './types/SmartNotesSummaryCardData'

// Smart Notes™ Sprint-4 — Analytics & Insights™. Summary Cards. Pure —
// real, already-computed figures, structured for display, never
// formatted here. Mirrors Memory Mode™'s own `buildAdaptiveSummaryCards`
// (Sprint-4), with one real addition: `documentsWithNotes` (Sprint-3's
// own real, structural fact) as a fifth card, since Smart Notes has no
// equivalent in Memory Mode.
export function buildSmartNotesSummaryCards(profile: SmartNotesLearningProfile, consistency: SmartNotesConsistencyMetrics, engagementDistribution: SmartNotesEngagementDistribution): readonly SmartNotesSummaryCardData[] {
  return [
    { id: 'sessions-completed', label: 'Sessions Completed', value: profile.sessionsCompleted, unit: 'count' },
    { id: 'average-engagement', label: 'Average Engagement', value: Math.round(profile.averageEngagementScore * 100), unit: 'percentage' },
    { id: 'current-streak', label: 'Current Streak', value: consistency.currentStreakDays, unit: 'days' },
    { id: 'strong-sessions', label: 'Strongly Engaged Sessions', value: engagementDistribution.strong, unit: 'count' },
    { id: 'documents-with-notes', label: 'Documents With Notes', value: profile.documentsWithNotes, unit: 'count' },
  ]
}
