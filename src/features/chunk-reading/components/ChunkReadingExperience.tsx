'use client'

// Chunk Reading Experience™ — the complete exercise consumer.
// Runs entirely on the Universal Exercise Runtime™ and Universal Exercise Player™.
// Only chunk-specific logic (splitting sentences, determining chunk size) lives here.

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import { CHUNK_READING_DEFINITION } from '../definitions/chunkReadingDefinition'
import { buildChunkItems } from '../chunkEngine'
import { getChunkProfile, chunkSizeLabel } from '../chunkDifficulty'
import { computeChunkProgression } from '../chunkProgression'
import { appendChunkSession, computeChunkAnalytics } from '../chunkHistory'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'

// Register the chunk dataset with the engine on first import
import '../chunkDataset'

const EXERCISE_ID = 'chunk-reading'
const LAB_HREF = '/labs/quantum-speed-reading'

// ── Chunk stimulus renderer ───────────────────────────────────────────────────
// Renders multi-word chunks with typography scaled to the word count —
// smaller text for longer chunks so the full group fits comfortably in view.
function renderChunk(chunk: string): React.ReactNode {
  const wordCount = chunk.split(/\s+/).length
  const sizeClass =
    wordCount <= 2 ? 'text-4xl sm:text-5xl' :
    wordCount <= 3 ? 'text-3xl sm:text-4xl' :
    wordCount <= 4 ? 'text-2xl sm:text-3xl' :
    'text-xl sm:text-2xl'

  return (
    <span
      className={cn(
        'select-none text-center font-bold tracking-wide text-foreground leading-relaxed',
        sizeClass,
      )}
      aria-hidden="true"
    >
      {chunk}
    </span>
  )
}

export function ChunkReadingExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)

  // Load current difficulty to determine chunk size
  const state = useMemo(() => loadState(EXERCISE_ID), [])
  const profile = useMemo(() => getChunkProfile(state.currentDifficultyTier), [state.currentDifficultyTier])

  // Analytics for display in the idle-screen description
  const analytics = useMemo(
    () => computeChunkAnalytics(EXERCISE_ID),
    // Re-compute after restart so session count is accurate
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )

  // Build session items from the chunk dataset
  const items = useMemo(() => {
    const seed = Date.now() + sessionKey * 99991
    const sentences = getContentForExercise({
      contentType: 'sentence',
      locale: 'en',
      difficulty: state.currentDifficultyTier,
      count: 40,
      seed,
    })
    return buildChunkItems(sentences, profile.wordsPerChunk, profile.itemsPerSession, seed)
  }, [state.currentDifficultyTier, profile.wordsPerChunk, profile.itemsPerSession, sessionKey])

  // When Practice Again is pressed: record chunk analytics then regenerate items
  function handleRestart(): void {
    // Read current state (updated by the runtime's updateStateAfterSession)
    const recentState = loadState(EXERCISE_ID)

    // Compute chunk progression for logging
    const progression = computeChunkProgression({
      currentTier: recentState.currentDifficultyTier,
      recentAccuracies: recentState.progressCurve.slice(-3),
      averageReactionMs: 0,  // not available without result access here
      sessionsAtCurrentTier: recentState.sessionCount,
    })

    // Append to chunk-specific history for future AI Mentor™ analysis
    appendChunkSession(EXERCISE_ID, {
      timestamp: Date.now(),
      tier: recentState.currentDifficultyTier,
      wordsPerChunk: profile.wordsPerChunk,
      accuracyPercent: recentState.progressCurve.slice(-1)[0] ?? 0,
      flashDurationMs: profile.flashDurationMs,
      itemCount: items.length,
      promoted: progression.promoted,
      recovered: progression.recovered,
    })

    setSessionKey((k) => k + 1)
  }

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={{
        ...CHUNK_READING_DEFINITION,
        // Dynamic description shows current chunk info in the idle screen
        description: `${chunkSizeLabel(profile.wordsPerChunk)} · ${profile.flashDurationMs}ms flash · ${profile.itemsPerSession} chunks per session${analytics.totalSessions > 0 ? ` · Session ${analytics.totalSessions + 1}` : ''}`,
      }}
      items={items}
      renderStimulus={renderChunk}
      onRestart={handleRestart}
      nextExerciseHref={LAB_HREF}
    />
  )
}
