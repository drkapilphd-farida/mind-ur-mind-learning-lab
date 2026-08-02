import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { buildProviderExecutionRequest } from '../pipeline'
import { buildPipelineInputs } from '../integration'
import type { PipelineOrchestrationInputs } from '../integration'
import { validateProviderExecutionRequest } from '../validation'
import { generateProviderExecutionDiagnostics } from '../diagnostics'
import type { PipelineOrchestrationResult } from './PipelineOrchestrationResult'
import type { PipelineOrchestrationService } from './PipelineOrchestrationService'

export type PipelineOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): PipelineOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements PipelineOrchestrationService — reduces the raw
// cross-feature inputs, resolves configuration and builds the
// execution-ready request, validates it, and produces diagnostics,
// always returning all three together.
export class DefaultPipelineOrchestrationService implements PipelineOrchestrationService {
  constructor(private readonly dependencies: PipelineOrchestrationServiceDependencies) {}

  generate(inputs: PipelineOrchestrationInputs): PipelineOrchestrationResult {
    const pipelineInputs = buildPipelineInputs(inputs)
    const request = buildProviderExecutionRequest(pipelineInputs, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const validationResult = validateProviderExecutionRequest(request, inputs.configurationFacts)
    const diagnostics = generateProviderExecutionDiagnostics(request, validationResult)

    return { request, validationResult, diagnostics }
  }
}

export function createPipelineOrchestrationService(
  overrides: Partial<PipelineOrchestrationServiceDependencies> = {},
): PipelineOrchestrationService {
  return new DefaultPipelineOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
