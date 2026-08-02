import type { AIOrchestrationInputs } from '../integration'
import type { AIPipelineOrchestrationResult } from './AIPipelineOrchestrationResult'

// "Execute deterministic pipeline, Coordinate existing modules, Produce
// immutable orchestration result, Generate diagnostics." Synchronous —
// every one of the 6 coordinated sub-services is itself synchronous
// and deterministic, so this stays synchronous too, same as every
// prior orchestrator in this session.
export interface AIOrchestrationService {
  generate(inputs: AIOrchestrationInputs): AIPipelineOrchestrationResult
}
