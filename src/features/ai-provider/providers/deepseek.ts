import { createMockAIProvider } from '../adapters'
import { REASONING_CAPABILITIES } from './capabilityPresets'
import type { AIProvider } from '../contracts'

// Mock only — no real DeepSeek SDK or API key.
export const deepseekProvider: AIProvider = createMockAIProvider({
  metadata: { id: 'deepseek', displayName: 'DeepSeek', description: 'Mock adapter for DeepSeek-compatible models.', supportsFineTuning: true },
  models: [{ id: 'mock-deepseek-chat', displayName: 'Mock DeepSeek Chat', providerId: 'deepseek', capabilities: REASONING_CAPABILITIES, contextWindowTokens: 128_000, maxOutputTokens: 8_192 }],
})
