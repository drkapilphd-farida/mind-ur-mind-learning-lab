import type { Metadata } from 'next'
import { ProgressiveChunkReadingExperience } from '@/features/progressive-chunk-reading/components/ProgressiveChunkReadingExperience'
import { ExerciseLockedScreen } from '@/components/exercises/ExerciseLockedScreen'
import { getExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'
import { FLASH_INTELLIGENCE_MODULE } from '@/features/flash-intelligence/flashIntelligenceModule'

export const metadata: Metadata = {
  title: 'Progressive Chunk Reading™ — Quantum Speed Reading Lab™',
  description: 'Word groups appear automatically, in flow — read naturally, then answer two quick recognition questions per block.',
}

const FLASH_INTELLIGENCE_EXERCISE_IDS = FLASH_INTELLIGENCE_MODULE.map((exercise) => exercise.exerciseId)

export default async function ProgressiveChunkReadingPage(): Promise<React.JSX.Element> {
  // Progressive Chunk Reading is the entry point of Core Reading Journey™
  // (Stage 4) — it additionally requires Flash Intelligence Pack™ (Stage 3)
  // to be fully complete, mirroring every earlier cross-stage gate.
  const flashPackProgress = await getModuleProgress('quantum-speed-reading', FLASH_INTELLIGENCE_EXERCISE_IDS)
  const isFlashPackComplete = flashPackProgress.totalCount > 0 && flashPackProgress.completedCount === flashPackProgress.totalCount

  if (!isFlashPackComplete) {
    return (
      <ExerciseLockedScreen
        title="Core Reading Journey™"
        unlockHref="/labs/quantum-speed-reading/word-flash"
        unlockLabel="Go to Flash Intelligence Pack™"
      />
    )
  }

  const access = await getExerciseAccess('quantum-speed-reading', READING_EXPANSION_MODULE, 'progressive-chunk-reading')

  if (!access.allowed) {
    return (
      <ExerciseLockedScreen
        title="Progressive Chunk Reading"
        unlockHref={access.nextExercise?.href ?? '/labs/quantum-speed-reading'}
        unlockLabel={access.nextExercise ? `Go to ${access.nextExercise.title}` : 'Back to Lab'}
      />
    )
  }

  // Generated once, server-side, per request — passed down so the client's
  // first content pick matches what was already server-rendered.
  return <ProgressiveChunkReadingExperience initialSeed={Date.now()} />
}
