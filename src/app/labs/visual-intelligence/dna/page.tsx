import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { generateVisualDnaCoachMessage } from '@/lib/ai/generateVisualDnaCoachMessage'
import { computeNeuralEvolutionIndex, type NeuralEvolutionDimension } from '@/features/neural-evolution/neuralEvolutionIndex'
import { getImagePersistenceSessionsFull } from '@/features/visual-intelligence/adaptive/queries/getImagePersistenceSessionsFull'
import { getVisualPreparationSessions } from '@/features/visual-intelligence/adaptive/queries/getVisualPreparationSessions'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getPersistenceChallengeSessions } from '@/features/visual-intelligence/persistence-challenge/queries/getPersistenceChallengeSessions'
import { buildDnaContext } from '@/features/visual-intelligence/dna/dnaContext'
import { computeVisualIdentity } from '@/features/visual-intelligence/dna/visualIdentityEngine'
import { computeGrowthOpportunities, computeStrengthAnalysis } from '@/features/visual-intelligence/dna/strengthAnalysisEngine'
import { computeEvolutionTimeline } from '@/features/visual-intelligence/dna/evolutionTimelineEngine'
import { computeRadarAxes } from '@/features/visual-intelligence/dna/radarEngine'
import { computeDnaLevel, DNA_LEVEL_NAME } from '@/features/visual-intelligence/dna/dnaLevelEngine'
import { computeTodaysBestMission } from '@/features/visual-intelligence/dna/todaysBestMissionEngine'
import { computeDnaAchievements } from '@/features/visual-intelligence/dna/dnaAchievementEngine'
import { computeEvolutionNotes } from '@/features/visual-intelligence/dna/evolutionNotesEngine'
import { buildMindPassportSnapshot } from '@/features/visual-intelligence/dna/mindPassport'
import { saveMindPassportSnapshot } from '@/features/visual-intelligence/dna/actions/saveMindPassportSnapshot'
import { VisualDnaExperience } from '@/features/visual-intelligence/components/dna/VisualDnaExperience'

export const metadata: Metadata = {
  title: 'Visual DNA™ — Visual Intelligence Lab™',
}

export default async function VisualDnaPage(): Promise<React.JSX.Element> {
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
  const evolutionStages = computeEvolutionTimeline(context)
  const radarAxes = computeRadarAxes(context, strengths)
  const dnaLevel = computeDnaLevel(context.unifiedStats)
  const dnaLevelName = DNA_LEVEL_NAME[dnaLevel]
  const mission = computeTodaysBestMission(context, growthOpportunities)
  const achievements = computeDnaAchievements(context)
  const evolutionNotes = computeEvolutionNotes(context)

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

  const topStrength = [...strengths].filter((s) => s.score !== null).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null

  const coachSummary = await generateVisualDnaCoachMessage({
    studentName,
    observationStyle: identity.observationStyle,
    focusStyle: identity.focusStyle,
    topStrengthLabel: topStrength?.label ?? null,
    topGrowthOpportunityLabel: growthOpportunities[0]?.label ?? null,
    visualIntelligenceScore: context.scoreProgress.currentScore,
    growthPercent: context.scoreProgress.growthPercent,
  })

  const achievementCount = achievements.filter((a) => a.unlocked).length
  const passportSnapshot = buildMindPassportSnapshot({
    visualDnaLevel: dnaLevelName,
    visualIntelligenceScore: context.scoreProgress.currentScore,
    identity,
    growthPercent: context.scoreProgress.growthPercent,
    achievementCount,
    latestAiSummary: coachSummary,
  })
  await saveMindPassportSnapshot(passportSnapshot)

  return (
    <VisualDnaExperience
      scoreProgress={context.scoreProgress}
      identity={identity}
      strengths={strengths}
      growthOpportunities={growthOpportunities}
      coachSummary={coachSummary}
      evolutionStages={evolutionStages}
      radarAxes={radarAxes}
      dnaLevel={dnaLevel}
      dnaLevelName={dnaLevelName}
      mission={mission}
      achievements={achievements}
      evolutionNotes={evolutionNotes}
      neuralEvolutionResult={neuralEvolutionResult}
    />
  )
}
