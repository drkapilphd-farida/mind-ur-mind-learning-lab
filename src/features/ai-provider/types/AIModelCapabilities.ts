// One flags object per model — what a caller (or a future
// ProviderFactory selection) checks before routing a request to a
// given model, rather than hardcoding "if provider === 'openai'"
// anywhere. Every capability named in this sprint's brief gets its own
// field, even ones no mock model turns on yet (imageGeneration, audio)
// — the flag existing is what makes a future model able to declare
// support without a type change.
export type AIModelCapabilities = {
  chat: boolean
  vision: boolean
  imageGeneration: boolean
  audio: boolean
  reasoning: boolean
  toolCalling: boolean
  jsonMode: boolean
  structuredOutput: boolean
  streaming: boolean
  multimodal: boolean
}
