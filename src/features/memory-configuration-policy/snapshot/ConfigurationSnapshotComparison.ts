import type { ConfigurationEntry, ConfigurationKey, ConfigurationValue } from '../domain'

export type ConfigurationValueChange = {
  readonly key: ConfigurationKey
  readonly before: ConfigurationValue
  readonly after: ConfigurationValue
}

// Immutable — every field `readonly`. Entries are compared by key;
// `changed` (a same-key, different-value pair) is a distinctly
// meaningful category for configuration — unlike a plain add/remove
// diff, most real snapshot comparisons here will be value changes to
// keys that existed in both snapshots.
export type ConfigurationSnapshotComparison = {
  readonly added: readonly ConfigurationEntry[]
  readonly removed: readonly ConfigurationEntry[]
  readonly changed: readonly ConfigurationValueChange[]
  readonly unchanged: readonly ConfigurationEntry[]
}
