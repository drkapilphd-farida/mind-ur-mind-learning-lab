import type { Metadata } from 'next'
import { ParagraphReadingExperience } from '@/features/quantum-speed-reading/components/ParagraphReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Paragraph Reading — Quantum Speed Reading Lab™',
  description: 'A complete paragraph appears at once — recognise it as one meaning block, not a string of sentences. Trains whole-paragraph comprehension.',
}

export default async function ParagraphReadingPage(): Promise<React.JSX.Element> {
  const access = await getExerciseAccess('quantum-speed-reading', READING_EXPANSION_MODULE, 'paragraph-reading')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Paragraph Reading"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  // Generated once, server-side, per request — passed down so the client's
  // first paragraph pick matches what was already server-rendered.
  return <ParagraphReadingExperience initialSeed={Date.now()} />
}
