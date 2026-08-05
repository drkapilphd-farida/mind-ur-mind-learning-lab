import type { Metadata } from 'next'
import { ParagraphReadingExperience } from '@/features/quantum-speed-reading/components/ParagraphReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { ProLockedScreen } from '@/components/exercises/ProLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Paragraph Reading — Quantum Speed Reading Lab™',
  description: 'A complete paragraph appears at once — recognise it as one meaning block, not a string of sentences. Trains whole-paragraph comprehension.',
}

export default async function ParagraphReadingPage(): Promise<React.JSX.Element> {
  // Quantum Speed Reading Paywall™ — see phrase-reading/page.tsx's own
  // comment for why this check comes first.
  if (!(await hasQuantumSpeedReadingProAccess())) {
    return <ProLockedScreen title="Paragraph Reading" />
  }

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
