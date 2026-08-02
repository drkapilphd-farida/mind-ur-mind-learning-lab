import type { MentorContextOrchestrationInputs } from '../integration'
import type { MentorContextOrchestrationResult } from './MentorContextOrchestrationResult'

// "Collect context, Validate, Assemble mentor context, Produce
// immutable output, Generate diagnostics." Synchronous — every step of
// this pipeline is a pure, deterministic transform with no I/O, same
// as every prior orchestrator in this session.
export interface MentorContextOrchestrationService {
  generate(inputs: MentorContextOrchestrationInputs): MentorContextOrchestrationResult
}
