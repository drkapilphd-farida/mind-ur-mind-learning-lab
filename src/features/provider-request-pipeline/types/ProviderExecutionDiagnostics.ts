import type { ProviderExecutionProfileId } from './ProviderExecutionProfileId'

// "Request completeness, Provider profile, Validation status,
// Configuration version" — the Sprint 32 brief's own Section 7 list,
// verbatim. Placed here in `types/`, not `../diagnostics/`, per the
// brief's own explicit Section 1 listing of `ProviderExecutionDiagnostics`
// as one of the 5 domain models — the *generator function* still lives
// in `../diagnostics/`, matching every prior sprint's convention.
// Immutable — every field `readonly`.
export type ProviderExecutionDiagnostics = {
  readonly requestCompleteness: 'complete' | 'partial' | 'empty'
  readonly providerProfile: ProviderExecutionProfileId
  readonly validationStatus: 'valid' | 'invalid'
  readonly configurationVersion: number
}
