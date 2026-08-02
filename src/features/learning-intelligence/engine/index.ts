// The orchestration layer (Sprint 3, Chunk 4). Wires Document →
// ExtractedContent → ConceptGraph → Learning Generators → LearningPlan
// into one callable engine. `createLearningIntelligenceEngine` is the
// intended entry point for actions/ and hooks/ — never call
// parsers/transformers/generators directly from outside this feature.

export { createLearningIntelligenceEngine, type LearningIntelligenceEngineDependencies } from './createLearningIntelligenceEngine'
