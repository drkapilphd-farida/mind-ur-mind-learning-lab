import type { ContextEntry, ContextSnapshot, SessionContext } from '../domain'
import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import type { ContextSnapshotService } from './ContextSnapshotService'
import type { SnapshotComparison } from './SnapshotComparison'

export type ContextSnapshotServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): ContextSnapshotServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements ContextSnapshotService. `createSnapshot` copies
// `context.entries` into a brand-new array (never the same reference)
// so a later bug elsewhere mutating a live SessionContext can never
// retroactively change an already-captured snapshot — "snapshots must
// be immutable."
export class DefaultContextSnapshotService implements ContextSnapshotService {
  constructor(private readonly dependencies: ContextSnapshotServiceDependencies) {}

  createSnapshot(context: SessionContext): ContextSnapshot {
    return {
      id: this.dependencies.idGenerator.generate(),
      sessionId: context.id,
      entries: [...context.entries],
      capturedAt: this.dependencies.clock.now(),
    }
  }

  restoreSnapshot(snapshot: ContextSnapshot): readonly ContextEntry[] {
    return [...snapshot.entries]
  }

  compareSnapshots(base: ContextSnapshot, next: ContextSnapshot): SnapshotComparison {
    const baseIds = new Set(base.entries.map((entry) => entry.id))
    const nextIds = new Set(next.entries.map((entry) => entry.id))

    return {
      added: next.entries.filter((entry) => !baseIds.has(entry.id)),
      removed: base.entries.filter((entry) => !nextIds.has(entry.id)),
      unchanged: next.entries.filter((entry) => baseIds.has(entry.id)),
    }
  }

  validateSnapshotIntegrity(snapshot: ContextSnapshot): boolean {
    if (snapshot.id.trim().length === 0) return false
    if (snapshot.sessionId.trim().length === 0) return false
    if (snapshot.capturedAt.trim().length === 0) return false

    const seenIds = new Set<string>()
    for (const entry of snapshot.entries) {
      if (seenIds.has(entry.id)) return false
      seenIds.add(entry.id)
    }

    return true
  }
}

export function createContextSnapshotService(overrides: Partial<ContextSnapshotServiceDependencies> = {}): ContextSnapshotService {
  return new DefaultContextSnapshotService({ ...createDefaultDependencies(), ...overrides })
}
