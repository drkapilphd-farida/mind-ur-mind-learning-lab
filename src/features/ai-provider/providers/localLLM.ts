import { createMockAIProvider } from '../adapters'
import { LOCAL_MODEL_CAPABILITIES } from './capabilityPresets'
import type { AIProvider } from '../contracts'

// Mock only. A real local-LLM adapter would eventually talk to a
// self-hosted inference server over the local network rather than a
// cloud API — still no SDK/network call belongs here this sprint.
export const localLLMProvider: AIProvider = createMockAIProvider({
  metadata: { id: 'local-llm', displayName: 'Local LLM', description: 'Mock adapter for a self-hosted local model runtime.', supportsFineTuning: false },
  models: [{ id: 'mock-local-chat', displayName: 'Mock Local Chat', providerId: 'local-llm', capabilities: LOCAL_MODEL_CAPABILITIES, contextWindowTokens: 8_192, maxOutputTokens: 2_048 }],
})
