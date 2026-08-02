// Independently declared to match `@/features/ai-provider/types`'s own
// `AIRequestRole` values exactly — same "structurally compatible,
// independently declared" convention used throughout this session
// (e.g. `PersonalizationLifecycleState` vs. `SessionContextLifecycleState`).
// The genuine, checked compatibility seam lives in
// `../integration/PROVIDER_ROLE_MAP.ts`, not here.
export type ProviderMessageRole = 'system' | 'user' | 'assistant'
