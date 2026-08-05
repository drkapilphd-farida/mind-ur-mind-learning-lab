import type { Metadata } from 'next'
import { ReadingSpeedExperience } from '@/features/quantum-speed-reading/components/ReadingSpeedExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { ProLockedScreen } from '@/components/exercises/ProLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Reading Speed — Quantum Speed Reading Lab™',
  description: "Let's build a smooth, comfortable reading rhythm.",
}

export default async function ReadingSpeedPage(): Promise<React.JSX.Element> {
  // Quantum Speed Reading Paywall™ — see eye-warm-up/page.tsx's own
  // comment for why this check comes first.
  if (!(await hasQuantumSpeedReadingProAccess())) {
    return <ProLockedScreen title="Reading Speed" />
  }

  const access = await getExerciseAccess('quantum-speed-reading', EYE_FOUNDATION_MODULE, 'reading-speed')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Reading Speed"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <ReadingSpeedExperience />
}
