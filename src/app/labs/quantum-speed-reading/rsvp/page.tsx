import type { Metadata } from 'next'
import { RsvpExperience } from '@/features/quantum-speed-reading/components/RsvpExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'RSVP — Quantum Speed Reading Lab™',
  description: "Let's practice recognizing single words at a fixed point, without moving your eyes.",
}

export default async function RsvpPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', EYE_FOUNDATION_MODULE, 'rsvp')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="RSVP"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <RsvpExperience />
}
