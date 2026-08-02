import type { ContextEntry, ContextSnapshot, SessionContext, SessionId } from '../domain'
import type { Clock, IdGenerator, SessionContextRepository } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { moveSessionToActive, moveSessionToClosed, moveSessionToSuspended } from '../lifecycle'
import type { ContextAssemblyEngine } from '../assembly'
import { createContextAssemblyEngine } from '../assembly'
import type { ContextWindowLimits, TrimmingStrategy } from '../window'
import { applyContextWindow } from '../window'
import type { ContextSnapshotService } from '../snapshot'
import { createContextSnapshotService, InvalidContextSnapshotError } from '../snapshot'
import { createSessionContextRepository, SessionContextNotFoundError } from '../repository'
import type { ContextOrchestrationService, InitializeSessionInput } from './ContextOrchestrationService'

export type ContextOrchestrationServiceDependencies = {
  repository: SessionContextRepository
  assemblyEngine: ContextAssemblyEngine
  snapshotService: ContextSnapshotService
  clock: Clock
  idGenerator: IdGenerator
  windowLimits: ContextWindowLimits
  trimmingStrategy: TrimmingStrategy
}

function createDefaultDependencies(): ContextOrchestrationServiceDependencies {
  return {
    repository: createSessionContextRepository(),
    assemblyEngine: createContextAssemblyEngine(),
    snapshotService: createContextSnapshotService(),
    clock: systemClock,
    idGenerator: randomIdGenerator,
    windowLimits: { maxEntries: null, maxPayloadSize: null },
    trimmingStrategy: 'drop-oldest',
  }
}

async function loadOrThrow(repository: SessionContextRepository, id: SessionId): Promise<SessionContext> {
  const context = await repository.load(id)
  if (!context) throw new SessionContextNotFoundError(id)
  return context
}

// Implements ContextOrchestrationService — composes every other piece
// this sprint built (lifecycle, assembly, window, snapshot,
// repository). No AI reasoning, no token estimation, no LLM calls
// anywhere in this class.
export class DefaultContextOrchestrationService implements ContextOrchestrationService {
  constructor(private readonly dependencies: ContextOrchestrationServiceDependencies) {}

  async initializeSession(input: InitializeSessionInput): Promise<SessionContext> {
    const now = this.dependencies.clock.now()

    const created: SessionContext = {
      id: this.dependencies.idGenerator.generate(),
      lifecycle: 'created',
      entries: [],
      metadata: { ownerId: input.ownerId, source: input.source, tags: input.tags ?? [] },
      createdAt: now,
      updatedAt: now,
    }

    const active = moveSessionToActive(created, now)
    await this.dependencies.repository.save(active)
    return active
  }

  async updateContext(sessionId: SessionId, incomingEntries: readonly ContextEntry[]): Promise<SessionContext> {
    const existing = await loadOrThrow(this.dependencies.repository, sessionId)

    const merged = this.dependencies.assemblyEngine.assemble(existing.entries, incomingEntries)
    const windowed = applyContextWindow(merged, this.dependencies.windowLimits, this.dependencies.trimmingStrategy)

    const updated: SessionContext = { ...existing, entries: windowed, updatedAt: this.dependencies.clock.now() }
    await this.dependencies.repository.save(updated)
    return updated
  }

  async suspendSession(sessionId: SessionId): Promise<SessionContext> {
    const existing = await loadOrThrow(this.dependencies.repository, sessionId)
    const suspended = moveSessionToSuspended(existing, this.dependencies.clock.now())
    await this.dependencies.repository.save(suspended)
    return suspended
  }

  async resumeSession(sessionId: SessionId): Promise<SessionContext> {
    const existing = await loadOrThrow(this.dependencies.repository, sessionId)
    const resumed = moveSessionToActive(existing, this.dependencies.clock.now())
    await this.dependencies.repository.save(resumed)
    return resumed
  }

  async closeSession(sessionId: SessionId): Promise<SessionContext> {
    const existing = await loadOrThrow(this.dependencies.repository, sessionId)
    // Validate legality via the same transition graph every other
    // lifecycle change uses (throws IllegalSessionContextLifecycleTransitionError
    // if `existing.lifecycle` cannot legally move to `closed`); the
    // returned value itself is discarded because the *mechanical*
    // write is delegated to the repository's own `archive()` — this is
    // what exercises "Archive session context" as a real repository
    // capability distinct from a generic `save()`.
    moveSessionToClosed(existing, this.dependencies.clock.now())
    return this.dependencies.repository.archive(sessionId)
  }

  async createSnapshot(sessionId: SessionId): Promise<ContextSnapshot> {
    const existing = await loadOrThrow(this.dependencies.repository, sessionId)
    return this.dependencies.snapshotService.createSnapshot(existing)
  }

  async restoreFromSnapshot(sessionId: SessionId, snapshot: ContextSnapshot): Promise<SessionContext> {
    if (!this.dependencies.snapshotService.validateSnapshotIntegrity(snapshot)) {
      throw new InvalidContextSnapshotError('snapshot failed integrity validation')
    }

    const existing = await loadOrThrow(this.dependencies.repository, sessionId)
    const restoredEntries = this.dependencies.snapshotService.restoreSnapshot(snapshot)
    const restored: SessionContext = { ...existing, entries: restoredEntries, updatedAt: this.dependencies.clock.now() }
    await this.dependencies.repository.save(restored)
    return restored
  }
}

export function createContextOrchestrationService(
  overrides: Partial<ContextOrchestrationServiceDependencies> = {},
): ContextOrchestrationService {
  return new DefaultContextOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
