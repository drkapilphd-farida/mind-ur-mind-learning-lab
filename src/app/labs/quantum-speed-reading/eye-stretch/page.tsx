import type { Metadata } from 'next'
import { EyeStretchExperience } from '@/features/quantum-speed-reading/components/EyeStretchExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Eye Stretch — Quantum Speed Reading Lab™',
  description: "Let's gently extend how far your eyes can comfortably move.",
}

export default async function EyeStretchPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', EYE_FOUNDATION_MODULE, 'eye-stretch')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Eye Stretch"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <EyeStretchExperience />
}
