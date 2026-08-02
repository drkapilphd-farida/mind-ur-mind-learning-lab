// Pipeline stage 2: ExtractedContent → ConceptGraph. `createConceptGraphBuilder`
// is the intended entry point for the same reason
// parsers/createContentExtractor is — engine/ (Chunk 4) should never
// import a concrete implementation class directly.

export { createConceptGraphBuilder } from './createConceptGraphBuilder'
export { MockConceptGraphBuilder } from './mockConceptGraphBuilder'
