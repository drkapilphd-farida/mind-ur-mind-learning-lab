import type { ConfigurationEntry, ConfigurationProfile, MemoryConfiguration } from '../domain'
import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { resolveConfiguration } from './resolveConfiguration'
import type { ConfigurationResolutionEngine } from './ConfigurationResolutionEngine'

export type ConfigurationResolutionEngineDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): ConfigurationResolutionEngineDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements ConfigurationResolutionEngine — a thin wrapper supplying
// `now`/`id` from the injected Clock/IdGenerator around
// `resolveConfiguration`.
export class DefaultConfigurationResolutionEngine implements ConfigurationResolutionEngine {
  constructor(private readonly dependencies: ConfigurationResolutionEngineDependencies) {}

  resolve(
    defaultConfiguration: readonly ConfigurationEntry[],
    engineConfiguration: readonly ConfigurationEntry[],
    profile: ConfigurationProfile | null,
    runtimeOverrides: readonly ConfigurationEntry[],
  ): MemoryConfiguration {
    return resolveConfiguration(
      defaultConfiguration,
      engineConfiguration,
      profile,
      runtimeOverrides,
      this.dependencies.clock.now(),
      this.dependencies.idGenerator.generate(),
    )
  }
}

export function createConfigurationResolutionEngine(
  overrides: Partial<ConfigurationResolutionEngineDependencies> = {},
): ConfigurationResolutionEngine {
  return new DefaultConfigurationResolutionEngine({ ...createDefaultDependencies(), ...overrides })
}
