import type { ModelRegistry } from '../registry'
import type { ModelSelectionResolver } from '../resolution'
import type { ModelSelectionOutcome, ModelSelectionRequest } from '../types'
import type { ModelSelectionEngine } from './ModelSelectionEngine'

// "Selection Rules" (§ brief): try the strict default resolver first;
// if it finds nothing, try the relaxed fallback resolver; if that also
// finds nothing (including an empty registry, or no models registered
// for the requested provider at all), the request is unresolvable —
// `resolutionPath: 'none'`, never a thrown exception.
// `resolutionPath: 'preferred'` marks the case where the caller's own
// `preferredModelId` was actually honored, distinct from `'default'`
// (the engine picked on its own).
export class DefaultModelSelectionEngine implements ModelSelectionEngine {
  constructor(
    private readonly registry: ModelRegistry,
    private readonly defaultResolver: ModelSelectionResolver,
    private readonly fallbackResolver: ModelSelectionResolver,
  ) {}

  select(request: ModelSelectionRequest): ModelSelectionOutcome {
    const candidates = this.registry.list()

    const defaultMatch = this.defaultResolver.resolve(candidates, request)
    if (defaultMatch) {
      const resolutionPath = request.preferredModelId === defaultMatch.metadata.id ? 'preferred' : 'default'
      return {
        selectedModelId: defaultMatch.metadata.id,
        resolutionPath,
        reason: resolutionPath === 'preferred' ? 'The preferred model satisfied the request.' : 'The highest-priority usable model satisfied the request.',
      }
    }

    const fallbackMatch = this.fallbackResolver.resolve(candidates, request)
    if (fallbackMatch) {
      return { selectedModelId: fallbackMatch.metadata.id, resolutionPath: 'fallback', reason: 'No model fully satisfied the request; falling back to any usable model for this provider.' }
    }

    return { selectedModelId: null, resolutionPath: 'none', reason: 'No registered model is usable for the requested provider.' }
  }
}

export function createModelSelectionEngine(registry: ModelRegistry, defaultResolver: ModelSelectionResolver, fallbackResolver: ModelSelectionResolver): ModelSelectionEngine {
  return new DefaultModelSelectionEngine(registry, defaultResolver, fallbackResolver)
}
