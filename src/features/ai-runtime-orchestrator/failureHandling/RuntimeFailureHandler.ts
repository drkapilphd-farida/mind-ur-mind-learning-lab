import type { AIRuntimeResult } from '../types'
import type { RuntimeFailureInputs } from './RuntimeFailureInputs'

// One of the brief's own 10 named responsibilities — "Failure
// propagation" (§ Responsibilities). Never throws; always produces the
// failed-shape `AIRuntimeResult`.
export interface RuntimeFailureHandler {
  handle(inputs: RuntimeFailureInputs): AIRuntimeResult
}
