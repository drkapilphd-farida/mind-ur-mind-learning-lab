import type { ConceptGraphBuilder } from '../contracts'
import { MockConceptGraphBuilder } from './mockConceptGraphBuilder'

// Mirrors parsers/createContentExtractor's factory pattern: callers get
// back a ConceptGraphBuilder-typed value, never a concrete class
// reference. One strategy today (no mime-type variation needed at this
// pipeline stage), but callers never construct MockConceptGraphBuilder
// directly — swapping in a real builder later is a one-line change
// here, not a change at every call site.
export function createConceptGraphBuilder(): ConceptGraphBuilder {
  return new MockConceptGraphBuilder()
}
