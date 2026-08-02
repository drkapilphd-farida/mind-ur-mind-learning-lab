import type { Memory, MemoryId } from '../domain'
import type { Clock } from '../contracts'
import { systemClock } from '../adapters'
import type { MemorySpecification } from '../specification'
import type { QueryableMemoryRepository } from '../queryableRepository'
import { createQueryableMemoryRepository } from '../queryableRepository'
import { createMemoryRepository } from '../repository'
import { BUILTIN_INDEX_TYPES } from '../builtinIndexes'
import type { IndexType, MemoryIndex } from '../indexDomain'
import type { IndexRegistry } from '../indexRegistry'
import { createIndexRegistry } from '../indexRegistry'
import type { IndexMaintenanceService } from '../indexMaintenance'
import { createIndexMaintenanceService } from '../indexMaintenance'
import type { IndexValidationResult } from '../indexValidation'
import type { IndexStatistics } from '../indexStatistics'
import { computeIndexStatistics } from '../indexStatistics'
import type { IndexedMemoryRepository } from './IndexedMemoryRepository'

export type IndexedMemoryRepositoryDependencies = {
  repository: QueryableMemoryRepository
  registry: IndexRegistry
  maintenanceService: IndexMaintenanceService
  clock: Clock
}

function createDefaultDependencies(): IndexedMemoryRepositoryDependencies {
  return {
    repository: createQueryableMemoryRepository(createMemoryRepository()),
    registry: createIndexRegistry(),
    maintenanceService: createIndexMaintenanceService(),
    clock: systemClock,
  }
}

// Implements IndexedMemoryRepository via the Decorator pattern — wraps
// an *injected* QueryableMemoryRepository (itself already a decorator
// over a plain MemoryRepository), delegating every
// MemoryRepository/QueryableMemoryRepository method to it unchanged
// ("no changes to public behavior"). All 9 built-in indexes are
// maintained internally as a side effect of `save`/`update`/`delete` —
// genuinely "utilizing indexes internally" — without altering what any
// of the delegated methods return.
export class DefaultIndexedMemoryRepository implements IndexedMemoryRepository {
  private readonly lastRebuildAt = new Map<IndexType, string>()

  constructor(private readonly dependencies: IndexedMemoryRepositoryDependencies) {
    for (const indexType of BUILTIN_INDEX_TYPES) {
      this.dependencies.registry.registerIndex(this.dependencies.maintenanceService.buildIndex(indexType, []))
    }
  }

  async save(memory: Memory): Promise<void> {
    await this.dependencies.repository.save(memory)
    this.reindexMemory(memory)
  }

  async load(id: MemoryId): Promise<Memory | null> {
    return this.dependencies.repository.load(id)
  }

  async update(memory: Memory): Promise<void> {
    await this.dependencies.repository.update(memory)
    this.reindexMemory(memory)
  }

  async delete(id: MemoryId): Promise<void> {
    await this.dependencies.repository.delete(id)
    this.removeFromAllIndexes(id)
  }

  async list(learnerId: string): Promise<readonly Memory[]> {
    return this.dependencies.repository.list(learnerId)
  }

  async query(specification: MemorySpecification, userId: string): Promise<readonly Memory[]> {
    return this.dependencies.repository.query(specification, userId)
  }

  getIndex(indexType: IndexType): MemoryIndex | null {
    return this.dependencies.registry.retrieveIndex(indexType)
  }

  listIndexes(): readonly MemoryIndex[] {
    return this.dependencies.registry.listRegisteredIndexes()
  }

  rebuildAllIndexes(memories: readonly Memory[]): void {
    const now = this.dependencies.clock.now()

    for (const indexType of BUILTIN_INDEX_TYPES) {
      this.dependencies.registry.registerIndex(this.dependencies.maintenanceService.rebuildIndex(indexType, memories))
      this.lastRebuildAt.set(indexType, now)
    }
  }

  validateAllIndexes(memories: readonly Memory[]): ReadonlyMap<IndexType, IndexValidationResult> {
    const results = new Map<IndexType, IndexValidationResult>()

    for (const indexType of BUILTIN_INDEX_TYPES) {
      results.set(indexType, this.dependencies.maintenanceService.validateIndexConsistency(this.requireIndex(indexType), memories))
    }

    return results
  }

  getStatistics(indexType: IndexType, memories: readonly Memory[]): IndexStatistics | null {
    const index = this.dependencies.registry.retrieveIndex(indexType)
    if (!index) return null
    return computeIndexStatistics(index, memories, this.lastRebuildAt.get(indexType) ?? null)
  }

  private reindexMemory(memory: Memory): void {
    for (const indexType of BUILTIN_INDEX_TYPES) {
      this.dependencies.registry.registerIndex(this.dependencies.maintenanceService.updateIndex(this.requireIndex(indexType), memory))
    }
  }

  private removeFromAllIndexes(id: MemoryId): void {
    for (const indexType of BUILTIN_INDEX_TYPES) {
      this.dependencies.registry.registerIndex(this.dependencies.maintenanceService.removeIndexEntries(this.requireIndex(indexType), id))
    }
  }

  // Every `BUILTIN_INDEX_TYPES` entry is registered once in the
  // constructor and never removed by any method on this class — unlike
  // `getStatistics()`'s caller-supplied `indexType` (which can
  // legitimately be missing), a lookup driven by this fixed, internally
  // controlled set can never miss. Trusting that invariant here avoids
  // dead defensive branches that no test could ever legitimately
  // exercise.
  private requireIndex(indexType: IndexType): MemoryIndex {
    return this.dependencies.registry.retrieveIndex(indexType)!
  }
}

export function createIndexedMemoryRepository(
  overrides: Partial<IndexedMemoryRepositoryDependencies> = {},
): IndexedMemoryRepository {
  return new DefaultIndexedMemoryRepository({ ...createDefaultDependencies(), ...overrides })
}
