import type { MentorPromptOrchestrationInputs } from '../integration'
import type { MentorPromptOrchestrationResult } from './MentorPromptOrchestrationResult'

// "Assemble payload, Validate payload, Produce immutable output,
// Generate diagnostics. Repositories remain business-logic free."
// Synchronous — every step of this pipeline is a pure, deterministic
// transform with no I/O, same as every prior orchestrator in this
// session.
export interface MentorPromptOrchestrationService {
  generate(inputs: MentorPromptOrchestrationInputs): MentorPromptOrchestrationResult
}
