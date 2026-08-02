import type { StrategyRegistry } from '../strategyRegistry'
import { createStrategyRegistry } from '../strategyRegistry'
import type { StrategyEvaluationInputs } from '../strategyEvaluation'
import { selectStrategies } from '../strategySelection'
import { validateStrategySet } from '../strategyValidation'
import type { StrategyOrchestrationResult } from './StrategyOrchestrationResult'
import type { StrategyOrchestrationService } from './StrategyOrchestrationService'

export type StrategyOrchestrationServiceDependencies = {
  registry: StrategyRegistry
}

function createDefaultDependencies(): StrategyOrchestrationServiceDependencies {
  return { registry: createStrategyRegistry() }
}

// Implements StrategyOrchestrationService — loads every registered
// strategy, validates the set as a whole, and selects results from it.
// Selection never depends on the set being valid (see
// `strategyDomain/PersonalizationStrategy.ts`'s own note that
// `dependsOnStrategyIds` is purely structural) — a caller inspects
// `validationResult` independently of `results`, exactly like every
// other "diagnostics alongside output" pattern in this feature's
// sibling sprints.
export class DefaultStrategyOrchestrationService implements StrategyOrchestrationService {
  constructor(private readonly dependencies: StrategyOrchestrationServiceDependencies) {}

  execute(inputs: StrategyEvaluationInputs): StrategyOrchestrationResult {
    const strategies = this.dependencies.registry.listStrategies()
    const validationResult = validateStrategySet(strategies)
    const results = selectStrategies(strategies, inputs)

    return { results, validationResult }
  }
}

export function createStrategyOrchestrationService(
  overrides: Partial<StrategyOrchestrationServiceDependencies> = {},
): StrategyOrchestrationService {
  return new DefaultStrategyOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
