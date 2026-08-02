import type { ConfigurationEntry } from './ConfigurationEntry'
import type { ConfigurationMetadata } from './ConfigurationMetadata'

// The core immutable configuration model — every field `readonly`.
// "Resolution must always produce a single immutable configuration" —
// every transformation (resolution, snapshot restore) returns a *new*
// MemoryConfiguration value, never mutates one in place. `id` gives
// every resolved configuration its own persistence identity (see
// `contracts/ConfigurationRepository.ts`).
export type MemoryConfiguration = {
  readonly id: string
  readonly entries: readonly ConfigurationEntry[]
  readonly metadata: ConfigurationMetadata
}
