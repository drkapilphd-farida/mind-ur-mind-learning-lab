import type { Metadata } from 'next'
import { PhraseReadingExperience } from '@/features/phrase-reading/components/PhraseReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'
import { VISUAL_ACTIVATION_EXERCISE_IDS } from '@/features/visual-intelligence/visualActivationSequence'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'

export const metadata: Metadata = {
  title: 'Phrase Reading™ — Quantum Speed Reading Lab™',
  description: 'Recognise the exact meaning of a phrase — not just its topic — among near-identical wording. Pass each level to unlock the next.',
}

export default async function PhraseReadingPage(): Promise<React.JSX.Element> {
  // SPRINT-2A — Quantum Speed Reading Library Cleanup™. Phrase Reading is
  // now Core Reading Journey™'s first exercise (Progressive Chunk Reading
  // removed from Version-1's active sequence), and Core Reading Journey™ is
  // a parallel, optional-Reading-Preparation™ branch straight off Visual
  // Activation™ — so this cross-stage gate mirrors preparation/page.tsx's
  // own gate exactly (same requirement, different destination), replacing
  // the old requirement of Flash Intelligence Pack™ 100% complete.
  const visualActivationProgress = await getModuleProgress('visual-intelligence', VISUAL_ACTIVATION_EXERCISE_IDS)
  const isVisualActivationComplete =
    visualActivationProgress.totalCount > 0 && visualActivationProgress.completedCount === visualActivationProgress.totalCount

  // Dev/Test Mode™ — this cross-stage gate is hardcoded here rather than
  // flowing through deriveAvailability, so it needs its own explicit
  // bypass check (see isDevUnlockEnabled's own doc comment).
  if (!isVisualActivationComplete && !isDevUnlockEnabled()) {
    return (
      <ExerciseLockedScreen title="Phrase Reading" unlockHref="/labs/visual-intelligence/visual-activation" unlockLabel="Go to Visual Activation™" />
    )
  }

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
