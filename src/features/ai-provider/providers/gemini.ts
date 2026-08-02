import { createMockAIProvider } from '../adapters'
import { MULTIMODAL_CAPABILITIES } from './capabilityPresets'
import type { AIProvider } from '../contracts'

// Mock only — "NO Gemini SDK, NO API keys."
export const geminiProvider: AIProvider = createMockAIProvider({
  metadata: { id: 'gemini', displayName: 'Gemini', description: 'Mock adapter for Google Gemini-compatible models.', supportsFineTuning: true },
  models: [{ id: 'mock-gemini-chat', displayName: 'Mock Gemini Chat', providerId: 'gemini', capabilities: MULTIMODAL_CAPABILITIES, contextWindowTokens: 1_000_000, maxOutputTokens: 8_192 }],
})
