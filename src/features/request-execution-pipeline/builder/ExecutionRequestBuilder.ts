import type { RequestBuilderInputs, RequestEnvelope } from '../types'

// One of the brief's own 10 named responsibilities. Pure assembly —
// mirrors `provider-execution-engine`'s own `buildExecutionRequest.ts`
// "never validates, just reduces" discipline: even a completely
// blank/malformed `RequestBuilderInputs` still produces a
// `RequestEnvelope`; `../validation/` is what catches it.
export interface ExecutionRequestBuilder {
  build(inputs: RequestBuilderInputs): RequestEnvelope
}
