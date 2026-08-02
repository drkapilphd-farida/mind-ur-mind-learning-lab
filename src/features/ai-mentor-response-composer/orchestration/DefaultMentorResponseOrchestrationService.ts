import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { composeMentorResponse } from '../composition'
import { buildResponseComposerInputs } from '../integration'
import type { MentorResponseOrchestrationInputs } from '../integration'
import { validateMentorResponse } from '../validation'
import { generateMentorResponseDiagnostics } from '../diagnostics'
import type { MentorResponseOrchestrationResult } from './MentorResponseOrchestrationResult'
import type { MentorResponseOrchestrationService } from './MentorResponseOrchestrationService'

export type MentorResponseOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): MentorResponseOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements MentorResponseOrchestrationService — reduces the raw
// cross-feature inputs, composes the response, validates it, and
// produces diagnostics, always returning all three together.
export class DefaultMentorResponseOrchestrationService implements MentorResponseOrchestrationService {
  constructor(private readonly dependencies: MentorResponseOrchestrationServiceDependencies) {}

  generate(inputs: MentorResponseOrchestrationInputs): MentorResponseOrchestrationResult {
    const composerInputs = buildResponseComposerInputs(inputs)
    const response = composeMentorResponse(composerInputs, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const validationResult = validateMentorResponse(response, inputs.configurationFacts)
    const diagnostics = generateMentorResponseDiagnostics(response, validationResult)

    return { response, validationResult, diagnostics }
  }
}

export function createMentorResponseOrchestrationService(
  overrides: Partial<MentorResponseOrchestrationServiceDependencies> = {},
): MentorResponseOrchestrationService {
  return new DefaultMentorResponseOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
