import type { Metadata } from 'next'
import { WordFlashExperience } from '@/features/flash-intelligence/components/WordFlashExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { FLASH_INTELLIGENCE_MODULE } from '@/features/flash-intelligence/flashIntelligenceModule'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Word Flash™ — Quantum Speed Reading Lab™',
  description: 'A word flashes briefly — identify it before it disappears. The entry game of the Flash Intelligence Pack™, training instant word recognition.',
}

const READING_PREPARATION_EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((exercise) => exercise.exerciseId)

export default async function WordFlashPage(): Promise<React.JSX.Element> {
  // Word Flash is the entry point of Flash Intelligence Pack™ (Stage 3) —
  // it additionally requires Reading Preparation™ (Stage 2) to be fully
  // complete, mirroring the Visual Activation™ → Reading Preparation™ gate.
  const readingPreparationProgress = await getModuleProgress('quantum-speed-reading', READING_PREPARATION_EXERCISE_IDS)
  const isReadingPreparationComplete =
    readingPreparationProgress.totalCount > 0 && readingPreparationProgress.completedCount === readingPreparationProgress.totalCount

  if (!isReadingPreparationComplete) {
    return (
      <ExerciseLockedScreen
        title="Flash Intelligence Pack™"
        unlockHref="/labs/quantum-speed-reading/preparation"
        unlockLabel="Go to Reading Preparation™"
      />
    )
  }

  const access = await getExerciseAccess('quantum-speed-reading', FLASH_INTELLIGENCE_MODULE, 'word-flash')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Word Flash"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <WordFlashExperience />
}
