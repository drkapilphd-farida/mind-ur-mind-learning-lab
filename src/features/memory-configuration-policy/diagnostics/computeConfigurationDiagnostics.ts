import type { ConfigurationEntry, MemoryConfiguration } from '../domain'
import type { ConfigurationKeySchema } from '../validation'
import { validateConfiguration } from '../validation'
import type { ConfigurationDiagnostics } from './ConfigurationDiagnostics'

// Pure — computed on demand from a resolved configuration; never
// caches or drives resolution itself ("diagnostics only").
export function computeConfigurationDiagnostics(
  configuration: MemoryConfiguration,
  schema: readonly ConfigurationKeySchema[],
  overrideEntries: readonly ConfigurationEntry[],
): ConfigurationDiagnostics {
  const validationResult = validateConfiguration(configuration, schema, overrideEntries)

  return {
    activeProfileId: configuration.metadata.profileId,
    effectiveConfiguration: configuration,
    overrideCount: overrideEntries.length,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    configurationVersion: configuration.metadata.version,
  }
}
