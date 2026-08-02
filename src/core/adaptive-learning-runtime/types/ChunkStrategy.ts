// Adaptive Learning Runtime™ (LSE-2). The brief's exact 5 named chunk
// scheduling strategies. Each maps to one real implementation under
// internal/strategies/ — see internal/applyChunkStrategy.ts for the
// dispatcher every runtime decision calls, never a hardcoded per-decision
// re-implementation.
export type ChunkStrategy = 'sequential' | 'priority-first' | 'dependency-first' | 'review-first' | 'adaptive-queue'
