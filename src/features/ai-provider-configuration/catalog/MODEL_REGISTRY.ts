import { CHAT_CAPABILITIES, LOCAL_MODEL_CAPABILITIES, MULTIMODAL_CAPABILITIES, REASONING_CAPABILITIES } from '@/features/ai-provider/providers'
import type { ModelRegistryEntry } from '../types'

// The "AI Model Registry" — one placeholder catalog entry per
// supported provider, illustrative only (not verified against each
// provider's real, current model lineup — a future real integration
// sprint updates these against the real thing). Reuses ai-provider's
// capability presets (Sprint 5, read-only) rather than duplicating the
// ten-flag object per entry. Never instantiated into a live
// AIProvider/AIModel — pure configuration data, independent of whether
// the named provider has a real adapter.
export const MODEL_REGISTRY: readonly ModelRegistryEntry[] = [
  { id: 'openai-default-chat', providerId: 'openai', displayName: 'OpenAI Default Chat Model', capabilities: CHAT_CAPABILITIES },
  { id: 'openai-default-vision', providerId: 'openai', displayName: 'OpenAI Default Vision Model', capabilities: MULTIMODAL_CAPABILITIES },
  { id: 'claude-default-chat', providerId: 'claude', displayName: 'Claude Default Chat Model', capabilities: REASONING_CAPABILITIES },
  { id: 'gemini-default-chat', providerId: 'gemini', displayName: 'Gemini Default Chat Model', capabilities: MULTIMODAL_CAPABILITIES },
  { id: 'azure-openai-default-chat', providerId: 'azure-openai', displayName: 'Azure OpenAI Default Chat Model', capabilities: CHAT_CAPABILITIES },
  { id: 'openrouter-default-chat', providerId: 'openrouter', displayName: 'OpenRouter Default Chat Model', capabilities: CHAT_CAPABILITIES },
  { id: 'ollama-default-chat', providerId: 'ollama', displayName: 'Ollama Default Chat Model', capabilities: LOCAL_MODEL_CAPABILITIES },
  { id: 'custom-default-chat', providerId: 'custom', displayName: 'Custom Provider Default Chat Model', capabilities: CHAT_CAPABILITIES },
] as const
