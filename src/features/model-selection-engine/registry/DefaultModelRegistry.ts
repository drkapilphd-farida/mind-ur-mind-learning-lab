import { validateModelRegistration } from '../validation'
import type { ModelCatalogEntry, ModelSelectionValidation } from '../types'
import type { ModelRegistry } from './ModelRegistry'

// In-memory catalog-entry store, keyed by model id — same
// "self-contained registry" discipline as
// `provider-selection-engine/registry/DefaultProviderSelectionRegistry.ts`.
export class DefaultModelRegistry implements ModelRegistry {
  private readonly entries = new Map<string, ModelCatalogEntry>()

  register(entry: ModelCatalogEntry): ModelSelectionValidation {
    const validationResult = validateModelRegistration(Array.from(this.entries.keys()), entry.metadata.id)

    if (validationResult.valid) {
      this.entries.set(entry.metadata.id, entry)
    }

    return validationResult
  }

  get(modelId: string): ModelCatalogEntry | undefined {
    return this.entries.get(modelId)
  }

  list(): readonly ModelCatalogEntry[] {
    return Array.from(this.entries.values())
  }

  listByProvider(providerId: string): readonly ModelCatalogEntry[] {
    return this.list().filter((entry) => entry.metadata.providerId === providerId)
  }

  has(modelId: string): boolean {
    return this.entries.has(modelId)
  }
}

export function createModelRegistry(): ModelRegistry {
  return new DefaultModelRegistry()
}
