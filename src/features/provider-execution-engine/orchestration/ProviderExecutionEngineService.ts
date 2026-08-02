import type { ExecutionOrchestrationInputs } from '../integration'
import type { ExecutionEngineResult } from './ExecutionEngineResult'

// "ProviderExecutionEngine™" (§ Responsibilities) — "Execute
// deterministic pipeline... No external API." Synchronous —
// everything here is a pure, deterministic decision over
// caller-supplied, already-known outcomes; there is nothing to await.
export interface ProviderExecutionEngineService {
  generate(inputs: ExecutionOrchestrationInputs): ExecutionEngineResult
}
