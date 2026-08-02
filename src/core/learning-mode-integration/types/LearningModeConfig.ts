import type { ChunkStrategy } from '@/core/adaptive-learning-runtime'

// Learning Mode Runtime Integration™ (LSE-4). Mode configuration contract —
// what a caller provides to start a runtime for a specific, already-
// registered Learning Mode. `sessionType` is deliberately absent here: it
// is derived from the mode's own declared `LearningModeCapabilities.sessionType`
// (see startModeRuntime.ts), never re-specified by the caller, so a
// mismatched sessionType is structurally impossible rather than a runtime
// validation case. `modeOptions` is an intentionally opaque bag — this
// layer never reads or interprets it, since doing so would be exactly the
// "mode-specific business logic" this sprint must not contain; it exists
// only so a concrete Learning Mode's own Server Action has somewhere to
// carry its own config (e.g. a chosen `ReadingSpeedProfile`) through this
// generic integration layer without this layer needing to know it exists.
export type LearningModeConfig = {
  learnerId: string
  chunkStrategy: ChunkStrategy
  modeOptions?: Readonly<Record<string, unknown>>
}
