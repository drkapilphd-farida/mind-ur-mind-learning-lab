import type { RetentionMetadata } from '../retentionDomain'

// Pure helpers shared by every eligibility check.
export function isCleanupExcluded(retentionMetadata: RetentionMetadata | null): boolean {
  return retentionMetadata?.cleanupExcluded ?? false
}

export function isRetentionExtended(retentionMetadata: RetentionMetadata | null, now: string): boolean {
  const until = retentionMetadata?.retentionExtendedUntil ?? null
  return until !== null && until > now
}
