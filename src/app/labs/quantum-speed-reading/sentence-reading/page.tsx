import type { Metadata } from 'next'
import { SentenceReadingExperience } from '@/features/quantum-speed-reading/components/SentenceReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Sentence Reading — Quantum Speed Reading Lab™',
  description: 'A complete sentence appears — recognise its central idea instantly, without reading word by word. Trains idea recognition.',
}

export default async function SentenceReadingPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', READING_EXPANSION_MODULE, 'sentence-reading')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Sentence Reading"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  // Generated once, server-side, per request — passed down so the client's
  // first content pick matches what was already server-rendered.
  return <SentenceReadingExperience initialSeed={Date.now()} />
}
