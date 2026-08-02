import type { ConfigurationEntry, MemoryConfiguration } from '../domain'
import type { ConfigurationKeySchema } from './ConfigurationKeySchema'
import type { ConfigurationValidationIssue } from './ConfigurationValidationIssue'
import type { ConfigurationValidationResult } from './ConfigurationValidationResult'
import { findDuplicateKeys } from './findDuplicateKeys'

// Pure — validates a resolved configuration against a schema, plus the
// specific entries that came from override layers (profile + runtime;
// see `resolution/resolveConfiguration.ts`). Checks, in order:
//
// - required-value-missing: a schema entry marked `required: true` has
//   no corresponding entry in `configuration.entries`.
// - invalid-value: a configuration entry's value doesn't match its
//   schema key's declared `type`.
// - duplicate-key: the *given* `overrideEntries` (the raw, unmerged
//   override source — resolution's own merge already deduplicates its
//   output, so checking the resolved configuration itself would always
//   trivially pass) contain the same key more than once.
// - unsupported-override: an override entry's key either isn't in the
//   schema at all, or is in the schema with `allowOverride: false`.
//
// "Configuration consistency" is the result as a whole: `valid` is
// true iff none of the above found anything.
export function validateConfiguration(
  configuration: MemoryConfiguration,
  schema: readonly ConfigurationKeySchema[],
  overrideEntries: readonly ConfigurationEntry[],
): ConfigurationValidationResult {
  const issues: ConfigurationValidationIssue[] = []
  const entriesByKey = new Map(configuration.entries.map((entry) => [entry.key, entry.value]))
  const schemaByKey = new Map(schema.map((entry) => [entry.key, entry]))

  for (const schemaEntry of schema) {
    if (schemaEntry.required && !entriesByKey.has(schemaEntry.key)) {
      issues.push({
        type: 'required-value-missing',
        key: schemaEntry.key,
        detail: `Required configuration key "${schemaEntry.key}" is missing.`,
      })
    }
  }

  for (const [key, value] of entriesByKey) {
    const schemaEntry = schemaByKey.get(key)
    if (schemaEntry && typeof value !== schemaEntry.type) {
      issues.push({
        type: 'invalid-value',
        key,
        detail: `Configuration key "${key}" expected type "${schemaEntry.type}" but got "${typeof value}".`,
      })
    }
  }

  for (const key of findDuplicateKeys(overrideEntries)) {
    issues.push({ type: 'duplicate-key', key, detail: `Key "${key}" appears more than once in the given override entries.` })
  }

  for (const overrideEntry of overrideEntries) {
    const schemaEntry = schemaByKey.get(overrideEntry.key)
    if (!schemaEntry || !schemaEntry.allowOverride) {
      issues.push({
        type: 'unsupported-override',
        key: overrideEntry.key,
        detail: `Key "${overrideEntry.key}" cannot be overridden.`,
      })
    }
  }

  return { valid: issues.length === 0, issues }
}
