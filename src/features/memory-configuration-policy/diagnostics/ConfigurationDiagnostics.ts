import type { MemoryConfiguration } from '../domain'

// Immutable — every field `readonly`. "Active profile, Effective
// configuration, Override count, Validation status, Configuration
// version... Diagnostics only" — never used to drive resolution
// behavior, only observed.
export type ConfigurationDiagnostics = {
  readonly activeProfileId: string | null
  readonly effectiveConfiguration: MemoryConfiguration
  readonly overrideCount: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly configurationVersion: number
}
