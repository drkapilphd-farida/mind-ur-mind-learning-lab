import { createMockAIProvider } from '../adapters'
import { CHAT_CAPABILITIES, MULTIMODAL_CAPABILITIES } from './capabilityPresets'
import type { AIProvider } from '../contracts'

// Mock only — "NO OpenAI SDK, NO API keys." Model ids are prefixed
// `mock-` so nothing here is ever mistaken for a real, callable OpenAI
// model identifier.
export const openaiProvider: AIProvider = createMockAIProvider({
  metadata: { id: 'openai', displayName: 'OpenAI', description: 'Mock adapter for OpenAI-compatible chat models.', supportsFineTuning: true },
  models: [
    { id: 'mock-gpt-chat', displayName: 'Mock GPT Chat', providerId: 'openai', capabilities: CHAT_CAPABILITIES, contextWindowTokens: 128_000, maxOutputTokens: 4_096 },
    { id: 'mock-gpt-vision', displayName: 'Mock GPT Vision', providerId: 'openai', capabilities: MULTIMODAL_CAPABILITIES, contextWindowTokens: 128_000, maxOutputTokens: 4_096 },
  ],
})
