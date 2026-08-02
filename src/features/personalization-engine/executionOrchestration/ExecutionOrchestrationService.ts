import type { ExecutionPlannerInputs } from '../executionPlanning'
import type { ExecutionOrchestrationResult } from './ExecutionOrchestrationResult'

// "Generate execution plan, Validate plan, Produce immutable output,
// Generate diagnostics." Synchronous — every step of this pipeline is a
// pure, deterministic transform with no I/O, same as
// `StrategyOrchestrationService`.
export interface ExecutionOrchestrationService {
  generate(inputs: ExecutionPlannerInputs): ExecutionOrchestrationResult
}
