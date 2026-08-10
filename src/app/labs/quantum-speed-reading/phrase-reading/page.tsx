import type { Metadata } from 'next'
import { PhraseReadingExperience } from '@/features/phrase-reading/components/PhraseReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { ProLockedScreen } from '@/components/exercises/ProLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Phrase Reading™ — Quantum Speed Reading Lab™',
  description: 'Recognise the exact meaning of a phrase — not just its topic — among near-identical wording. Pass each level to unlock the next.',
}

export default async function PhraseReadingPage(): Promise<React.JSX.Element> {
  // Quantum Speed Reading Paywall™ — Core Reading Journey™ requires Pro,
  // checked before the cross-stage/sequential gates below.
  if (!(await hasQuantumSpeedReadingProAccess())) {
    return <ProLockedScreen title="Phrase Reading" />
  }

  // SPRINT-2A — Quantum Speed Reading Library Cleanup™. Phrase Reading is
  // Core Reading Journey™'s first exercise (Progressive Chunk Reading
  // removed from Version-1's active sequence). Core Reading Journey™ is a
  // parallel, optional-Reading-Preparation™ branch with no other
  // cross-stage prerequisite — Visual Activation™ is no longer part of
  // this journey (rebuilt as the standalone "Brain Gym" pillar).
  const access = await getExerciseAccess('quantum-speed-reading', READING_EXPANSION_MODULE, 'phrase-reading')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Phrase Reading"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  // Generated once, server-side, per request — passed down so the client's
  // first content pick matches what was already server-rendered.
  return <PhraseReadingExperience initialSeed={Date.now()} />
}
