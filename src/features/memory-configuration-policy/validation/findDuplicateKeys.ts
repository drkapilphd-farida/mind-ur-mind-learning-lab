import type { ConfigurationEntry, ConfigurationKey } from '../domain'

// Pure — returns every key that appears more than once in the given
// entries (each duplicate key reported once). A `ConfigurationEntry[]`
// can carry duplicates structurally (unlike a `Record`), which is
// exactly what makes this check meaningful — see `ConfigurationEntry.ts`.
export function findDuplicateKeys(entries: readonly ConfigurationEntry[]): readonly ConfigurationKey[] {
  const seen = new Set<ConfigurationKey>()
  const duplicates = new Set<ConfigurationKey>()

  for (const entry of entries) {
    if (seen.has(entry.key)) duplicates.add(entry.key)
    seen.add(entry.key)
  }

  return [...duplicates]
}
