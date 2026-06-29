import type { Metadata } from 'next'
import { EyeSpanExperience } from '@/features/quantum-speed-reading/components/EyeSpanExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Eye Span — Quantum Speed Reading Lab™',
  description: "Let's see how much your eyes can take in at once, without moving them.",
}

export default async function EyeSpanPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', EYE_FOUNDATION_MODULE, 'eye-span')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Eye Span"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <EyeSpanExperience />
}
