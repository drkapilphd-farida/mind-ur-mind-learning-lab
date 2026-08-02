import type { PersonalizationDecision } from '../domain'
import type { PersonalizationStrategy } from '../strategyDomain'

// Pure — describes whether a selected strategy's outcome echoes a
// prior decision (real, deterministic use of the "Personalization
// Decisions" evaluation input, per Section 3) or is a fresh
// recommendation.
export function describeSelectionReason(strategy: PersonalizationStrategy, decisions: readonly PersonalizationDecision[]): string {
  const priorMatch = decisions
    .flatMap((decision) => decision.recommendations)
    .find((recommendation) => recommendation.decisionType === strategy.type && recommendation.value === strategy.outcomeValue)

  return priorMatch
    ? `Confirms prior recommendation for "${strategy.type}".`
    : `New recommendation for "${strategy.type}" (priority ${strategy.priority}).`
}
