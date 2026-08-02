import type { Metadata } from 'next'
import { getImagePersistenceSessionsFull } from '@/features/visual-intelligence/adaptive/queries/getImagePersistenceSessionsFull'
import { getVisualPreparationSessions } from '@/features/visual-intelligence/adaptive/queries/getVisualPreparationSessions'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getPersistenceChallengeSessions } from '@/features/visual-intelligence/persistence-challenge/queries/getPersistenceChallengeSessions'
import { buildDnaContext } from '@/features/visual-intelligence/dna/dnaContext'
import { computeNeuralEvolutionIndex, type NeuralEvolutionDimension } from '@/features/neural-evolution/neuralEvolutionIndex'
import { isFoundationJourneyComplete } from '@/features/tratak-intelligence/foundationCompletionCheck'
import { isTratakDevUnlockEnabled } from '@/features/tratak-intelligence/tratakDevUnlock'
import { getTratakMissionSessions } from '@/features/tratak-intelligence/queries/getTratakMissionSessions'
import { computeMandalaCurrentLevelNumber, computeMandalaLevelProgress } from '@/features/tratak-intelligence/mandalaLevels'
import { TratakJourneyLocked } from '@/features/tratak-intelligence/components/TratakJourneyLocked'
import { MandalaTratakExperience } from '@/features/tratak-intelligence/components/mandala/MandalaTratakExperience'

export const metadata: Metadata = {
  title: 'Mandala Tratak™ — Tratak Intelligence Journey™',
  description: 'Train your visual fixation using beautiful symmetrical mandalas.',
}

export default async function MandalaTratakPage(): Promise<React.JSX.Element> {
  const [imagePersistence, visualPreparation, fixation, persistenceChallenge] = await Promise.all([
    getImagePersistenceSessionsFull(),
    getVisualPreparationSessions(),
    getFixationSessions(),
    getPersistenceChallengeSessions(),
  ])

  // Development-only bypass — production behavior is unchanged, since
  // isTratakDevUnlockEnabled() is always false outside dev/opted-in staging.
  const isUnlocked =
    isFoundationJourneyComplete({
      visualPreparationCount: visualPreparation.length,
      fixationCount: fixation.length,
      persistenceChallengeCount: persistenceChallenge.length,
    }) || isTratakDevUnlockEnabled()

  if (!isUnlocked) {
    return <TratakJourneyLocked />
  }

  const context = buildDnaContext({ imagePersistence, visualPreparation, fixation, persistenceChallenge })

  // Same lab-wide dimension set the Dashboard uses (Sprint-9, unmodified) —
  // Tratak has no dimension slot of its own in this locked file, so this is
  // the real, honest lab-wide value, not a Tratak-specific one.
  const neuralEvolutionDimensions: NeuralEvolutionDimension[] = [
    { id: 'visual-intelligence', label: 'Visual Intelligence', status: 'active', score: Math.round(context.scoreProgress.currentScore / 10) },
    { id: 'brain-adaptation', label: 'Brain Adaptation', status: 'coming-soon', score: null },
    { id: 'attention-stability', label: 'Attention Stability', status: 'coming-soon', score: null },
    { id: 'learning-readiness', label: 'Learning Readiness', status: 'coming-soon', score: null },
    { id: 'cognitive-flexibility', label: 'Cognitive Flexibility', status: 'coming-soon', score: null },
  ]
  const neuralEvolutionResult = computeNeuralEvolutionIndex(neuralEvolutionDimensions)

  const tratakSessions = await getTratakMissionSessions()
  const levels = computeMandalaLevelProgress(tratakSessions)
  const currentLevelOrder = computeMandalaCurrentLevelNumber(levels)

  return (
    <MandalaTratakExperience
      neuralEvolutionOverallScore={neuralEvolutionResult.overallScore}
      initialLevels={levels}
      initialCurrentLevelOrder={currentLevelOrder}
    />
  )
}
