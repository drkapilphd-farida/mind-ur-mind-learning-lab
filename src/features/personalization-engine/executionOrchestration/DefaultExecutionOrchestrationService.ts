import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { generateExecutionPlan } from '../executionPlanning'
import type { ExecutionPlannerInputs } from '../executionPlanning'
import { validateExecutionPlan } from '../executionValidation'
import { generateExecutionDiagnostics } from '../executionDiagnostics'
import type { ExecutionOrchestrationResult } from './ExecutionOrchestrationResult'
import type { ExecutionOrchestrationService } from './ExecutionOrchestrationService'

export type ExecutionOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): ExecutionOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements ExecutionOrchestrationService — generates the plan,
// validates it, and produces diagnostics, always returning all three
// together (same "diagnostics alongside output" pattern as
// `DefaultStrategyOrchestrationService`).
export class DefaultExecutionOrchestrationService implements ExecutionOrchestrationService {
  constructor(private readonly dependencies: ExecutionOrchestrationServiceDependencies) {}

  generate(inputs: ExecutionPlannerInputs): ExecutionOrchestrationResult {
    const plan = generateExecutionPlan(inputs, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const validationResult = validateExecutionPlan(plan, inputs.configurationFacts)
    const diagnostics = generateExecutionDiagnostics(plan, validationResult)

    return { plan, validationResult, diagnostics }
  }
}

export function createExecutionOrchestrationService(
  overrides: Partial<ExecutionOrchestrationServiceDependencies> = {},
): ExecutionOrchestrationService {
  return new DefaultExecutionOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
