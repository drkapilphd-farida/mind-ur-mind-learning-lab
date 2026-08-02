import type { Metadata } from 'next'
import { getImagePersistenceSessionsFull } from '@/features/visual-intelligence/adaptive/queries/getImagePersistenceSessionsFull'
import { getVisualPreparationSessions } from '@/features/visual-intelligence/adaptive/queries/getVisualPreparationSessions'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getPersistenceChallengeSessions } from '@/features/visual-intelligence/persistence-challenge/queries/getPersistenceChallengeSessions'
import { buildDnaContext } from '@/features/visual-intelligence/dna/dnaContext'
import { computeNeuralEvolutionIndex, type NeuralEvolutionDimension } from '@/features/neural-evolution/neuralEvolutionIndex'
import { getTratakMissionSessions } from '@/features/tratak-intelligence/queries/getTratakMissionSessions'
import { getTodaysImagePersistenceSequence } from '@/features/tratak-intelligence/queries/getTodaysImagePersistenceSequence'
import { computeTratakStreak } from '@/features/tratak-intelligence/tratakStreak'
import { VisualActivationSequence } from '@/features/visual-intelligence/components/VisualActivationSequence'

export const metadata: Metadata = {
  title: 'Visual Activation™ — Visual Intelligence Lab™',
  description: 'A guided journey that activates your visual system before high-speed reading.',
}

export default async function VisualActivationPage(): Promise<React.JSX.Element> {
  const [imagePersistence, visualPreparation, fixation, persistenceChallenge, tratakSessions, todaysSequence] = await Promise.all([
    getImagePersistenceSessionsFull(),
    getVisualPreparationSessions(),
    getFixationSessions(),
    getPersistenceChallengeSessions(),
    getTratakMissionSessions(),
    getTodaysImagePersistenceSequence(),
  ])

  const context = buildDnaContext({ imagePersistence, visualPreparation, fixation, persistenceChallenge })

  // Same lab-wide dimension set every Tratak mission page already uses
  // (Sprint-9, unmodified) — the honest, real, existing value.
  const neuralEvolutionDimensions: NeuralEvolutionDimension[] = [
    { id: 'visual-intelligence', label: 'Visual Intelligence', status: 'active', score: Math.round(context.scoreProgress.currentScore / 10) },
    { id: 'brain-adaptation', label: 'Brain Adaptation', status: 'coming-soon', score: null },
    { id: 'attention-stability', label: 'Attention Stability', status: 'coming-soon', score: null },
    { id: 'learning-readiness', label: 'Learning Readiness', status: 'coming-soon', score: null },
    { id: 'cognitive-flexibility', label: 'Cognitive Flexibility', status: 'coming-soon', score: null },
  ]
  const neuralEvolutionResult = computeNeuralEvolutionIndex(neuralEvolutionDimensions)

  const streak = computeTratakStreak(tratakSessions)

  return (
    <VisualActivationSequence
      neuralEvolutionOverallScore={neuralEvolutionResult.overallScore}
      imagePersistenceVisualDnaScore={context.scoreProgress.currentScore}
      imagePersistenceSequence={todaysSequence.sequence}
      imagePersistenceTodaysCompletedCount={todaysSequence.todaysCompletedCount}
      imagePersistenceInitialTodaysReport={todaysSequence.initialTodaysReport}
      imagePersistenceInitialDailyStreak={streak.currentStreak}
    />
  )
}
