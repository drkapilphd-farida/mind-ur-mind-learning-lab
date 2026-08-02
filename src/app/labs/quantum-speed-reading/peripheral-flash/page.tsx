import type { Metadata } from 'next'
import { PeripheralFlashExperience } from '@/features/flash-intelligence/components/PeripheralFlashExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { FLASH_INTELLIGENCE_MODULE } from '@/features/flash-intelligence/flashIntelligenceModule'

export const metadata: Metadata = {
  title: 'Peripheral Flash™ — Quantum Speed Reading Lab™',
  description: 'Visual Span Training. Keep your eyes on the center — recognize what appears around it, without moving your eyes.',
}

export default async function PeripheralFlashPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', FLASH_INTELLIGENCE_MODULE, 'peripheral-flash')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Peripheral Flash"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <PeripheralFlashExperience />
}
