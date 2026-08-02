import type { MemoryConfiguration } from '../domain'
import type { ConfigurationRepository } from '../contracts'

// Implements ConfigurationRepository — this sprint's one shipped
// implementation, entirely in-memory (a private Map). Every method is
// `async` even though nothing here actually awaits, so a future real
// implementation is a pure swap, never a signature change. No error
// paths needed: `save()` is a plain upsert, `retrieve()` returns
// `null` for an unknown id rather than throwing — there's no
// update/delete/archive verb here that could legitimately fail against
// a missing record.
export class InMemoryConfigurationRepository implements ConfigurationRepository {
  private readonly records = new Map<string, MemoryConfiguration>()

  async save(configuration: MemoryConfiguration): Promise<void> {
    this.records.set(configuration.id, configuration)
  }

  async retrieve(id: string): Promise<MemoryConfiguration | null> {
    return this.records.get(id) ?? null
  }
}

export function createConfigurationRepository(): ConfigurationRepository {
  return new InMemoryConfigurationRepository()
}
