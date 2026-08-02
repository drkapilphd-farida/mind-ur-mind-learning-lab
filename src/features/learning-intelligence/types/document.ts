// The engine's pipeline starts from a real Document row — reused
// directly from the `documents` domain, never redefined. "No duplicated
// models" means this file exists only so every other file in this
// feature can import Document from one place inside
// learning-intelligence/types/ without reaching across the feature
// boundary — it is a re-export, not a second definition.
export type { Document, DocumentStatus } from '@/types/documents'
