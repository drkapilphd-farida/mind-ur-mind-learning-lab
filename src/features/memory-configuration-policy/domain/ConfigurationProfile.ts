import type { ConfigurationEntry } from './ConfigurationEntry'

// Immutable — every field `readonly`. A named, registerable override
// set — "Policy" (Section 2) and "Profile" (Section 1/3) are the same
// concept in this sprint's model: Section 1 lists no separate "Policy"
// domain type, so the Policy Registry manages `ConfigurationProfile`
// values directly.
export type ConfigurationProfile = {
  readonly id: string
  readonly name: string
  readonly entries: readonly ConfigurationEntry[]
}
