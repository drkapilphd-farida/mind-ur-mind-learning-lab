import { createMockAIProvider } from '../adapters'
import { REASONING_CAPABILITIES } from './capabilityPresets'
import type { AIProvider } from '../contracts'

// Mock only — no real xAI SDK or API key.
export const grokProvider: AIProvider = createMockAIProvider({
  metadata: { id: 'grok', displayName: 'Grok', description: 'Mock adapter for xAI Grok-compatible models.', supportsFineTuning: false },
  models: [{ id: 'mock-grok-chat', displayName: 'Mock Grok Chat', providerId: 'grok', capabilities: REASONING_CAPABILITIES, contextWindowTokens: 128_000, maxOutputTokens: 4_096 }],
})
