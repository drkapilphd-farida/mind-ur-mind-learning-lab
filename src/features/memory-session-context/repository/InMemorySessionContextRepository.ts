import type { SessionContext, SessionId } from '../domain'
import type { Clock, SessionContextRepository } from '../contracts'
import { systemClock } from '../adapters'
import { SessionContextNotFoundError } from './SessionContextNotFoundError'

// Implements SessionContextRepository — this sprint's one shipped
// implementation, entirely in-memory (a private Map). Every method is
// `async` even though nothing here actually awaits, so a future real
// (e.g. Supabase-backed) implementation is a pure swap, never a
// signature change. `archive()` is mechanical only — it flips
// `lifecycle` to `'closed'` (and bumps `updatedAt` via the injected
// Clock, the one piece of infra-level bookkeeping a persistence layer
// is expected to own) without validating whether that transition is
// legal from the record's current state; that validation is
// `DefaultContextOrchestrationService`'s job ("business rules remain
// outside repository implementations").
export class InMemorySessionContextRepository implements SessionContextRepository {
  private readonly records = new Map<SessionId, SessionContext>()

  constructor(private readonly clock: Clock) {}

  async save(context: SessionContext): Promise<void> {
    this.records.set(context.id, context)
  }

  async load(id: SessionId): Promise<SessionContext | null> {
    return this.records.get(id) ?? null
  }

  async archive(id: SessionId): Promise<SessionContext> {
    const existing = this.records.get(id)
    if (!existing) throw new SessionContextNotFoundError(id)

    const archived: SessionContext = { ...existing, lifecycle: 'closed', updatedAt: this.clock.now() }
    this.records.set(id, archived)
    return archived
  }

  async delete(id: SessionId): Promise<void> {
    if (!this.records.has(id)) throw new SessionContextNotFoundError(id)
    this.records.delete(id)
  }
}

export function createSessionContextRepository(clock: Clock = systemClock): SessionContextRepository {
  return new InMemorySessionContextRepository(clock)
}
