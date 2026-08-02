import type { Memory } from '../domain'
import type { RetentionMetadata } from '../retentionDomain'
import { isCleanupExcluded, isRetentionExtended } from './retentionMetadataHelpers'
import type { ArchiveEligibilityValidator } from './ArchiveEligibilityValidator'

// Implements ArchiveEligibilityValidator.
//
// - Archive: only currently `active` memories, and never a
//   cleanup-excluded one (archiving is reversible, so pin status alone
//   doesn't block it).
// - Deletion: never `deleted` already, never pinned, never
//   cleanup-excluded, and never under an active retention extension —
//   deletion is the one irreversible action, so it gets every
//   available safeguard.
// - Retention extension / cleanup exclusion: broadly available
//   protective actions — anything short of already-`deleted` can
//   receive either.
export class DefaultArchiveEligibilityValidator implements ArchiveEligibilityValidator {
  isEligibleForArchive(memory: Memory, retentionMetadata: RetentionMetadata | null): boolean {
    return memory.lifecycle === 'active' && !isCleanupExcluded(retentionMetadata)
  }

  isEligibleForDeletion(memory: Memory, retentionMetadata: RetentionMetadata | null, now: string): boolean {
    return (
      memory.lifecycle !== 'deleted' &&
      !memory.pinned &&
      !isCleanupExcluded(retentionMetadata) &&
      !isRetentionExtended(retentionMetadata, now)
    )
  }

  isEligibleForRetentionExtension(memory: Memory): boolean {
    return memory.lifecycle !== 'deleted'
  }

  isEligibleForCleanupExclusion(memory: Memory): boolean {
    return memory.lifecycle !== 'deleted'
  }
}

export function createArchiveEligibilityValidator(): ArchiveEligibilityValidator {
  return new DefaultArchiveEligibilityValidator()
}
