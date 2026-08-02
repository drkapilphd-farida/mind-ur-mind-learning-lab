import type { Metadata } from 'next'
import { FixationReductionExperience } from '@/features/quantum-speed-reading/components/FixationReductionExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Fixation Reduction — Quantum Speed Reading Lab™',
  description: "Let's train your eyes to cover the same line in fewer stops.",
}

export default async function FixationReductionPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', READING_EXPANSION_MODULE, 'fixation-reduction')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Fixation Reduction"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  return <FixationReductionExperience />
}
