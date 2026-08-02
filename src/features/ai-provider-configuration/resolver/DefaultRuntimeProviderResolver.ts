import type { ProviderRegistryConfiguration } from '../types'
import type {
  ProviderConfigValidator,
  ProviderCredentialResolver,
  ProviderHealthChecker,
  ProviderSelectionPolicy,
  ResolvedProvider,
  RuntimeProviderResolver,
} from '../contracts'
import { createProviderConfigValidator } from '../validation'
import { createProviderSelectionPolicy } from '../policy'
import { createProviderCredentialResolver } from '../credentials'
import { createProviderHealthChecker } from '../health'

export type RuntimeProviderResolverDependencies = {
  configValidator: ProviderConfigValidator
  selectionPolicy: ProviderSelectionPolicy
  credentialResolver: ProviderCredentialResolver
  healthChecker: ProviderHealthChecker
}

function createDefaultDependencies(): RuntimeProviderResolverDependencies {
  return {
    configValidator: createProviderConfigValidator(),
    selectionPolicy: createProviderSelectionPolicy(),
    credentialResolver: createProviderCredentialResolver(),
    healthChecker: createProviderHealthChecker(),
  }
}

// Implements RuntimeProviderResolver — "AI Mentor → Runtime Provider
// Resolver → Configured Provider → (Mock remains active)". Composes
// every other piece this sprint built, in order: (1) validate the
// configuration itself; (2) ask the selection policy which provider is
// requested; (3) confirm it has credentials; (4) confirm it's healthy.
// Any failure at any step falls back to 'mock', with a real, specific
// reason — never a silent default. With today's default dependencies
// (DefaultProviderCredentialResolver always false, DefaultProviderHealthChecker
// always 'unavailable' for real providers), steps 3-4 can never
// currently succeed for a real provider — "every real provider must
// remain disabled" is a structural consequence of those two classes'
// own honesty, not a special case hardcoded here. Injecting different
// credentialResolver/healthChecker implementations (as this feature's
// own tests do) proves the resolver itself is already correct and
// ready for the day those two pieces become real.
export class DefaultRuntimeProviderResolver implements RuntimeProviderResolver {
  constructor(
    private readonly config: ProviderRegistryConfiguration,
    private readonly dependencies: RuntimeProviderResolverDependencies = createDefaultDependencies(),
  ) {}

  async resolve(): Promise<ResolvedProvider> {
    const validation = this.dependencies.configValidator.validate(this.config)
    if (!validation.valid) {
      return { providerId: 'mock', isMock: true, reason: `configuration invalid (${validation.errors.join('; ')}) — falling back to mock` }
    }

    const selected = this.dependencies.selectionPolicy.selectActiveProviderId(this.config)
    if (selected === 'mock') {
      return { providerId: 'mock', isMock: true, reason: 'mock is the configured active provider' }
    }

    if (!this.dependencies.credentialResolver.hasCredentials(selected)) {
      return { providerId: 'mock', isMock: true, reason: `"${selected}" has no credentials configured — falling back to mock` }
    }

    const health = await this.dependencies.healthChecker.checkHealth(selected)
    if (health.state !== 'healthy') {
      return { providerId: 'mock', isMock: true, reason: `"${selected}" is not currently healthy (${health.state}) — falling back to mock` }
    }

    return { providerId: selected, isMock: false, reason: `"${selected}" is enabled, credentialed, and healthy` }
  }
}

export function createRuntimeProviderResolver(
  config: ProviderRegistryConfiguration,
  overrides: Partial<RuntimeProviderResolverDependencies> = {},
): RuntimeProviderResolver {
  return new DefaultRuntimeProviderResolver(config, { ...createDefaultDependencies(), ...overrides })
}
