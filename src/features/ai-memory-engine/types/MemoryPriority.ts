// Ordered highest to lowest — MemoryCompressor sorts by this exact
// order, never a re-derived numeric mapping duplicated elsewhere.
export type MemoryPriority = 'critical' | 'high' | 'medium' | 'low' | 'temporary'
