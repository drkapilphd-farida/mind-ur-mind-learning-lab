import type { SupportedProviderId } from './SupportedProviderId'

// "Feature Flags for providers" — one boolean per supported provider.
// Every default source this sprint ships (InMemoryEnvironmentConfigSource,
// ProcessEnvConfigSource) produces every flag `false` unless a caller
// explicitly opts a provider in, which — since no real provider adapter
// exists yet — has no effect beyond flipping this flag; nothing consumes
// a `true` flag today except this sprint's own tests.
export type ProviderFeatureFlags = Record<SupportedProviderId, boolean>
