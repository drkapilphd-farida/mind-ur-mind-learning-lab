import type { Metadata } from 'next'
import { SentenceReadingExperience } from '@/features/quantum-speed-reading/components/SentenceReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { ProLockedScreen } from '@/components/exercises/ProLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Sentence Reading — Quantum Speed Reading Lab™',
  description: 'A complete sentence appears — recognise its central idea instantly, without reading word by word. Trains idea recognition.',
}

export default async function SentenceReadingPage(): Promise<React.JSX.Element> {
  // Quantum Speed Reading Paywall™ — see phrase-reading/page.tsx's own
  // comment for why this check comes first.
  if (!(await hasQuantumSpeedReadingProAccess())) {
    return <ProLockedScreen title="Sentence Reading" />
  }

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
