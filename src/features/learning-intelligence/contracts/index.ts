// Dependency-inversion interfaces for the Learning Intelligence
// Engine™ (Sprint 3). engine/ depends only on these; parsers/,
// transformers/, and generators/ each implement one. Swapping a mock
// implementation for a real one later means writing a new file that
// satisfies the same interface here — never changing this file or any
// caller.

export type { ContentExtractor } from './ContentExtractor'
export type { ConceptGraphBuilder } from './ConceptGraphBuilder'
export type { LearningObjectGenerator, GeneratorInput } from './LearningObjectGenerator'
export type { LearningIntelligenceEngine } from './LearningIntelligenceEngine'

// Sprint 3, Chunk 3 addition — additive only, nothing above this line changed.
export type { LearningObjectSetGenerator } from './LearningObjectSetGenerator'
