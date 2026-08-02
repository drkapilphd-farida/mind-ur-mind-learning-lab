import type { RequestBuilderInputs, RequestContext } from '../types'

// One of the brief's own 10 named responsibilities. Resolves the
// "Execution Context" dimension (§ brief) from the raw builder inputs
// — pure, never validates (a blank/malformed input still resolves to a
// `RequestContext`; `../validation/` is what catches that).
export interface ExecutionContextResolver {
  resolve(inputs: Pick<RequestBuilderInputs, 'learnerId' | 'profileId' | 'providerId' | 'modelId'>): RequestContext
}
