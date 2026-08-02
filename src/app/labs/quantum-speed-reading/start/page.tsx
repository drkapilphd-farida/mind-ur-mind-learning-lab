import type { Metadata } from 'next'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { getContinueLearningSummary } from '@/lib/exercises/continueLearning'
import { computeDailyStreak, computeTodaysProgress } from '@/lib/exercises/practiceHistory'
import { computeReadingScore, computeMindScore, getMindScoreLabel } from '@/lib/exercises/mindScore'
import { getTodaysGoal } from '@/lib/exercises/dashboardInsights'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'
import { QuantumReadingLanding } from '@/features/quantum-speed-reading/components/QuantumReadingLanding'

export const metadata: Metadata = {
  title: 'Quantum Speed Reading™',
  description: 'Train your mind to read faster, understand deeper, and remember longer.',
}

// Screen 1 — Sprint 1 of the Quantum Speed Reading™ session setup flow.
// Every stat here is real, reused, unmodified data: getModuleProgress /
// getPracticeSessions / getContinueLearningSummary / computeDailyStreak /
// computeReadingScore + computeMindScore (the same 0-1000 scale
// NextEvolutionCard already uses) / getTodaysGoal — nothing new computed,
// nothing fabricated for fields with no real data yet (see
// QuantumReadingLanding's disclosed placeholder state for Session
// Time/Target WPM/Comprehension, which only become real once a passage is
// chosen on the next screens).
export default async function QuantumSpeedReadingStartPage(): Promise<React.JSX.Element> {
  const exerciseIds = READING_EXPANSION_MODULE.map((item) => item.exerciseId)

  const [progress, sessions] = await Promise.all([
    getModuleProgress('quantum-speed-reading', exerciseIds),
    getPracticeSessions('quantum-speed-reading'),
  ])

  const summary = getContinueLearningSummary(progress, READING_EXPANSION_MODULE)
  const streak = computeDailyStreak(sessions)
  const todaysProgress = computeTodaysProgress(sessions)

  const completionPercent = progress.totalCount > 0
    ? Math.round((progress.completedCount / progress.totalCount) * 100)
    : 0
  const readingScore = computeReadingScore(completionPercent, streak.currentStreak)
  const mindScore = computeMindScore([readingScore])
  const mindScoreLabel = getMindScoreLabel(mindScore).label
  const todaysGoal = getTodaysGoal(progress, streak, todaysProgress, summary.currentExercise)
  const ctaLabel = summary.completedCount > 0 ? 'Continue Reading' : 'Start Reading'

  return (
    <QuantumReadingLanding
      mindScore={mindScore}
      mindScoreLabel={mindScoreLabel}
      currentStreak={streak.currentStreak}
      ctaLabel={ctaLabel}
      ctaHref="/labs/quantum-speed-reading/start/mode"
      todaysGoal={todaysGoal}
    />
  )
}
