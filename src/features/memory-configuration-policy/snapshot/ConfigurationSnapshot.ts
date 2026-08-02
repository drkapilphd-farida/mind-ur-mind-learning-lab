import type { MemoryConfiguration } from '../domain'

// Immutable — every field `readonly`. "Snapshots must be immutable" —
// never mutated after creation. "Version snapshots" (Section 5): each
// snapshot's `version` is deterministically derived from the previous
// snapshot in its chain (see `createConfigurationSnapshot.ts`), not a
// freestanding capability.
export type ConfigurationSnapshot = {
  readonly id: string
  readonly configuration: MemoryConfiguration
  readonly version: number
  readonly capturedAt: string
}
