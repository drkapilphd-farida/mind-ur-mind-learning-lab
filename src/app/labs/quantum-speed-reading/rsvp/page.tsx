import type { Metadata } from 'next'
import { RsvpExperience } from '@/features/quantum-speed-reading/components/RsvpExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { ProLockedScreen } from '@/components/exercises/ProLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'RSVP — Quantum Speed Reading Lab™',
  description: "Let's practice recognizing single words at a fixed point, without moving your eyes.",
}

export default async function RsvpPage(): Promise<React.JSX.Element> {
  // Quantum Speed Reading Paywall™ — see eye-warm-up/page.tsx's own
  // comment for why this check comes first.
  if (!(await hasQuantumSpeedReadingProAccess())) {
    return <ProLockedScreen title="RSVP" />
  }

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
