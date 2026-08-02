import { z } from 'zod'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction. Real
// input validation at every Server Action boundary, per the Engineering
// Constitution. Moved verbatim from Quantum Speed Reading™'s own
// `types/schemas.ts` (Sprint-1) — genuinely mode-agnostic already, so no
// behavior changed by the move. Each Learning Mode composes its own
// `StartXSessionInputSchema` from `ChunkStrategySchema` with its own
// default strategy; that composition is legitimately mode-specific and
// stays local to each mode's own runtime feature.
export const SessionIdSchema = z.string().uuid()

export const ChunkStrategySchema = z.enum(['sequential', 'priority-first', 'dependency-first', 'review-first', 'adaptive-queue'])
