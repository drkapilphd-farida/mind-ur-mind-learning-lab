import type { Metadata } from 'next'
import { RegressionControlExperience } from '@/features/quantum-speed-reading/components/RegressionControlExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { ProLockedScreen } from '@/components/exercises/ProLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Regression Control — Quantum Speed Reading Lab™',
  description: "Let's practice moving steadily forward, without looking back.",
}

export default async function RegressionControlPage(): Promise<React.JSX.Element> {
  // Quantum Speed Reading Paywall™ — see eye-warm-up/page.tsx's own
  // comment for why this check comes first.
  if (!(await hasQuantumSpeedReadingProAccess())) {
    return <ProLockedScreen title="Regression Control" />
  }

  const access = await getExerciseAccess('quantum-speed-reading', EYE_FOUNDATION_MODULE, 'regression-control')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Regression Control"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <RegressionControlExperience />
}
