import type { Metadata } from 'next'
import { MixedFlashExperience } from '@/features/flash-intelligence/components/MixedFlashExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { FLASH_INTELLIGENCE_MODULE } from '@/features/flash-intelligence/flashIntelligenceModule'

export const metadata: Metadata = {
  title: 'Mixed Flash™ — Quantum Speed Reading Lab™',
  description: 'Words, numbers, and symbols — the brain never knows which is coming next. The Boss Mission of the Flash Intelligence Pack™.',
}

export default async function MixedFlashPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', FLASH_INTELLIGENCE_MODULE, 'mixed-flash')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Mixed Flash"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <MixedFlashExperience />
}
