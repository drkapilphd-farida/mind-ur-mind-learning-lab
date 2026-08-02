import type { ConfigurationKey } from './ConfigurationKey'
import type { ConfigurationValue } from './ConfigurationValue'

// One key/value pair. A plain array of these (never a `Map`/`Record`)
// is this feature's public representation of "a set of configuration
// values" — the same "public models are arrays" convention used
// throughout this whole session (e.g.
// `@/features/memory-persistence/indexDomain/IndexEntry.ts`,
// independently mirrored, not imported — "No cross-feature imports").
// This is also what makes "Duplicate keys" (Section 4) directly,
// structurally checkable — a `Record` could never carry a duplicate
// key in the first place.
export type ConfigurationEntry = {
  readonly key: ConfigurationKey
  readonly value: ConfigurationValue
}
