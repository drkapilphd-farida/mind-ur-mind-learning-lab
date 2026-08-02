// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/memory-persistence/testFixtures.ts`. Not
// itself a *.test.ts file, so vitest's `include` glob never picks it
// up as a test file.
import type { Clock, IdGenerator } from './contracts'
import type { ConfigurationProfile, MemoryConfiguration } from './domain'
import type { ConfigurationSnapshot } from './snapshot'

export function makeFixedClock(fixedNow = '2026-01-01T00:00:00.000Z'): Clock {
  return { now: () => fixedNow }
}

export function makeSequentialIdGenerator(prefix = 'id'): IdGenerator {
  let counter = 0
  return {
    generate: () => {
      counter += 1
      return `${prefix}-${counter}`
    },
  }
}

export function makeConfigurationProfile(overrides: Partial<ConfigurationProfile> = {}): ConfigurationProfile {
  return { id: 'profile-1', name: 'Test Profile', entries: [], ...overrides }
}

export function makeMemoryConfiguration(overrides: Partial<MemoryConfiguration> = {}): MemoryConfiguration {
  return {
    id: 'configuration-1',
    entries: [],
    metadata: { profileId: null, version: 1, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makeConfigurationSnapshot(overrides: Partial<ConfigurationSnapshot> = {}): ConfigurationSnapshot {
  return {
    id: 'snapshot-1',
    configuration: makeMemoryConfiguration(),
    version: 1,
    capturedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
