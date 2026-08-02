// The provider catalog — eight mock AIProvider instances, one per
// named provider from this sprint's brief. Each is a plain instance of
// `adapters/createMockAIProvider`, differing only in metadata/models
// data. `ALL_PROVIDERS` is what `registry/` registers by default.

import { azureOpenAIProvider } from './azureOpenAI'
import { claudeProvider } from './claude'
import { deepseekProvider } from './deepseek'
import { geminiProvider } from './gemini'
import { grokProvider } from './grok'
import { localLLMProvider } from './localLLM'
import { ollamaProvider } from './ollama'
import { openaiProvider } from './openai'
import type { AIProvider } from '../contracts'

export { openaiProvider } from './openai'
export { claudeProvider } from './claude'
export { geminiProvider } from './gemini'
export { grokProvider } from './grok'
export { deepseekProvider } from './deepseek'
export { azureOpenAIProvider } from './azureOpenAI'
export { localLLMProvider } from './localLLM'
export { ollamaProvider } from './ollama'
export * from './capabilityPresets'

export const ALL_PROVIDERS: readonly AIProvider[] = [openaiProvider, claudeProvider, geminiProvider, grokProvider, deepseekProvider, azureOpenAIProvider, localLLMProvider, ollamaProvider]
