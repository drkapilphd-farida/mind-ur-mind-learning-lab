import type { Metadata } from 'next'
import Link from 'next/link'
import { getReadingIntelligenceSessions, getSelectedReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { computeReadingDna } from '@/features/quantum-speed-reading/adaptive-intelligence/readingDnaEngine'
import { computePersonalBests } from '@/features/quantum-speed-reading/adaptive-intelligence/personalBestsEngine'
import { computeCategoryIntelligence } from '@/features/quantum-speed-reading/adaptive-intelligence/categoryIntelligenceEngine'
import { suggestNextDifficulty } from '@/features/quantum-speed-reading/adaptive-intelligence/difficultyEngine'
import {
  generateTodaysInsight,
  generateSpeedCaution,
  generateCategoryRotationMessage,
  generateTodaysFocus,
  generateGoalRecommendation,
} from '@/features/quantum-speed-reading/adaptive-intelligence/recommendationEngine'
import { computeGoalProgress } from '@/features/quantum-speed-reading/adaptive-intelligence/goalProgressEngine'
import { getReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/goalCatalog'
import { ReadingProfileStats } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingProfileStats'
import { StreakCard } from '@/features/quantum-speed-reading/components/adaptive-intelligence/StreakCard'
import { ReadingDnaCard } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingDnaCard'
import { PersonalBestsGrid } from '@/features/quantum-speed-reading/components/adaptive-intelligence/PersonalBestsGrid'
import { AiCoachPanel } from '@/features/quantum-speed-reading/components/adaptive-intelligence/AiCoachPanel'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Reading Intelligence — Quantum Speed Reading™',
}

const CORE_READING_JOURNEY_EXERCISE_IDS = READING_EXPANSION_MODULE.map((exercise) => exercise.exerciseId)

// Sprint 4 — Adaptive Intelligence Engine™ hub. Everything here is derived
// from real reading_intelligence_sessions rows (see the one recording
// hook in ComprehensionQuizExperience.tsx) — nothing is fabricated.
export default async function ReadingIntelligencePage(): Promise<React.JSX.Element> {
  // Sprint-12: Reading Intelligence™ (Stage 5) is this journey's final
  // stage — its entry point requires Core Reading Journey™ (Stage 4) to be
  // fully complete first. Its other 10 pages (analytics/history/etc.) stay
  // exactly as open as before — only this entry gate is new.
  const coreReadingJourneyProgress = await getModuleProgress('quantum-speed-reading', CORE_READING_JOURNEY_EXERCISE_IDS)
  const isCoreReadingJourneyComplete =
    coreReadingJourneyProgress.totalCount > 0 && coreReadingJourneyProgress.completedCount === coreReadingJourneyProgress.totalCount

  if (!isCoreReadingJourneyComplete) {
    return (
      <ExerciseLockedScreen
        title="Reading Intelligence™"
        unlockHref="/labs/quantum-speed-reading/progressive-chunk-reading"
        unlockLabel="Go to Core Reading Journey™"
      />
    )
  }

  const [sessions, selectedGoalId] = await Promise.all([getReadingIntelligenceSessions(), getSelectedReadingGoal()])

  const profile = computeReadingProfile(sessions)
  const dnaTraits = computeReadingDna(sessions)
  const previousDnaTraits = computeReadingDna(sessions.slice(1))
  const bests = computePersonalBests(sessions)
  const categoryIntelligence = computeCategoryIntelligence(sessions)

  const completedSessions = sessions.filter((s) => s.completed)
  const latest = completedSessions[0] ?? null
  const previous = completedSessions[1] ?? null
  const goal = selectedGoalId ? getReadingGoal(selectedGoalId) : null

  const todaysInsight = latest
    ? generateTodaysInsight(latest, previous)
    : 'Complete your first reading session to unlock your AI Coach™ insights.'
  const speedCaution = latest ? generateSpeedCaution(latest) : null
  const difficultySuggestion = latest ? suggestNextDifficulty(latest, previous) : null
  const categoryRotation = generateCategoryRotationMessage(categoryIntelligence)
  const goalRecommendation = generateGoalRecommendation(selectedGoalId)
  const coachRecommendation = speedCaution ?? difficultySuggestion?.message ?? categoryRotation ?? goalRecommendation ?? 'Complete a reading session to get your first coaching recommendation.'
  const todaysFocus = latest ? generateTodaysFocus(latest) : 'Complete a reading session to set today\'s focus.'

  // Reading DNA Update — the dimension whose confidence changed most
  // between the full history and history-minus-latest-session, a real
  // diff derived purely from source data (no stored snapshot needed).
  let dnaUpdate = null
  if (latest) {
    let biggestDelta = 0
    for (let i = 0; i < dnaTraits.length; i++) {
      const delta = Math.abs(dnaTraits[i]!.confidence - (previousDnaTraits[i]?.confidence ?? 0))
      if (delta > biggestDelta) {
        biggestDelta = delta
        dnaUpdate = {
          label: dnaTraits[i]!.label,
          previousConfidence: previousDnaTraits[i]?.confidence ?? 0,
          currentConfidence: dnaTraits[i]!.confidence,
        }
      }
    }
  }

  const goalProgress = goal
    ? { goalTitle: goal.title, percent: computeGoalProgress(goal.id, profile, sessions) }
    : null

  return (
    <div>
      <LabNavHeader currentSection="Reading DNA" />
      <div className="mx-auto max-w-3xl px-6 py-16">
      <LabPageHeader
        eyebrow="Adaptive Intelligence Engine™"
        title="Reading Intelligence"
        subtitle="Your Reading Profile, Reading DNA™, and coaching — built entirely from your own practice history."
      />

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/labs/quantum-speed-reading/intelligence/goals" className="text-primary underline-offset-4 hover:underline">Goals</Link>
        <Link href="/labs/quantum-speed-reading/intelligence/history" className="text-primary underline-offset-4 hover:underline">History</Link>
        <Link href="/labs/quantum-speed-reading/intelligence/achievements" className="text-primary underline-offset-4 hover:underline">Achievements</Link>
        <Link href="/labs/quantum-speed-reading/intelligence/analytics" className="text-primary underline-offset-4 hover:underline">Analytics</Link>
      </div>

      <div className="mt-10 space-y-6">
        <ReadingProfileStats profile={profile} />
        <StreakCard currentStreak={profile.currentStreak} longestStreak={profile.longestStreak} lastReadingDate={profile.lastReadingDate} />
        <AiCoachPanel
          todaysInsight={todaysInsight}
          coachRecommendation={coachRecommendation}
          todaysFocus={todaysFocus}
          dnaUpdate={dnaUpdate}
          goalProgress={goalProgress}
        />
        <ReadingDnaCard traits={dnaTraits} />
        <div>
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Personal Bests</p>
          <PersonalBestsGrid bests={bests} />
        </div>
      </div>
      </div>
    </div>
  )
}
