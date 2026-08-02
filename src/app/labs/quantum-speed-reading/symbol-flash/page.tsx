import type { Metadata } from 'next'
import { SymbolFlashExperience } from '@/features/flash-intelligence/components/SymbolFlashExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { FLASH_INTELLIGENCE_MODULE } from '@/features/flash-intelligence/flashIntelligenceModule'

export const metadata: Metadata = {
  title: 'Symbol Flash™ — Quantum Speed Reading Lab™',
  description: 'Train ultra-fast visual recognition using symbols instead of words. Mission 3 of the Flash Intelligence Pack™.',
}

export default async function SymbolFlashPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', FLASH_INTELLIGENCE_MODULE, 'symbol-flash')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Symbol Flash"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <SymbolFlashExperience />
}
