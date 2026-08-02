import type { AIModel } from '../types'
import type { ModelSelectionStrategy } from '../contracts'
import { UnknownModelError } from '../adapters'

// Implements ModelSelectionStrategy with a plain exact-id lookup —
// reuses Chunk 1's UnknownModelError rather than a near-duplicate
// local class ("no duplicated logic").
export class DefaultModelSelectionStrategy implements ModelSelectionStrategy {
  selectModel(models: readonly AIModel[], modelId: string, providerId: string): AIModel {
    const model = models.find((candidate) => candidate.id === modelId)
    if (!model) throw new UnknownModelError(providerId, modelId)
    return model
  }
}

export function createModelSelectionStrategy(): ModelSelectionStrategy {
  return new DefaultModelSelectionStrategy()
}
