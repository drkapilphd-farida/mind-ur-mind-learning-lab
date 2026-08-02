// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. The one
// import path every consumer (future Learning Modes) uses — never import
// from extractors/services directly.

export { extractUniversalLearningDocument } from './universalExtractionEngine'
export type { UniversalLearningDocument, LearningSection, LearningContentBlock } from './types/UniversalLearningDocument'
export type { ExtractionError, ExtractionErrorCode, ExtractionResult } from './errors/ExtractionError'
