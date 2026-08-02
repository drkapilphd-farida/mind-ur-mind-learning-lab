import { createClient } from '@/lib/supabase/server'
import type { PassageCategory } from '../passageLibrary'
import type { PassageDifficulty } from '../passageDifficulty'
import type { ReadingSessionRecord, ReadingGoalId } from './readingIntelligenceTypes'

// Raw session history for the signed-in user, most recent first. No user
// means no history yet — same convention as getPracticeSessions/
// getModuleProgress. Never touches practice_sessions/exercise_progress.
export async function getReadingIntelligenceSessions(limit = 1000): Promise<ReadingSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: rows } = await supabase
    .from('reading_intelligence_sessions')
    .select('id, passage_id, category, difficulty, mode, wpm, reading_time_ms, comprehension_percent, accuracy_percent, reading_intelligence_score, focus_mode, hints_used, completed, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (!rows) return []

  return rows.map((row) => ({
    id: row.id,
    passageId: row.passage_id,
    category: row.category as PassageCategory,
    difficulty: row.difficulty as PassageDifficulty,
    mode: row.mode,
    wpm: row.wpm,
    readingTimeMs: row.reading_time_ms,
    comprehensionPercent: row.comprehension_percent,
    accuracyPercent: row.accuracy_percent,
    readingIntelligenceScore: row.reading_intelligence_score,
    focusMode: row.focus_mode,
    hintsUsed: row.hints_used,
    completed: row.completed,
    occurredAt: row.occurred_at,
  }))
}

// The learner's currently selected reading goal, or null if none chosen yet.
export async function getSelectedReadingGoal(): Promise<ReadingGoalId | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('selected_reading_goal')
    .eq('id', user.id)
    .maybeSingle()

  return (data?.selected_reading_goal as ReadingGoalId | null) ?? null
}
