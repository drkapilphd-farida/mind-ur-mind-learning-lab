import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { generateAdaptiveCoachMessage } from '@/lib/ai/generateAdaptiveCoachMessage'
import { computeNeuralEvolutionIndex, type NeuralEvolutionDimension } from '@/features/neural-evolution/neuralEvolutionIndex'
import { getImagePersistenceSessionsFull } from '@/features/visual-intelligence/adaptive/queries/getImagePersistenceSessionsFull'
import { getVisualPreparationSessions } from '@/features/visual-intelligence/adaptive/queries/getVisualPreparationSessions'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getPersistenceChallengeSessions } from '@/features/visual-intelligence/persistence-challenge/queries/getPersistenceChallengeSessions'
import { computeAchievements } from '@/features/visual-intelligence/adaptive/achievementEngine'
import { buildDnaContext } from '@/features/visual-intelligence/dna/dnaContext'
import { computeVisualIdentity } from '@/features/visual-intelligence/dna/visualIdentityEngine'
import { computeGrowthOpportunities, computeStrengthAnalysis } from '@/features/visual-intelligence/dna/strengthAnalysisEngine'
import { computeRadarAxes } from '@/features/visual-intelligence/dna/radarEngine'
import { computeDnaLevel, DNA_LEVEL_NAME } from '@/features/visual-intelligence/dna/dnaLevelEngine'
import { computeDnaAchievements } from '@/features/visual-intelligence/dna/dnaAchievementEngine'
import { getMindPassportSnapshot } from '@/features/visual-intelligence/dna/queries/getMindPassportSnapshot'
import { computeDashboardMission } from '@/features/visual-intelligence/dashboard/todaysMissionEngine'
import { computeJourneyProgress } from '@/features/visual-intelligence/dashboard/journeyProgressEngine'
import { computeWeeklyProgress } from '@/features/visual-intelligence/dashboard/weeklyProgressEngine'
import { computeTrainingCalendar } from '@/features/visual-intelligence/dashboard/trainingCalendarEngine'
import { computeExerciseAnalytics } from '@/features/visual-intelligence/dashboard/exerciseAnalyticsEngine'
import { computeRecentActivity } from '@/features/visual-intelligence/dashboard/recentActivityEngine'
import { computeDashboardStats } from '@/features/visual-intelligence/dashboard/dashboardStatsEngine'
import { DashboardExperience } from '@/features/visual-intelligence/components/dashboard/DashboardExperience'

export const metadata: Metadata = {
  title: 'Visual Intelligence Dashboard™ — Visual Intelligence Lab™',
}

export default async function VisualIntelligenceDashboardPage(): Promise<React.JSX.Element> {
  const [imagePersistence, visualPreparation, fixation, persistenceChallenge] = await Promise.all([
    getImagePersistenceSessionsFull(),
    getVisualPreparationSessions(),
    getFixationSessions(),
    getPersistenceChallengeSessions(),
  ])

  const context = buildDnaContext({ imagePersistence, visualPreparation, fixation, persistenceChallenge })

  const identity = computeVisualIdentity(context)
  const strengths = computeStrengthAnalysis(context)
  const growthOpportunities = computeGrowthOpportunities(strengths)
  const radarAxes = computeRadarAxes(context, strengths)
  const dnaLevel = computeDnaLevel(context.unifiedStats)
  const dnaLevelName = DNA_LEVEL_NAME[dnaLevel]
  const mission = computeDashboardMission(context, growthOpportunities)
  const mindPassportSnapshot = await getMindPassportSnapshot()
  const journeyStages = computeJourneyProgress(context, mindPassportSnapshot !== null)
  const weeklyDays = computeWeeklyProgress(context)
  const calendarDays = computeTrainingCalendar(context)
  const exerciseAnalytics = computeExerciseAnalytics(context, strengths)
  const recentActivity = computeRecentActivity(context)
  const adaptiveAchievements = computeAchievements(context.unifiedStats)
  const dnaAchievements = computeDnaAchievements(context)
  const stats = computeDashboardStats(context, dnaLevelName)

  const findAxis = (id: (typeof radarAxes)[number]['id']): number | null => radarAxes.find((axis) => axis.id === id)?.value ?? null
  const ringsData = {
    visualIntelligence: Math.round(context.scoreProgress.currentScore / 10),
    focus: findAxis('focus') ?? 0,
    observation: findAxis('observation'),
    peripheralVision: findAxis('peripheral-vision'),
    persistence: findAxis('persistence'),
    accuracy: findAxis('accuracy'),
    adaptiveIntelligence: Math.round(context.adaptiveResult.performance.visualReadiness),
  }

  const neuralEvolutionDimensions: NeuralEvolutionDimension[] = [
    { id: 'visual-intelligence', label: 'Visual Intelligence', status: 'active', score: Math.round(context.scoreProgress.currentScore / 10) },
    { id: 'brain-adaptation', label: 'Brain Adaptation', status: 'coming-soon', score: null },
    { id: 'attention-stability', label: 'Attention Stability', status: 'coming-soon', score: null },
    { id: 'learning-readiness', label: 'Learning Readiness', status: 'coming-soon', score: null },
    { id: 'cognitive-flexibility', label: 'Cognitive Flexibility', status: 'coming-soon', score: null },
  ]
  const neuralEvolutionResult = computeNeuralEvolutionIndex(neuralEvolutionDimensions)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = user ? await getCurrentUserProfile(user.id) : null
  const studentName = profile?.fullName ?? 'there'

  const coachMessage = await generateAdaptiveCoachMessage({
    studentName,
    difficultyLevelName: context.adaptiveResult.difficultyLevelName,
    completedSessionCount: context.unifiedStats.completedSessionCount,
    currentStreak: context.unifiedStats.currentStreak,
    visualReadiness: context.adaptiveResult.performance.visualReadiness,
    observationJournalUsageRate: context.unifiedStats.observationJournalUsageRate,
    recommendedGoal: context.adaptiveResult.recommendation.suggestedGoal,
    recommendedChallenge: context.adaptiveResult.recommendation.recommendedChallenge,
  })

  const achievementCountFallback = dnaAchievements.filter((a) => a.unlocked).length
  const shareSummaryText = `My Visual Intelligence Score is ${context.scoreProgress.currentScore}/1000 at ${dnaLevelName} level, with a ${context.unifiedStats.currentStreak}-day streak. — Mind Ur Mind Learning Lab™`

  return (
    <DashboardExperience
      studentName={studentName}
      currentStreak={context.unifiedStats.currentStreak}
      dnaLevelName={dnaLevelName}
      identity={identity}
      growthPercent={context.scoreProgress.growthPercent}
      neuralEvolutionResult={neuralEvolutionResult}
      mission={mission}
      ringsData={ringsData}
      journeyStages={journeyStages}
      coachMessage={coachMessage}
      weeklyDays={weeklyDays}
      calendarDays={calendarDays}
      adaptiveAchievements={adaptiveAchievements}
      dnaAchievements={dnaAchievements}
      stats={stats}
      exerciseAnalytics={exerciseAnalytics}
      recentActivity={recentActivity}
      mindPassportSnapshot={mindPassportSnapshot}
      achievementCount={achievementCountFallback}
      shareSummaryText={shareSummaryText}
    />
  )
}
