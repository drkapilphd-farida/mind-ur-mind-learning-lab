import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { generateAdaptiveCoachMessage } from '@/lib/ai/generateAdaptiveCoachMessage'
import { AdaptiveVisualIntelligenceExperience } from '@/features/visual-intelligence/components/adaptive/AdaptiveVisualIntelligenceExperience'
import { getUnifiedVisualStats } from '@/features/visual-intelligence/adaptive/queries/getUnifiedVisualStats'
import { runAdaptiveEngine } from '@/features/visual-intelligence/adaptive/adaptiveEngine'

export const metadata: Metadata = {
  title: 'Visual Adaptation Engine™ — Visual Intelligence Lab™',
}

export default async function AdaptiveVisualIntelligencePage(): Promise<React.JSX.Element> {
  const stats = await getUnifiedVisualStats()
  const engineResult = runAdaptiveEngine(stats)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = user ? await getCurrentUserProfile(user.id) : null

  const coachMessage = await generateAdaptiveCoachMessage({
    studentName: profile?.fullName ?? 'there',
    difficultyLevelName: engineResult.difficultyLevelName,
    completedSessionCount: stats.completedSessionCount,
    currentStreak: stats.currentStreak,
    visualReadiness: engineResult.performance.visualReadiness,
    observationJournalUsageRate: stats.observationJournalUsageRate,
    recommendedGoal: engineResult.recommendation.suggestedGoal,
    recommendedChallenge: engineResult.recommendation.recommendedChallenge,
  })

  return <AdaptiveVisualIntelligenceExperience engineResult={engineResult} coachMessage={coachMessage} />
}
