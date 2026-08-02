import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { buildRecommendationSet } from '../recommendationBuilder'
import type { RecommendationBuilderInputs } from '../recommendationBuilder'
import { orderRecommendationGroups } from '../recommendationOrdering'
import { validateRecommendationSet } from '../recommendationValidation'
import { generateRecommendationDiagnostics } from '../recommendationDiagnostics'
import type { RecommendationOrchestrationResult } from './RecommendationOrchestrationResult'
import type { RecommendationOrchestrationService } from './RecommendationOrchestrationService'

export type RecommendationOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): RecommendationOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements RecommendationOrchestrationService — builds the
// recommendation set, orders it (Priority, Strategy precedence,
// Execution sequence, Stable tie-breaking), validates it, and produces
// diagnostics, always returning all three together (same
// "diagnostics alongside output" pattern as
// `DefaultExecutionOrchestrationService`).
export class DefaultRecommendationOrchestrationService implements RecommendationOrchestrationService {
  constructor(private readonly dependencies: RecommendationOrchestrationServiceDependencies) {}

  generate(inputs: RecommendationBuilderInputs): RecommendationOrchestrationResult {
    const builtSet = buildRecommendationSet(inputs, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const recommendationSet = { ...builtSet, groups: orderRecommendationGroups(builtSet.groups, inputs.strategyResults) }
    const validationResult = validateRecommendationSet(recommendationSet, inputs.strategyResults, inputs.configurationFacts)
    const diagnostics = generateRecommendationDiagnostics(recommendationSet, validationResult)

    return { recommendationSet, validationResult, diagnostics }
  }
}

export function createRecommendationOrchestrationService(
  overrides: Partial<RecommendationOrchestrationServiceDependencies> = {},
): RecommendationOrchestrationService {
  return new DefaultRecommendationOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
