import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { ULOProvenance } from './ULOProvenance'

// Universal Learning Object™ (UCE-6) — "Knowledge Intelligence": document
// identity, Learning Chunks, concepts, relationships, references. Every
// field here is the real, already-built object from its own engine,
// embedded by composition — never redefined, never copied field-by-
// field. "Concepts" and "Relationships" are deliberately NOT re-exposed
// as separate fields: they already live on `graph.nodes`/`graph.edges`
// (`graph.nodes.filter(n => n.type === 'concept')`, or
// `createGraphIndex(graph)` for real traversal — both already exported
// by `@/core/universal-learning-engine/knowledge-graph`) — adding
// duplicate fields here would be exactly the "duplicate intelligence"
// this sprint's own verification section forbids.
export type KnowledgeIntelligence = {
  document: UniversalLearningDocument
  chunks: readonly LearningChunk[]
  graph: LearningKnowledgeGraph
  references: ULOProvenance
}
