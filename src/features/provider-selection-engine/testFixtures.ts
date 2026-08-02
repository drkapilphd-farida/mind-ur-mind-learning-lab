// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-adapter-layer/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. Every builder's defaults are valid per this
// feature's own validators, so tests only need to override the one
// field under test.
import type {
  ProviderCatalogEntry,
  ProviderSelectionConfiguration,
  ProviderSelectionDiagnostics,
  ProviderSelectionOutcome,
  ProviderSelectionRequest,
  ProviderSelectionValidation,
} from './types'

export function makeProviderSelectionConfiguration(overrides: Partial<ProviderSelectionConfiguration> = {}): ProviderSelectionConfiguration {
  return { enabled: true, maxRequestsPerMinute: 60, ...overrides }
}

export function makeProviderCatalogEntry(overrides: Partial<ProviderCatalogEntry> = {}): ProviderCatalogEntry {
  return {
    providerId: 'openai',
    priority: 1,
    availability: 'available',
    supportedCapabilities: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'multimodal'],
    supportedModels: ['gpt-4o', 'gpt-4o-mini'],
    configuration: makeProviderSelectionConfiguration(),
    ...overrides,
  }
}

export function makeProviderSelectionRequest(overrides: Partial<ProviderSelectionRequest> = {}): ProviderSelectionRequest {
  return { requestedCapability: null, preferredProviderId: null, requiredModel: null, ...overrides }
}

export function makeProviderSelectionOutcome(overrides: Partial<ProviderSelectionOutcome> = {}): ProviderSelectionOutcome {
  return { selectedProviderId: 'openai', resolutionPath: 'default', reason: 'Selected by default resolution.', ...overrides }
}

export function makeProviderSelectionValidation(overrides: Partial<ProviderSelectionValidation> = {}): ProviderSelectionValidation {
  return { valid: true, issues: [], ...overrides }
}

export function makeProviderSelectionDiagnostics(overrides: Partial<ProviderSelectionDiagnostics> = {}): ProviderSelectionDiagnostics {
  return {
    requestedCapability: null,
    preferredProviderId: null,
    candidateCount: 1,
    priorityOrder: ['openai'],
    resolutionPath: 'default',
    selectedProviderId: 'openai',
    validationResult: makeProviderSelectionValidation(),
    ...overrides,
  }
}
