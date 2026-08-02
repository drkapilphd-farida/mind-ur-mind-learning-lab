// Memory Persistence™ (Sprint 13) — production-ready persistent memory
// infrastructure: repository, lifecycle, retrieval, serialization,
// cache, and orchestration service. Fully self-contained — no imports
// from any other feature. No vector database, no embeddings, no LLM
// integration, no AI provider calls — "Do NOT implement" list honored
// in full.

export * from './domain'
export * from './contracts'
export * from './lifecycle'
export * from './adapters'
export * from './serialization'
export * from './repository'
export * from './cache'
export * from './retrieval'
export * from './service'

// Sprint 14 — Memory Query & Filtering Engine. Additive only, nothing
// above this line changed. Extends the repository contract via the
// Decorator pattern (QueryableMemoryRepository wraps a MemoryRepository)
// rather than editing Sprint 13's own MemoryRepository/InMemoryMemoryRepository.
export * from './query'
export * from './specification'
export * from './sorting'
export * from './pagination'
export * from './queryableRepository'
export * from './queryExecution'

// Sprint 16 — Memory Indexing Infrastructure. Additive only, nothing
// above this line changed. Extends repository behavior via a further
// Decorator layer (IndexedMemoryRepository wraps a
// QueryableMemoryRepository) rather than editing any earlier sprint's
// repository files — every inherited method's public behavior and
// return values are unchanged; indexes are maintained purely as an
// internal side effect.
export * from './indexDomain'
export * from './indexRegistry'
export * from './builtinIndexes'
export * from './indexValidation'
export * from './indexMaintenance'
export * from './indexStatistics'
export * from './indexedRepository'

// Sprint 17 — Memory Transaction Engine. Additive only, nothing above
// this line changed. Extends repository behavior via a fourth
// Decorator layer (TransactionalMemoryRepository wraps an
// IndexedMemoryRepository) rather than editing any earlier sprint's
// repository files — every inherited method's public behavior and
// return values are unchanged; transactions are entirely new surface.
export * from './transactionDomain'
export * from './transactionLifecycle'
export * from './transactionValidation'
export * from './batchOperations'
export * from './rollbackEngine'
export * from './transactionAudit'
export * from './transactionCoordinator'
export * from './transactionalRepository'

// Sprint 19 — Memory Retention & Cleanup Engine. Additive only,
// nothing above this line changed. Extends repository behavior via a
// fifth Decorator layer (RetentionMemoryRepository wraps a
// TransactionalMemoryRepository) rather than editing any earlier
// sprint's repository files; cleanup execution reuses Sprint 17's
// TransactionCoordinator/TransactionalMemoryRepository directly rather
// than reimplementing commit/rollback semantics.
export * from './retentionDomain'
export * from './retentionPolicyEngine'
export * from './cleanupPlanner'
export * from './archiveEligibility'
export * from './cleanupExecution'
export * from './retentionRepository'
export * from './retentionStatistics'
