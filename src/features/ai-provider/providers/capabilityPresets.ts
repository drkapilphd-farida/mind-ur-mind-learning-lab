import type { AIModelCapabilities } from '../types'

// Shared capability presets so each of the 8 provider catalogs
// declares its models by composing/overriding one of these rather than
// repeating the full ten-flag object literal eight times over ("no
// duplicated logic").
export const CHAT_CAPABILITIES: AIModelCapabilities = {
  chat: true,
  vision: false,
  imageGeneration: false,
  audio: false,
  reasoning: false,
  toolCalling: true,
  jsonMode: true,
  structuredOutput: true,
  streaming: true,
  multimodal: false,
}

export const MULTIMODAL_CAPABILITIES: AIModelCapabilities = {
  ...CHAT_CAPABILITIES,
  vision: true,
  audio: true,
  multimodal: true,
}

export const REASONING_CAPABILITIES: AIModelCapabilities = {
  ...CHAT_CAPABILITIES,
  reasoning: true,
}

export const LOCAL_MODEL_CAPABILITIES: AIModelCapabilities = {
  ...CHAT_CAPABILITIES,
  toolCalling: false,
  jsonMode: false,
  structuredOutput: false,
}
