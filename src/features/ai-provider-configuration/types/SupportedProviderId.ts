// The 7 providers this sprint prepares configuration for — "Supported
// (configuration only)" per the Sprint 6 brief. Deliberately a
// different list from ai-provider/providers' 8 mock catalog entries
// (which has 'grok'/'deepseek'/'local-llm' instead of 'openrouter'/
// 'custom') — that catalog is architecture-testing mock data; this one
// is the real, future-facing production provider list. No real
// provider adapter exists for any of these yet.
export type SupportedProviderId = 'openai' | 'claude' | 'gemini' | 'azure-openai' | 'openrouter' | 'ollama' | 'custom'
