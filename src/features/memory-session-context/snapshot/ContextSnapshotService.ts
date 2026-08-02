import type { ContextEntry, ContextSnapshot, SessionContext } from '../domain'
import type { SnapshotComparison } from './SnapshotComparison'

// "Create snapshot, Restore snapshot, Compare snapshots, Validate
// snapshot integrity. Snapshots must be immutable." — every method is
// pure/deterministic given its inputs; only `createSnapshot` needs
// injected id/time generation (see DefaultContextSnapshotService).
export interface ContextSnapshotService {
  createSnapshot(context: SessionContext): ContextSnapshot
  restoreSnapshot(snapshot: ContextSnapshot): readonly ContextEntry[]
  compareSnapshots(base: ContextSnapshot, next: ContextSnapshot): SnapshotComparison
  validateSnapshotIntegrity(snapshot: ContextSnapshot): boolean
}
