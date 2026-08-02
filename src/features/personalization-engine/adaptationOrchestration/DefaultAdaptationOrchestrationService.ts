import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { evaluateAdaptations } from '../adaptationEvaluation'
import type { AdaptationEvaluatorInputs } from '../adaptationEvaluation'
import { validateAdaptation } from '../adaptationValidation'
import { generateAdaptationDiagnostics } from '../adaptationDiagnostics'
import type { AdaptationOrchestrationResult } from './AdaptationOrchestrationResult'
import type { AdaptationOrchestrationService } from './AdaptationOrchestrationService'

export type AdaptationOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): AdaptationOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements AdaptationOrchestrationService — evaluates the adaptation,
// validates it against the profile it was evaluated for, and produces
// diagnostics, always returning all three together.
export class DefaultAdaptationOrchestrationService implements AdaptationOrchestrationService {
  constructor(private readonly dependencies: AdaptationOrchestrationServiceDependencies) {}

  generate(inputs: AdaptationEvaluatorInputs): AdaptationOrchestrationResult {
    const adaptation = evaluateAdaptations(inputs, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const validationResult = validateAdaptation(adaptation, inputs.profile.id, inputs.configurationFacts)
    const diagnostics = generateAdaptationDiagnostics(adaptation, validationResult)

    return { adaptation, validationResult, diagnostics }
  }
}

export function createAdaptationOrchestrationService(
  overrides: Partial<AdaptationOrchestrationServiceDependencies> = {},
): AdaptationOrchestrationService {
  return new DefaultAdaptationOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
