import type { RequestContext, RequestMetadata } from '../types'

// One of the brief's own 10 named responsibilities. Assembles the
// "Metadata" dimension (§ brief) from a resolved `RequestContext`.
export interface RequestMetadataAssembler {
  assemble(context: RequestContext): RequestMetadata
}
