import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { assembleMentorPromptPayload } from '../assembly'
import { buildPromptAssemblyInputs } from '../integration'
import type { MentorPromptOrchestrationInputs } from '../integration'
import { validatePromptPayload } from '../validation'
import { generateMentorPromptDiagnostics } from '../diagnostics'
import type { MentorPromptOrchestrationResult } from './MentorPromptOrchestrationResult'
import type { MentorPromptOrchestrationService } from './MentorPromptOrchestrationService'

export type MentorPromptOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): MentorPromptOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements MentorPromptOrchestrationService — reduces the raw
// cross-feature inputs, assembles the payload, validates it, and
// produces diagnostics, always returning all three together.
export class DefaultMentorPromptOrchestrationService implements MentorPromptOrchestrationService {
  constructor(private readonly dependencies: MentorPromptOrchestrationServiceDependencies) {}

  generate(inputs: MentorPromptOrchestrationInputs): MentorPromptOrchestrationResult {
    const assemblyInputs = buildPromptAssemblyInputs(inputs)
    const payload = assembleMentorPromptPayload(assemblyInputs, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const validationResult = validatePromptPayload(payload, inputs.configurationFacts)
    const diagnostics = generateMentorPromptDiagnostics(payload, validationResult)

    return { payload, validationResult, diagnostics }
  }
}

export function createMentorPromptOrchestrationService(
  overrides: Partial<MentorPromptOrchestrationServiceDependencies> = {},
): MentorPromptOrchestrationService {
  return new DefaultMentorPromptOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
