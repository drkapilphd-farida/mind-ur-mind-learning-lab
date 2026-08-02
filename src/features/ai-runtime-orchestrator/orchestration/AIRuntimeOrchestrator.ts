import type { RuntimeOrchestrationInputs } from '../integration'
import type { AIRuntimeResult } from '../types'

// One of the brief's own 10 named responsibilities — the top-level
// entry point: "coordinating the complete AI execution lifecycle
// using the already-approved production features." Never throws.
export interface AIRuntimeOrchestrator {
  run(inputs: RuntimeOrchestrationInputs): AIRuntimeResult
}
