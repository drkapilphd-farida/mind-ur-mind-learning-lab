import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { ModeChunkView } from './ModeChunkView'

// Shared Learning Runtime — Memory Mode™ Sprint-2 shared-extraction.
// Moved from Quantum Speed Reading™'s own
// `types/ReadingWorkspaceInitialState.ts` (Sprint-2) — already fully
// mode-agnostic. The one shape any Learning Mode's server-rendered
// initial workspace data takes — computed once, server-side, in that
// mode's own `page.tsx`, then handed to the client workspace component as
// a plain, serializable prop. `'not-processed'` and `'error'` are real,
// honest states — never silently coerced into `'not-started'`.
export type ModeWorkspaceInitialState =
  | { kind: 'not-processed' }
  | { kind: 'not-started' }
  | { kind: 'in-progress'; snapshot: SessionSnapshot; currentChunk: ModeChunkView | null; queueIndex: number; totalChunks: number; estimatedTimeLeftSeconds: number; didResume: boolean }
  | { kind: 'error'; message: string }
