import type { MentorResponseOrchestrationInputs } from '../integration'
import type { MentorResponseOrchestrationResult } from './MentorResponseOrchestrationResult'

// "Build response object, Validate structure, Produce immutable
// output, Generate diagnostics. Repositories remain business-logic
// free." Synchronous — every step of this pipeline is a pure,
// deterministic transform with no I/O, same as every prior
// orchestrator in this session.
export interface MentorResponseOrchestrationService {
  generate(inputs: MentorResponseOrchestrationInputs): MentorResponseOrchestrationResult
}
