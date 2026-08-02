import type { PipelineOrchestrationInputs } from '../integration'
import type { PipelineOrchestrationResult } from './PipelineOrchestrationResult'

// "Resolve configuration, Build execution request, Validate request,
// Produce immutable output, Generate diagnostics." Synchronous — every
// step of this pipeline is a pure, deterministic transform with no
// I/O, same as every prior orchestrator in this session.
export interface PipelineOrchestrationService {
  generate(inputs: PipelineOrchestrationInputs): PipelineOrchestrationResult
}
