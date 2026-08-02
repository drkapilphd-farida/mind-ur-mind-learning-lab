// The same 6-provider vocabulary `provider-adapter-layer` (Sprint 36)
// established for this whole arc — independently re-declared here
// (not imported) since this sprint has no bridge to that feature: same
// literal values, self-contained type, matching every prior sprint's
// "mirror, don't share" posture for cross-sprint-adjacent concepts.
export type SelectionProviderId = 'openai' | 'anthropic' | 'gemini' | 'grok' | 'deepseek' | 'local-llm'
