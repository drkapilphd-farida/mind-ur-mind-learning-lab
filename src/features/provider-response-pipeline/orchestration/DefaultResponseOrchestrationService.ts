import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { normalizeProviderResponse } from '../translation'
import { buildResponseNormalizationInputs } from '../integration'
import type { ResponseOrchestrationInputs } from '../integration'
import { validateProviderExecutionResponse } from '../validation'
import { generateProviderResponseDiagnostics } from '../diagnostics'
import type { ResponseOrchestrationResult } from './ResponseOrchestrationResult'
import type { ResponseOrchestrationService } from './ResponseOrchestrationService'

export type ResponseOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): ResponseOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements ResponseOrchestrationService — reduces the raw
// cross-feature inputs, normalizes the provider-specific response,
// validates it against the originating request's own version, and
// produces diagnostics, always returning all three together.
export class DefaultResponseOrchestrationService implements ResponseOrchestrationService {
  constructor(private readonly dependencies: ResponseOrchestrationServiceDependencies) {}

  generate(inputs: ResponseOrchestrationInputs): ResponseOrchestrationResult {
    const { rawResponse, normalizationInputs } = buildResponseNormalizationInputs(inputs)
    const response = normalizeProviderResponse(rawResponse, normalizationInputs, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const validationResult = validateProviderExecutionResponse(response, inputs.executionRequest.version, inputs.configurationFacts)
    const diagnostics = generateProviderResponseDiagnostics(response, validationResult)

    return { response, validationResult, diagnostics }
  }
}

export function createResponseOrchestrationService(
  overrides: Partial<ResponseOrchestrationServiceDependencies> = {},
): ResponseOrchestrationService {
  return new DefaultResponseOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
