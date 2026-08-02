import type { ActiveProviderId } from '../types'

// The final, honest answer to "which provider is actually active right
// now" — `reason` always explains why, so "Mock remains active" is
// never a silent default but a traceable outcome of real validation +
// selection-policy + credential + health checks.
export type ResolvedProvider = {
  providerId: ActiveProviderId
  isMock: boolean
  reason: string
}

// "Runtime Provider Resolver" — sits where the Sprint 6 architecture
// diagram places it: AI Mentor → Runtime Provider Resolver → Configured
// Provider → (Mock remains active). Composes ProviderConfigValidator +
// ProviderSelectionPolicy + ProviderCredentialResolver +
// ProviderHealthChecker into one decision. Not wired into
// `@/features/ai-mentor-provider-bridge` this sprint (that would modify
// a Sprint 5 file) — see the Sprint 6 report's "future provider
// activation process" for how that wiring happens later, additively.
export interface RuntimeProviderResolver {
  resolve(): Promise<ResolvedProvider>
}
