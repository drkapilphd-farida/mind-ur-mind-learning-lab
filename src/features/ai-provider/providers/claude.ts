import { createMockAIProvider } from '../adapters'
import { MULTIMODAL_CAPABILITIES, REASONING_CAPABILITIES } from './capabilityPresets'
import type { AIProvider } from '../contracts'

// Mock only — "NO Anthropic SDK, NO API keys."
export const claudeProvider: AIProvider = createMockAIProvider({
  metadata: { id: 'claude', displayName: 'Claude', description: 'Mock adapter for Anthropic Claude-compatible models.', supportsFineTuning: false },
  models: [
    { id: 'mock-claude-chat', displayName: 'Mock Claude Chat', providerId: 'claude', capabilities: REASONING_CAPABILITIES, contextWindowTokens: 200_000, maxOutputTokens: 8_192 },
    { id: 'mock-claude-vision', displayName: 'Mock Claude Vision', providerId: 'claude', capabilities: MULTIMODAL_CAPABILITIES, contextWindowTokens: 200_000, maxOutputTokens: 8_192 },
  ],
})
