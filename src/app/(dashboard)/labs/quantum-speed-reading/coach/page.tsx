import type { Metadata } from 'next'
import Link from 'next/link'
import { getReadingIntelligenceSessions, getSelectedReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { computeReadingDna } from '@/features/quantum-speed-reading/adaptive-intelligence/readingDnaEngine'
import { computeCategoryIntelligence } from '@/features/quantum-speed-reading/adaptive-intelligence/categoryIntelligenceEngine'
import { computePersonalBests } from '@/features/quantum-speed-reading/adaptive-intelligence/personalBestsEngine'
import { computeUnlockedAchievements } from '@/features/quantum-speed-reading/adaptive-intelligence/achievementEngine'
import { computeGoalProgress } from '@/features/quantum-speed-reading/adaptive-intelligence/goalProgressEngine'
import { getReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/goalCatalog'
import { StreakCard } from '@/features/quantum-speed-reading/components/adaptive-intelligence/StreakCard'
import { AchievementsGrid } from '@/features/quantum-speed-reading/components/adaptive-intelligence/AchievementsGrid'
import { ReadingHistoryTable } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingHistoryTable'
import { computeDnaEvolution } from '@/features/quantum-speed-reading/ai-reading-coach/dnaEvolutionEngine'
import { generateWeeklyInsight } from '@/features/quantum-speed-reading/ai-reading-coach/weeklyInsightEngine'
import { generateMonthlyInsight } from '@/features/quantum-speed-reading/ai-reading-coach/monthlyInsightEngine'
import { generateDailyPlan } from '@/features/quantum-speed-reading/ai-reading-coach/dailyPlanEngine'
import { recommendNextSession } from '@/features/quantum-speed-reading/ai-reading-coach/nextSessionRecommendationEngine'
import { detectStrengths } from '@/features/quantum-speed-reading/ai-reading-coach/strengthDetectorEngine'
import { detectWeaknesses } from '@/features/quantum-speed-reading/ai-reading-coach/weaknessDetectorEngine'
import { generateAiMentorObservation } from '@/features/quantum-speed-reading/ai-reading-coach/aiMentorEngine'
import { computeUnlockedAchievementsV2 } from '@/features/quantum-speed-reading/ai-reading-coach/achievementEngineV2'
import { ReadingDnaEvolutionCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/ReadingDnaEvolutionCard'
import { WeeklyInsightCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/WeeklyInsightCard'
import { MonthlyInsightCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/MonthlyInsightCard'
import { DailyPlanCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/DailyPlanCard'
import { NextSessionRecommendationCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/NextSessionRecommendationCard'
import { AiMentorCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/AiMentorCard'
import { AchievementCardV2 } from '@/features/quantum-speed-reading/components/ai-reading-coach/AchievementCardV2'
import { TodaysGoalCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/TodaysGoalCard'
import { MindScoreCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/MindScoreCard'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'
import { computeReadingScore, computeMindScore, getMindScoreLabel } from '@/lib/exercises/mindScore'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Reading Intelligence Dashboard™ — Reading Intelligence Lab™',
}

const EYE_FOUNDATION_EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((exercise) => exercise.exerciseId)

// Sprint-6, Part 2 — the final Reading Intelligence Dashboard™: Sprint-5's
// Premium Dashboard (/coach), expanded in place with Today's Goal/Continue
// Reading, Mind Score™, and Monthly Progress. Reuses every existing
// Sprint-4/5 engine unmodified; only two genuinely new pieces of data are
// computed here (Eye Foundation completion for Mind Score, and the new
// additive monthlyInsightEngine.ts) — no AI Coach/DNA logic changed.
export default async function AiReadingCoachDashboardPage(): Promise<React.JSX.Element> {
  const [sessions, selectedGoalId, eyeFoundationProgress] = await Promise.all([
    getReadingIntelligenceSessions(),
    getSelectedReadingGoal(),
    getModuleProgress('quantum-speed-reading', EYE_FOUNDATION_EXERCISE_IDS),
  ])

  const profile = computeReadingProfile(sessions)
  const dnaTraits = computeReadingDna(sessions)
  const categoryIntelligence = computeCategoryIntelligence(sessions)
  const bests = computePersonalBests(sessions)
  const achievements = computeUnlockedAchievements(profile, bests)
  const achievementsV2 = computeUnlockedAchievementsV2(sessions, dnaTraits, profile.longestStreak)
  const goal = selectedGoalId ? getReadingGoal(selectedGoalId) : null
  const goalProgressPercent = goal ? computeGoalProgress(goal.id, profile, sessions) : 0

  const dnaEvolution = computeDnaEvolution(sessions)
  const weeklyInsight = generateWeeklyInsight(sessions)
  const monthlyInsight = generateMonthlyInsight(sessions)

  const eyeFoundationCompletionPercent = eyeFoundationProgress.totalCount > 0
    ? Math.round((eyeFoundationProgress.completedCount / eyeFoundationProgress.totalCount) * 100)
    : 0
  const readingScore = computeReadingScore(eyeFoundationCompletionPercent, profile.currentStreak)
  const mindScore = computeMindScore([readingScore])
  const mindScoreLabel = getMindScoreLabel(mindScore)

  const latest = sessions[0] ?? null
  const previous = sessions[1] ?? null
  const recentWindow = sessions.slice(0, 5)

  const dailyPlan = generateDailyPlan(profile, categoryIntelligence, latest, previous, selectedGoalId)
  const recommendation = recommendNextSession(profile, categoryIntelligence, latest, previous, selectedGoalId)
  const strengths = detectStrengths(dnaTraits, recentWindow)
  const weaknesses = latest ? detectWeaknesses(latest, sessions.slice(1, 6)) : []
  const mentorObservation = latest
    ? generateAiMentorObservation(latest, strengths, weaknesses)
    : 'Complete your first reading session to unlock personalized coaching.'

  const continueExerciseId = eyeFoundationProgress.resumeExerciseId ?? eyeFoundationProgress.nextRecommendedExerciseId
  const continueReadingHref = EYE_FOUNDATION_MODULE.find((e) => e.exerciseId === continueExerciseId)?.href
    ?? '/labs/quantum-speed-reading/start/mode'

  return (
    <div>
      <div className="mx-auto max-w-3xl px-6 py-16">
      <LabPageHeader eyebrow="Reading Intelligence Lab™" title="Reading Intelligence Dashboard™" />

      {/* 3-Pillar Command Center™ (Phase 6) — Pillar 2's own sub-views
          (Reading DNA, History, Achievements, Reports, 30-Day Masterclass,
          Mind Score™) used to live behind a second sticky sub-nav bar
          (LabNavHeader), which conflicted with the global AppSidebar once
          this page moved under it. This is a standard, in-content link
          row instead — plain links, not a header — so those pages stay
          reachable without a second competing nav surface. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        <Link href="/labs/quantum-speed-reading/intelligence" className="font-medium text-primary hover:underline">
          Reading DNA
        </Link>
        <Link href="/labs/quantum-speed-reading/intelligence/history" className="font-medium text-primary hover:underline">
          History
        </Link>
        <Link href="/labs/quantum-speed-reading/intelligence/achievements" className="font-medium text-primary hover:underline">
          Achievements
        </Link>
        <Link href="/labs/quantum-speed-reading/reports" className="font-medium text-primary hover:underline">
          Reports
        </Link>
        <Link href="/labs/quantum-speed-reading/thirty-day-curriculum" className="font-medium text-primary hover:underline">
          30-Day Masterclass
        </Link>
        <Link href="/progress" className="font-medium text-primary hover:underline">
          Mind Score™
        </Link>
      </div>

      <div className="mt-10 space-y-6">
        <TodaysGoalCard goal={goal} goalProgressPercent={goalProgressPercent} continueHref={continueReadingHref} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <MindScoreCard mindScore={mindScore} label={mindScoreLabel.label} description={mindScoreLabel.description} />
          <StreakCard currentStreak={profile.currentStreak} longestStreak={profile.longestStreak} lastReadingDate={profile.lastReadingDate} />
        </div>

        <ReadingDnaEvolutionCard traits={dnaEvolution} />

        <DailyPlanCard plan={dailyPlan} />

        <div>
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Achievements</p>
          <AchievementsGrid achievements={achievements} />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievementsV2.map((achievement) => (
              <AchievementCardV2 key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <WeeklyInsightCard insight={weeklyInsight} />
          <MonthlyInsightCard insight={monthlyInsight} />
        </div>

        <AiMentorCard observation={mentorObservation} />

        {recommendation && <NextSessionRecommendationCard recommendation={recommendation} />}

        <div>
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Session History</p>
          <ReadingHistoryTable sessions={sessions} />
        </div>
      </div>
      </div>
    </div>
  )
}
