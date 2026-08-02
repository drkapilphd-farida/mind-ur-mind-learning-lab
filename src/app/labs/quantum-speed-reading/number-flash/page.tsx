import type { Metadata } from 'next'
import { NumberFlashExperience } from '@/features/flash-intelligence/components/NumberFlashExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { FLASH_INTELLIGENCE_MODULE } from '@/features/flash-intelligence/flashIntelligenceModule'

export const metadata: Metadata = {
  title: 'Number Flash™ — Quantum Speed Reading Lab™',
  description: 'Train your brain to recognize numbers instantly. Mission 2 of the Flash Intelligence Pack™.',
}

export default async function NumberFlashPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', FLASH_INTELLIGENCE_MODULE, 'number-flash')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Number Flash"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <NumberFlashExperience />
}
