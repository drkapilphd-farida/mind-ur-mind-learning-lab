'use client'

// Chunk Reading Experience™ — the complete exercise consumer.
// Runs entirely on the Universal Exercise Runtime™ and Universal Exercise Player™.
// Only chunk-specific logic (splitting sentences, determining chunk size) lives here.

import { useState, useMemo } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import { FitText } from '@/components/typography/FitText'
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
// Sizing is handled by the shared Typography Engine (FitText) — it scales by
// actual word length, not just word count, and auto-adapts whether this
// renders in the large flash view or a narrow answer-card option.
function renderChunk(chunk: string): React.ReactNode {
  return (
    <FitText
      text={chunk}
      role="display"
      className="select-none text-center font-bold tracking-wide text-foreground leading-relaxed"
      aria-hidden="true"
    />
  )
}

export function ChunkReadingExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)

  // Load current difficulty to determine chunk size. Re-reads on every
  // restart (sessionKey bump) — updateStateAfterSession() persists a
  // promoted/recovered tier as soon as a session completes, before
  // "Practice Again" is clickable, so this picks up the new tier without
  // needing a page reload (matches Phrase Reading / Multi-Line Reading).
  const state = useMemo(
    () => loadState(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )
  const profile = useMemo(() => getChunkProfile(state.currentDifficultyTier), [state.currentDifficultyTier])

  // Analytics for display in the idle-screen description
  const analytics = useMemo(
    () => computeChunkAnalytics(EXERCISE_ID),
    // Re-compute after restart so session count is accurate
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )

  // Build session items directly from the curated chunk dataset — no
  // splitting step; word count (the difficulty axis) is already baked into
  // which chunks the dataset returns at this tier.
  const items = useMemo(() => {
    const seed = Date.now() + sessionKey * 99991
    // count matches the tier's real curated supply (24 items/tier) rather
    // than an arbitrary buffer larger than any tier has — requesting more
    // than a tier's real supply is what caused datasetEngine.ts's
    // difficulty fallback to silently pull in and mix adjacent-tier word
    // counts (found live while building Progressive Chunk Reading™, since
    // fixed at the engine level; right-sizing the request here too keeps
    // this session's pool as tier-pure as the curated content allows).
    const chunks = getContentForExercise({
      contentType: 'chunk',
      locale: 'en',
      difficulty: state.currentDifficultyTier,
      count: Math.max(profile.itemsPerSession, 24),
      seed,
    })
    return buildChunkItems(chunks, profile.itemsPerSession, seed)
  }, [state.currentDifficultyTier, profile.itemsPerSession, sessionKey])

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
