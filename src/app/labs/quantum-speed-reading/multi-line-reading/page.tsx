import type { Metadata } from 'next'
import { MultiLineReadingExperience } from '@/features/quantum-speed-reading/components/MultiLineReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { ProLockedScreen } from '@/components/exercises/ProLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

export const metadata: Metadata = {
  title: 'Multi-Line Reading — Quantum Speed Reading Lab™',
  description: 'A real paragraph appears all at once — no highlighting. Recall exactly which line contained what. Trains spatial reading and eye navigation.',
}

export default async function MultiLineReadingPage(): Promise<React.JSX.Element> {
  // Quantum Speed Reading Paywall™ — see phrase-reading/page.tsx's own
  // comment for why this check comes first.
  if (!(await hasQuantumSpeedReadingProAccess())) {
    return <ProLockedScreen title="Multi-Line Reading" />
  }

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
