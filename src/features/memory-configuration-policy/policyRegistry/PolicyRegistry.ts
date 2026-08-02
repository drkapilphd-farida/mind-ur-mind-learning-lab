import type { ConfigurationEntry, ConfigurationProfile } from '../domain'
import type { ConfigurationValidationResult } from '../validation'

// "Register policy, Resolve policy, Override policy, List active
// policies, Validate policy definitions. Support deterministic
// resolution only." — "Policy" and `ConfigurationProfile` are the same
// concept here (see `domain/ConfigurationProfile.ts`'s own note).
export interface PolicyRegistry {
  registerPolicy(profile: ConfigurationProfile): void
  resolvePolicy(profileId: string): ConfigurationProfile | null
  overridePolicy(profileId: string, overrides: readonly ConfigurationEntry[]): ConfigurationProfile
  listActivePolicies(): readonly ConfigurationProfile[]
  validatePolicyDefinition(profile: ConfigurationProfile): ConfigurationValidationResult
}
