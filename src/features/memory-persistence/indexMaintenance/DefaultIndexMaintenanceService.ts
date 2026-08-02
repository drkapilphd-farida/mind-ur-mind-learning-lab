import type { Memory, MemoryId } from '../domain'
import type { Clock } from '../contracts'
import { systemClock } from '../adapters'
import type { IndexType, MemoryIndex } from '../indexDomain'
import type { IndexValidationResult } from '../indexValidation'
import { validateIndexConsistency } from '../indexValidation'
import { buildMemoryIndex } from './buildMemoryIndex'
import { updateMemoryIndex } from './updateMemoryIndex'
import { removeMemoryFromIndex } from './removeMemoryFromIndex'
import { rebuildMemoryIndex } from './rebuildMemoryIndex'
import type { IndexMaintenanceService } from './IndexMaintenanceService'

export type IndexMaintenanceServiceDependencies = {
  clock: Clock
}

function createDefaultDependencies(): IndexMaintenanceServiceDependencies {
  return { clock: systemClock }
}

// Implements IndexMaintenanceService — a thin, stateless wrapper around
// this folder's pure functions (buildMemoryIndex, updateMemoryIndex,
// removeMemoryFromIndex, rebuildMemoryIndex) plus the shared
// validateIndexConsistency function, supplying `now` from the injected
// Clock so every operation stays deterministic under test.
export class DefaultIndexMaintenanceService implements IndexMaintenanceService {
  constructor(private readonly dependencies: IndexMaintenanceServiceDependencies) {}

  buildIndex(indexType: IndexType, memories: readonly Memory[]): MemoryIndex {
    return buildMemoryIndex(indexType, memories, this.dependencies.clock.now())
  }

  updateIndex(index: MemoryIndex, memory: Memory): MemoryIndex {
    return updateMemoryIndex(index, memory, this.dependencies.clock.now())
  }

  removeIndexEntries(index: MemoryIndex, memoryId: MemoryId): MemoryIndex {
    return removeMemoryFromIndex(index, memoryId, this.dependencies.clock.now())
  }

  rebuildIndex(indexType: IndexType, memories: readonly Memory[]): MemoryIndex {
    return rebuildMemoryIndex(indexType, memories, this.dependencies.clock.now())
  }

  validateIndexConsistency(index: MemoryIndex, memories: readonly Memory[]): IndexValidationResult {
    return validateIndexConsistency(index, memories)
  }
}

export function createIndexMaintenanceService(
  overrides: Partial<IndexMaintenanceServiceDependencies> = {},
): IndexMaintenanceService {
  return new DefaultIndexMaintenanceService({ ...createDefaultDependencies(), ...overrides })
}
