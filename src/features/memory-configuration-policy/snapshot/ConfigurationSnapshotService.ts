import type { MemoryConfiguration } from '../domain'
import type { ConfigurationSnapshot } from './ConfigurationSnapshot'
import type { ConfigurationSnapshotComparison } from './ConfigurationSnapshotComparison'

// "Create snapshot, Restore snapshot, Compare snapshots, Version
// snapshots. Snapshots must be immutable." `createSnapshot`'s
// `previousSnapshot` parameter is what "Version snapshots" means here
// — passing the prior snapshot in a chain deterministically increments
// the version; passing `null` starts a new chain at version 1.
export interface ConfigurationSnapshotService {
  createSnapshot(configuration: MemoryConfiguration, previousSnapshot: ConfigurationSnapshot | null): ConfigurationSnapshot
  restoreSnapshot(snapshot: ConfigurationSnapshot): MemoryConfiguration
  compareSnapshots(base: ConfigurationSnapshot, next: ConfigurationSnapshot): ConfigurationSnapshotComparison
}
