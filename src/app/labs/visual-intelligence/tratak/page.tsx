import type { Metadata } from 'next'
import { getVisualPreparationSessions } from '@/features/visual-intelligence/adaptive/queries/getVisualPreparationSessions'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getPersistenceChallengeSessions } from '@/features/visual-intelligence/persistence-challenge/queries/getPersistenceChallengeSessions'
import { getTratakMissionSessions } from '@/features/tratak-intelligence/queries/getTratakMissionSessions'
import { isFoundationJourneyComplete } from '@/features/tratak-intelligence/foundationCompletionCheck'
import { isTratakDevUnlockEnabled } from '@/features/tratak-intelligence/tratakDevUnlock'
import {
  computeTratakJourneyProgressPercent,
  computeTratakLevel,
  computeTratakMissionProgress,
  computeTratakXp,
} from '@/features/tratak-intelligence/tratakMissionEngine'
import { computeTratakStreak } from '@/features/tratak-intelligence/tratakStreak'
import { computeTratakPersistenceScore } from '@/features/tratak-intelligence/tratakPersistenceScore'
import { TratakJourneyLocked } from '@/features/tratak-intelligence/components/TratakJourneyLocked'
import { TratakJourneyLanding, type TratakLandingMissionViewModel } from '@/features/tratak-intelligence/components/TratakJourneyLanding'

export const metadata: Metadata = {
  title: 'Tratak Intelligence Journey™ — Visual Intelligence Lab™',
  description: 'Develop stable visual attention, strengthen eye fixation and improve visual persistence through progressive guided practice.',
}

export default async function TratakIntelligenceJourneyPage(): Promise<React.JSX.Element> {
  const [visualPreparationSessions, fixationSessions, persistenceChallengeSessions, tratakSessions] = await Promise.all([
    getVisualPreparationSessions(),
    getFixationSessions(),
    getPersistenceChallengeSessions(),
    getTratakMissionSessions(),
  ])

  // Development-only bypass — production behavior is unchanged, since
  // isTratakDevUnlockEnabled() is always false outside dev/opted-in staging.
  const isUnlocked =
    isFoundationJourneyComplete({
      visualPreparationCount: visualPreparationSessions.length,
      fixationCount: fixationSessions.length,
      persistenceChallengeCount: persistenceChallengeSessions.length,
    }) || isTratakDevUnlockEnabled()

  if (!isUnlocked) {
    return <TratakJourneyLocked />
  }

  const missionProgress = computeTratakMissionProgress(tratakSessions)
  const streak = computeTratakStreak(tratakSessions)
  const totalDurationSeconds = tratakSessions.reduce((sum, session) => sum + (session.completed ? session.durationSeconds : 0), 0)

  const missions: readonly TratakLandingMissionViewModel[] = missionProgress.map((mission) => ({
    id: mission.id,
    status: mission.status,
  }))

  return (
    <TratakJourneyLanding
      progressPercent={computeTratakJourneyProgressPercent(missionProgress)}
      level={computeTratakLevel(missionProgress)}
      xp={computeTratakXp(missionProgress)}
      currentStreak={streak.currentStreak}
      persistenceScore={computeTratakPersistenceScore({
        completedMissionCount: missionProgress.filter((mission) => mission.status === 'completed').length,
        totalMissionCount: missionProgress.length,
        currentStreak: streak.currentStreak,
        totalDurationSeconds,
      })}
      missions={missions}
    />
  )
}
