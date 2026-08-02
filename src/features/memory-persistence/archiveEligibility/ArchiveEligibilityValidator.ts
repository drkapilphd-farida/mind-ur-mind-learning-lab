import type { Memory } from '../domain'
import type { RetentionMetadata } from '../retentionDomain'

// "Validate whether memories are eligible for: Archive, Permanent
// deletion, Retention extension, Cleanup exclusion. All decisions must
// be deterministic." Every method is a pure boolean decision — no AI,
// no scoring.
export interface ArchiveEligibilityValidator {
  isEligibleForArchive(memory: Memory, retentionMetadata: RetentionMetadata | null): boolean
  isEligibleForDeletion(memory: Memory, retentionMetadata: RetentionMetadata | null, now: string): boolean
  isEligibleForRetentionExtension(memory: Memory): boolean
  isEligibleForCleanupExclusion(memory: Memory): boolean
}
