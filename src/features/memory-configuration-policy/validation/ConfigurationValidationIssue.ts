// "Required values, Invalid values, Duplicate keys, Unsupported
// overrides" — the Sprint 20 brief's own four named validation checks
// (its fifth, "Configuration consistency", is the overall result — see
// `ConfigurationValidationResult.ts`).
export type ConfigurationValidationIssueType = 'required-value-missing' | 'invalid-value' | 'duplicate-key' | 'unsupported-override'

// Immutable — every field `readonly`.
export type ConfigurationValidationIssue = {
  readonly type: ConfigurationValidationIssueType
  readonly key: string | null
  readonly detail: string
}
