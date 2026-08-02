import type { Metadata } from 'next'
import { ReadingPreparationSequence } from '@/features/quantum-speed-reading/components/ReadingPreparationSequence'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { VISUAL_ACTIVATION_EXERCISE_IDS } from '@/features/visual-intelligence/visualActivationSequence'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'

export const metadata: Metadata = {
  title: 'Reading Preparation™ — Quantum Speed Reading Lab™',
  description: 'Prepare your eyes and brain before beginning high-speed reading.',
}

export default async function ReadingPreparationPage(): Promise<React.JSX.Element> {
  const visualActivationProgress = await getModuleProgress('visual-intelligence', VISUAL_ACTIVATION_EXERCISE_IDS)
  const isVisualActivationComplete =
    visualActivationProgress.totalCount > 0 && visualActivationProgress.completedCount === visualActivationProgress.totalCount

  // Dev/Test Mode™ — this cross-stage gate is hardcoded here rather than
  // flowing through deriveAvailability, so it needs its own explicit
  // bypass check (see isDevUnlockEnabled's own doc comment).
  if (!isVisualActivationComplete && !isDevUnlockEnabled()) {
    return (
      <ExerciseLockedScreen
        title="Reading Preparation™"
        unlockHref="/labs/visual-intelligence/visual-activation"
        unlockLabel="Go to Visual Activation™"
      />
    )
  }

  return <ReadingPreparationSequence />
}
