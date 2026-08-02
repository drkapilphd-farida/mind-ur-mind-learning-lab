import type { TranslationOrchestrationInputs } from '../integration'
import type { TranslationOrchestrationResult } from './TranslationOrchestrationResult'

// "Translate payload, Validate translation, Produce immutable output,
// Generate diagnostics." Synchronous — every step of this pipeline is
// a pure, deterministic transform with no I/O, same as every prior
// orchestrator in this session.
export interface TranslationOrchestrationService {
  generate(inputs: TranslationOrchestrationInputs): TranslationOrchestrationResult
}
