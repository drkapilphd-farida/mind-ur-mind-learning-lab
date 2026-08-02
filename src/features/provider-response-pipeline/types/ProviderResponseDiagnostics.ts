import type { ProviderResponseProfileId } from './ProviderResponseProfileId'

// "Response completeness, Provider profile, Validation status,
// Response version" — the Sprint 33 brief's own Section 7 list,
// verbatim. Placed here in `types/`, not `../diagnostics/`, per the
// brief's own explicit Section 1 listing of `ProviderResponseDiagnostics`
// as one of the 5 domain models — same deliberate deviation Sprint 32
// already applied to `ProviderExecutionDiagnostics`. The *generator
// function* still lives in `../diagnostics/`. Immutable — every field
// `readonly`.
export type ProviderResponseDiagnostics = {
  readonly responseCompleteness: 'complete' | 'partial' | 'empty'
  readonly providerProfile: ProviderResponseProfileId
  readonly validationStatus: 'valid' | 'invalid'
  readonly responseVersion: number
}
