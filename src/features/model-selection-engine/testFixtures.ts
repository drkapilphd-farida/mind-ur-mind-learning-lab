// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-selection-engine/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. Every builder's defaults are valid per this
// feature's own validators, so tests only need to override the one
// field under test.
import type {
  ModelCatalogEntry,
  ModelMetadata,
  ModelSelectionConfiguration,
  ModelSelectionDiagnostics,
  ModelSelectionOutcome,
  ModelSelectionRequest,
  ModelSelectionValidation,
} from './types'

export function makeModelSelectionConfiguration(overrides: Partial<ModelSelectionConfiguration> = {}): ModelSelectionConfiguration {
  return { enabled: true, maxRequestsPerMinute: 60, ...overrides }
}

export function makeModelMetadata(overrides: Partial<ModelMetadata> = {}): ModelMetadata {
  return {
    id: 'gpt-4o',
    providerId: 'openai',
    displayName: 'GPT-4o',
    contextSize: 128000,
    maxOutputTokens: 16384,
    supportedCapabilities: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'multimodal'],
    ...overrides,
  }
}

export function makeModelCatalogEntry(overrides: Partial<ModelCatalogEntry> = {}): ModelCatalogEntry {
  return {
    metadata: makeModelMetadata(),
    priority: 1,
    availability: 'available',
    configuration: makeModelSelectionConfiguration(),
    ...overrides,
  }
}

export function makeModelSelectionRequest(overrides: Partial<ModelSelectionRequest> = {}): ModelSelectionRequest {
  return { providerId: 'openai', requestedCapability: null, preferredModelId: null, minimumContextSize: null, ...overrides }
}

export function makeModelSelectionOutcome(overrides: Partial<ModelSelectionOutcome> = {}): ModelSelectionOutcome {
  return { selectedModelId: 'gpt-4o', resolutionPath: 'default', reason: 'Selected by default resolution.', ...overrides }
}

export function makeModelSelectionValidation(overrides: Partial<ModelSelectionValidation> = {}): ModelSelectionValidation {
  return { valid: true, issues: [], ...overrides }
}

export function makeModelSelectionDiagnostics(overrides: Partial<ModelSelectionDiagnostics> = {}): ModelSelectionDiagnostics {
  return {
    providerId: 'openai',
    requestedCapability: null,
    preferredModelId: null,
    candidateCount: 1,
    priorityOrder: ['gpt-4o'],
    resolutionPath: 'default',
    selectedModelId: 'gpt-4o',
    validationResult: makeModelSelectionValidation(),
    ...overrides,
  }
}
