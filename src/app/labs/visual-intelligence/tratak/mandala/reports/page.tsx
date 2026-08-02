import type { Metadata } from 'next'
import { getVisualPreparationSessions } from '@/features/visual-intelligence/adaptive/queries/getVisualPreparationSessions'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getPersistenceChallengeSessions } from '@/features/visual-intelligence/persistence-challenge/queries/getPersistenceChallengeSessions'
import { isFoundationJourneyComplete } from '@/features/tratak-intelligence/foundationCompletionCheck'
import { isTratakDevUnlockEnabled } from '@/features/tratak-intelligence/tratakDevUnlock'
import { getTratakMissionSessions } from '@/features/tratak-intelligence/queries/getTratakMissionSessions'
import { computeReportHistory } from '@/features/tratak-intelligence/reportHistory'
import { TratakJourneyLocked } from '@/features/tratak-intelligence/components/TratakJourneyLocked'
import { ReportHistoryScreen } from '@/features/tratak-intelligence/components/mandala/ReportHistoryScreen'

export const metadata: Metadata = {
  title: 'Report History — Mandala Tratak™',
  description: 'Your Visual Intelligence Report™ history across every completed Mandala Tratak™ session.',
}

export default async function MandalaReportHistoryPage(): Promise<React.JSX.Element> {
  const [visualPreparation, fixation, persistenceChallenge] = await Promise.all([
    getVisualPreparationSessions(),
    getFixationSessions(),
    getPersistenceChallengeSessions(),
  ])

  // Same gate as the other 2 Tratak routes — production behavior unchanged,
  // since isTratakDevUnlockEnabled() is always false outside dev/opted-in staging.
  const isUnlocked =
    isFoundationJourneyComplete({
      visualPreparationCount: visualPreparation.length,
      fixationCount: fixation.length,
      persistenceChallengeCount: persistenceChallenge.length,
    }) || isTratakDevUnlockEnabled()

  if (!isUnlocked) {
    return <TratakJourneyLocked />
  }

  const tratakSessions = await getTratakMissionSessions()
  const reportHistory = computeReportHistory(tratakSessions)

  return <ReportHistoryScreen reportHistory={reportHistory} />
}
