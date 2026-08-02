import type { ConfigurationEntry, MemoryConfiguration } from '../domain'
import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import type { ConfigurationSnapshot } from './ConfigurationSnapshot'
import type { ConfigurationSnapshotComparison, ConfigurationValueChange } from './ConfigurationSnapshotComparison'
import type { ConfigurationSnapshotService } from './ConfigurationSnapshotService'

export type ConfigurationSnapshotServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): ConfigurationSnapshotServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements ConfigurationSnapshotService.
export class DefaultConfigurationSnapshotService implements ConfigurationSnapshotService {
  constructor(private readonly dependencies: ConfigurationSnapshotServiceDependencies) {}

  createSnapshot(configuration: MemoryConfiguration, previousSnapshot: ConfigurationSnapshot | null): ConfigurationSnapshot {
    return {
      id: this.dependencies.idGenerator.generate(),
      configuration,
      version: previousSnapshot ? previousSnapshot.version + 1 : 1,
      capturedAt: this.dependencies.clock.now(),
    }
  }

  restoreSnapshot(snapshot: ConfigurationSnapshot): MemoryConfiguration {
    return { ...snapshot.configuration, entries: [...snapshot.configuration.entries] }
  }

  compareSnapshots(base: ConfigurationSnapshot, next: ConfigurationSnapshot): ConfigurationSnapshotComparison {
    const baseByKey = new Map(base.configuration.entries.map((entry) => [entry.key, entry.value]))
    const nextByKey = new Map(next.configuration.entries.map((entry) => [entry.key, entry.value]))

    const added: ConfigurationEntry[] = []
    const changed: ConfigurationValueChange[] = []
    const unchanged: ConfigurationEntry[] = []

    for (const entry of next.configuration.entries) {
      const beforeValue = baseByKey.get(entry.key)
      if (!baseByKey.has(entry.key)) {
        added.push(entry)
      } else if (beforeValue !== entry.value) {
        // `baseByKey.has(entry.key)` was just confirmed true, so
        // `beforeValue` is guaranteed defined here.
        changed.push({ key: entry.key, before: beforeValue!, after: entry.value })
      } else {
        unchanged.push(entry)
      }
    }

    const removed = base.configuration.entries.filter((entry) => !nextByKey.has(entry.key))

    return { added, removed, changed, unchanged }
  }
}

export function createConfigurationSnapshotService(
  overrides: Partial<ConfigurationSnapshotServiceDependencies> = {},
): ConfigurationSnapshotService {
  return new DefaultConfigurationSnapshotService({ ...createDefaultDependencies(), ...overrides })
}
