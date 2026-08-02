import { z } from 'zod'
import { ChunkStrategySchema } from '@/features/learning-mode-runtime/validation/schemas'

// Quantum Speed Reading™ Production Sprint-1, refactored during Memory
// Mode™ Sprint-1's shared-extraction. `SessionIdSchema`/`ChunkStrategySchema`
// were already fully mode-agnostic and now live in the Shared Learning
// Runtime — re-exported here under their original names/path so every
// existing QSR import keeps working unchanged.
// `StartReadingSessionInputSchema` stays defined locally: its default
// chunk strategy (`'sequential'`) is a genuinely QSR-specific choice, not
// shared behavior — Memory Mode composes its own equivalent schema from
// the same shared `ChunkStrategySchema`, with its own default.
export { SessionIdSchema, ChunkStrategySchema } from '@/features/learning-mode-runtime/validation/schemas'

export const StartReadingSessionInputSchema = z.object({
  documentId: z.string().uuid(),
  chunkStrategy: ChunkStrategySchema.default('sequential'),
})

// Reading Intelligence Engine™ Upgrade — Sprint-4: Quantum Speed
// Reading™ Experience Integration. Deliberately separate from
// `StartReadingSessionInputSchema` above — the "Intelligent Reading"
// mode addresses a real chapter (= a `LearningAssetBundle`'s own
// `chapter_order`), not a `chunkStrategy`.
export const IntelligentReadingSessionInputSchema = z.object({
  documentId: z.string().uuid(),
  chapterOrder: z.number().int().min(0).default(0),
})

export const AdvanceIntelligentReadingStageInputSchema = IntelligentReadingSessionInputSchema.extend({
  direction: z.enum(['next', 'previous']),
})
