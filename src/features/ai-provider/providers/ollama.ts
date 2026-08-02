import { createMockAIProvider } from '../adapters'
import { LOCAL_MODEL_CAPABILITIES } from './capabilityPresets'
import type { AIProvider } from '../contracts'

// Mock only — no real Ollama HTTP server call.
export const ollamaProvider: AIProvider = createMockAIProvider({
  metadata: { id: 'ollama', displayName: 'Ollama', description: 'Mock adapter for Ollama-hosted local models.', supportsFineTuning: false },
  models: [{ id: 'mock-ollama-chat', displayName: 'Mock Ollama Chat', providerId: 'ollama', capabilities: LOCAL_MODEL_CAPABILITIES, contextWindowTokens: 8_192, maxOutputTokens: 2_048 }],
})
