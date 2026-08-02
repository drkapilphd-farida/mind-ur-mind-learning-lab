import type { ConceptGraph, ExtractedContent } from '../types'

// Pipeline stage 2's contract. `transformers/mockConceptGraphBuilder.ts`
// implements this today by deriving a small, believable concept graph
// from ExtractedContent's own section titles — no embeddings, no
// clustering model. A future real builder (genuine concept extraction)
// implements this exact same interface.
export interface ConceptGraphBuilder {
  build(content: ExtractedContent): Promise<ConceptGraph>
}
