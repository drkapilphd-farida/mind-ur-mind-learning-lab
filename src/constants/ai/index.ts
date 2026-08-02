// Compile-time constants for the `ai` domain. Kept separate from
// `src/ai/types` — these are simple string-list constants for the API
// domain layer, not the AI subsystem's internal types.

export const AI_PROVIDER_IDS = ['anthropic'] as const

export const AI_REQUEST_PURPOSES = ['chat', 'generation', 'analysis'] as const
