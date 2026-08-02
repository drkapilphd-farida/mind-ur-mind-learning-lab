// Memory Event & Audit Infrastructure™ (Sprint 18) — deterministic
// event lifecycle, dispatcher, audit trail, validation, statistics,
// and repository. Fully self-contained — no imports from any other
// feature, including `@/features/memory-persistence` or
// `@/features/memory-session-context` (subjects are carried only as
// opaque ids — see `domain/EventMetadata.ts`). No message brokers, no
// Kafka/RabbitMQ/webhooks, no streaming, no AI/embeddings — "Do NOT
// implement" list honored in full.

export * from './domain'
export * from './contracts'
export * from './adapters'
export * from './lifecycle'
export * from './repository'
export * from './validation'
export * from './statistics'
export * from './dispatcher'
export * from './auditTrail'
