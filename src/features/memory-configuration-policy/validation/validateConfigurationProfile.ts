import type { ConfigurationProfile } from '../domain'
import type { ConfigurationValidationIssue } from './ConfigurationValidationIssue'
import type { ConfigurationValidationResult } from './ConfigurationValidationResult'
import { findDuplicateKeys } from './findDuplicateKeys'

// Pure — "Validate policy definitions" (Section 2): a structural check
// on the profile itself, independent of any schema (a profile can be
// authored before any schema exists to check it against). Checks a
// non-empty `id`/`name` and no duplicate keys within its own `entries`.
export function validateConfigurationProfile(profile: ConfigurationProfile): ConfigurationValidationResult {
  const issues: ConfigurationValidationIssue[] = []

  if (profile.id.trim().length === 0) {
    issues.push({ type: 'invalid-value', key: null, detail: 'Profile id must not be empty.' })
  }

  if (profile.name.trim().length === 0) {
    issues.push({ type: 'invalid-value', key: null, detail: 'Profile name must not be empty.' })
  }

  for (const key of findDuplicateKeys(profile.entries)) {
    issues.push({ type: 'duplicate-key', key, detail: `Key "${key}" appears more than once in this profile's entries.` })
  }

  return { valid: issues.length === 0, issues }
}
