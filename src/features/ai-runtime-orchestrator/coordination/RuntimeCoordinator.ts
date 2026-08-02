import type { RuntimeOrchestrationInputs } from '../integration'
import type { AIRuntimeResult } from '../types'

// One of the brief's own 10 named responsibilities. Runs the full
// "## Execution Flow" (§ brief) — Personalization → Recommendation →
// AI Mentor → Provider Selection → Model Selection → Request
// Execution Pipeline → Mock Provider Adapter → Response Processing
// Pipeline → Unified Runtime Result — never throws.
export interface RuntimeCoordinator {
  coordinate(inputs: RuntimeOrchestrationInputs): AIRuntimeResult
}
