import type { Metadata } from 'next'
import { MultiLineReadingExperience } from '@/features/quantum-speed-reading/components/MultiLineReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Multi-Line Reading — Quantum Speed Reading Lab™',
  description: 'A real paragraph appears all at once — no highlighting. Recall exactly which line contained what. Trains spatial reading and eye navigation.',
}

export default async function MultiLineReadingPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', READING_EXPANSION_MODULE, 'multi-line-reading')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Multi-Line Reading"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  // Generated once, server-side, per request — passed down so the client's
  // first content pick matches what was already server-rendered.
  return <MultiLineReadingExperience initialSeed={Date.now()} />
}
