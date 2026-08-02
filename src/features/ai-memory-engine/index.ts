// AI Memory Engine™ (Sprint 12) — the complete memory architecture
// every future AI Mentor conversation will use. Fully self-contained —
// no imports from any other feature. Architecture only: no real AI, no
// embeddings, no vector database, no Supabase persistence. Memory
// content is a generic, opaque payload — a future integration sprint
// feeds real domain data (assessments, journeys, conversations, ...)
// through this same shape.

export * from './types'
export * from './contracts'
export * from './categoryDefaults'
export * from './retention'
export * from './adapters'
export * from './building'
export * from './storeOperations'
export * from './resolution'
export * from './compression'
export * from './engine'
