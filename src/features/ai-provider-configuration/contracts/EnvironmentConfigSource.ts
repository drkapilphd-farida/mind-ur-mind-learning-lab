import type { ActiveProviderId, ProviderFeatureFlags } from '../types'

// The "Environment Configuration Layer" — reads which provider should
// be active and which providers are feature-flagged on, from wherever
// deployment configuration actually lives. Deliberately narrow: no
// method here can return a credential — environment-sourced secrets
// are explicitly out of scope ("No API keys"), only non-secret
// selection/toggle state.
export interface EnvironmentConfigSource {
  getActiveProviderId(): ActiveProviderId
  getFeatureFlags(): ProviderFeatureFlags
}
