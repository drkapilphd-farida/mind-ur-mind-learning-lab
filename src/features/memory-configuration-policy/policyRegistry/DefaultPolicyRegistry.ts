import type { ConfigurationEntry, ConfigurationProfile } from '../domain'
import { mergeConfigurationEntries } from '../domain'
import type { ConfigurationValidationResult } from '../validation'
import { validateConfigurationProfile } from '../validation'
import { PolicyNotFoundError } from './PolicyNotFoundError'
import type { PolicyRegistry } from './PolicyRegistry'

// Implements PolicyRegistry — a private `Map<string, ConfigurationProfile>`,
// the same in-memory registry convention as every other registry-shaped
// component in this codebase. "Support deterministic resolution only" —
// `resolvePolicy`/`listActivePolicies` are plain lookups, never a
// scored/ranked choice among candidates.
export class DefaultPolicyRegistry implements PolicyRegistry {
  private readonly policies = new Map<string, ConfigurationProfile>()

  registerPolicy(profile: ConfigurationProfile): void {
    this.policies.set(profile.id, profile)
  }

  resolvePolicy(profileId: string): ConfigurationProfile | null {
    return this.policies.get(profileId) ?? null
  }

  overridePolicy(profileId: string, overrides: readonly ConfigurationEntry[]): ConfigurationProfile {
    const existing = this.policies.get(profileId)
    if (!existing) throw new PolicyNotFoundError(profileId)

    const updated: ConfigurationProfile = { ...existing, entries: mergeConfigurationEntries(existing.entries, overrides) }
    this.policies.set(profileId, updated)
    return updated
  }

  listActivePolicies(): readonly ConfigurationProfile[] {
    return [...this.policies.values()]
  }

  validatePolicyDefinition(profile: ConfigurationProfile): ConfigurationValidationResult {
    return validateConfigurationProfile(profile)
  }
}

export function createPolicyRegistry(): PolicyRegistry {
  return new DefaultPolicyRegistry()
}
