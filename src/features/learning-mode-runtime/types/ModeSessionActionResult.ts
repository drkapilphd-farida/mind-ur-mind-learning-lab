import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { ModeChunkView } from './ModeChunkView'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved verbatim from Quantum Speed Reading™'s own
// `types/ReadingSessionActionResult.ts` (amended across Sprints 1-3) —
// already fully mode-agnostic. Any Learning Mode's session-lifecycle
// action returns this same shape.
export type ModeSessionActionResult =
  | {
      success: true
      snapshot: SessionSnapshot
      currentChunk: ModeChunkView | null
      queueIndex: number
      totalChunks: number
      estimatedTimeLeftSeconds: number
    }
  | { success: false; error: string }
