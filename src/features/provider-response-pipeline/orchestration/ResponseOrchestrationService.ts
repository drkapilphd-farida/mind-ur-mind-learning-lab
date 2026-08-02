import type { ResponseOrchestrationInputs } from '../integration'
import type { ResponseOrchestrationResult } from './ResponseOrchestrationResult'

// "Normalize response, Validate response, Produce immutable output,
// Generate diagnostics. Repositories remain business-logic free."
// Synchronous — every step of this pipeline is a pure, deterministic
// transform with no I/O, same as every prior orchestrator in this
// session.
export interface ResponseOrchestrationService {
  generate(inputs: ResponseOrchestrationInputs): ResponseOrchestrationResult
}
