import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { assembleMentorContext } from '../contextAssembly'
import { buildMentorContextAssemblyInputs } from '../integration'
import type { MentorContextOrchestrationInputs } from '../integration'
import { validateMentorContext } from '../validation'
import { generateMentorContextDiagnostics } from '../diagnostics'
import type { MentorContextOrchestrationResult } from './MentorContextOrchestrationResult'
import type { MentorContextOrchestrationService } from './MentorContextOrchestrationService'

export type MentorContextOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): MentorContextOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements MentorContextOrchestrationService — collects and reduces
// the raw cross-feature inputs, assembles the snapshot, validates it,
// and produces diagnostics, always returning all three together.
export class DefaultMentorContextOrchestrationService implements MentorContextOrchestrationService {
  constructor(private readonly dependencies: MentorContextOrchestrationServiceDependencies) {}

  generate(inputs: MentorContextOrchestrationInputs): MentorContextOrchestrationResult {
    const { assemblyInputs, presence } = buildMentorContextAssemblyInputs(inputs)
    const snapshot = assembleMentorContext(assemblyInputs, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const validationResult = validateMentorContext(snapshot, presence, inputs.configurationFacts)
    const diagnostics = generateMentorContextDiagnostics(snapshot, presence, validationResult)

    return { snapshot, validationResult, diagnostics }
  }
}

export function createMentorContextOrchestrationService(
  overrides: Partial<MentorContextOrchestrationServiceDependencies> = {},
): MentorContextOrchestrationService {
  return new DefaultMentorContextOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
