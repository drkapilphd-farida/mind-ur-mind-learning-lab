import type { ExecutionPolicyConfig } from '../types'
import type { ExecutionPolicyResolution } from './ExecutionPolicyResolution'

// One of the brief's own 10 named responsibilities — no naming
// collision found, used brief-exact. Validates a raw
// `ExecutionPolicyConfig` and, if valid, constructs an
// `ExecutionPolicyEngine` — mirrors `provider-adapter-layer`'s own
// `ProviderAdapterFactory.create()` precedent (build a validated thing
// from raw config), but for policy configuration instead of a
// provider id.
export interface ExecutionPolicyResolver {
  resolve(config: ExecutionPolicyConfig): ExecutionPolicyResolution
}
