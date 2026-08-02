import type { PersonalizationStrategy, StrategyId } from '../strategyDomain'
import type { StrategyValidationResult } from '../strategyValidation'
import { validateStrategyDefinition } from '../strategyValidation'
import type { StrategyRegistry } from './StrategyRegistry'

// Implements StrategyRegistry — a private `Map<StrategyId, PersonalizationStrategy>`,
// the same in-memory registry convention as
// `policyRegistry/DefaultPolicyRegistry.ts`.
export class DefaultStrategyRegistry implements StrategyRegistry {
  private readonly strategies = new Map<StrategyId, PersonalizationStrategy>()

  registerStrategy(strategy: PersonalizationStrategy): void {
    this.strategies.set(strategy.id, strategy)
  }

  removeStrategy(id: StrategyId): void {
    this.strategies.delete(id)
  }

  resolveStrategy(id: StrategyId): PersonalizationStrategy | null {
    return this.strategies.get(id) ?? null
  }

  listStrategies(): readonly PersonalizationStrategy[] {
    return [...this.strategies.values()]
  }

  validateStrategyDefinition(strategy: PersonalizationStrategy): StrategyValidationResult {
    return validateStrategyDefinition(strategy)
  }
}

export function createStrategyRegistry(): StrategyRegistry {
  return new DefaultStrategyRegistry()
}
