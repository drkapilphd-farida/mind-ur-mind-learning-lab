import { createMockAIProvider } from '../adapters'
import { CHAT_CAPABILITIES } from './capabilityPresets'
import type { AIProvider } from '../contracts'

// Mock only — no real Azure SDK, endpoint, or API key. A distinct
// provider id from `openai` even though the underlying models are
// OpenAI-family, since Azure OpenAI is deployed/configured separately
// in practice (its own endpoint, its own rate limits).
export const azureOpenAIProvider: AIProvider = createMockAIProvider({
  metadata: { id: 'azure-openai', displayName: 'Azure OpenAI', description: 'Mock adapter for Azure-hosted OpenAI-compatible models.', supportsFineTuning: true },
  models: [{ id: 'mock-azure-gpt-chat', displayName: 'Mock Azure GPT Chat', providerId: 'azure-openai', capabilities: CHAT_CAPABILITIES, contextWindowTokens: 128_000, maxOutputTokens: 4_096 }],
})
