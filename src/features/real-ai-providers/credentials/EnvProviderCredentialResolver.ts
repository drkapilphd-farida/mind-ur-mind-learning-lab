import type { SupportedProviderId } from '@/features/ai-provider-configuration/types'
import type { ProviderCredentialResolver } from '@/features/ai-provider-configuration/contracts'

// Implements ai-provider-configuration's ProviderCredentialResolver
// contract (Sprint 6, unmodified) — a real presence-only check, exactly
// the shape that contract's own header comment anticipated ("a future
// real implementation backed by a secrets manager still can't expose a
// key through this seam"). Only `openai` and `claude` are wired to a
// real env var this sprint — every other SupportedProviderId honestly
// reports `false` (no real adapter exists for them yet, same as
// Sprint 6's own default).
const REQUIRED_ENV_VAR_BY_PROVIDER_ID: Partial<Record<SupportedProviderId, string>> = {
  openai: 'OPENAI_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
}

export class EnvProviderCredentialResolver implements ProviderCredentialResolver {
  hasCredentials(providerId: SupportedProviderId): boolean {
    const envVar = REQUIRED_ENV_VAR_BY_PROVIDER_ID[providerId]
    if (!envVar) return false
    return Boolean(process.env[envVar])
  }
}

export function createEnvProviderCredentialResolver(): ProviderCredentialResolver {
  return new EnvProviderCredentialResolver()
}
