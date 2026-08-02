import type { AIModel, ProviderMetadata } from '@/features/ai-provider/types'
import type { ProviderAdapter } from '@/features/ai-provider/contracts'
import {
  createCapabilityValidator,
  createModelSelectionStrategy,
  createRequestMapper,
  createResponseMapper,
  type ProviderAdapterDependencies,
} from '@/features/ai-provider/adapter'
import { randomIdGenerator, systemClock } from '@/features/ai-provider/adapters'
import { REASONING_CAPABILITIES } from '@/features/ai-provider/providers'
import { createEnvGatedProviderLifecycle } from '../lifecycle'
import { createRealProviderErrorTranslator } from '../errorTranslation'
import { createRealClaudeMessagesClient, type ClaudeMessagesClient } from '../clients'
import { ClaudeProviderAdapter } from './ClaudeProviderAdapter'

const CLAUDE_PROVIDER_ID = 'claude'
const CLAUDE_REQUIRED_ENV_VAR = 'ANTHROPIC_API_KEY'

// Verified against Anthropic's real /v1/models endpoint with a live key —
// `claude-3-5-sonnet-20241022` (the prior default) no longer exists
// (404 not_found_error); `claude-sonnet-5` is the current Sonnet-tier
// model for this account as of this check. `maxOutputTokens` here is
// this model's real, practical non-streaming default (not its absolute
//128k ceiling) — `DefaultRequestMapper` falls back to this exact value
// as `max_tokens` for any request that doesn't specify its own, and the
// real Anthropic SDK refuses a non-streaming request above a certain
// `max_tokens` (its own "may take longer than 10 minutes" guard) —
// confirmed empirically against the real API.
const DEFAULT_CLAUDE_MODEL: AIModel = {
  id: 'claude-sonnet-5',
  displayName: 'Claude Sonnet 5',
  providerId: CLAUDE_PROVIDER_ID,
  capabilities: REASONING_CAPABILITIES,
  contextWindowTokens: 1_000_000,
  maxOutputTokens: 8_192,
}

const DEFAULT_CLAUDE_METADATA: ProviderMetadata = {
  id: CLAUDE_PROVIDER_ID,
  displayName: 'Claude',
  description: 'Real Anthropic Claude Messages API adapter. Disabled unless ANTHROPIC_API_KEY is set.',
  supportsFineTuning: false,
}

export type ClaudeProviderAdapterOptions = {
  metadata?: ProviderMetadata
  models?: readonly AIModel[]
  dependencies?: Partial<ProviderAdapterDependencies>
  client?: ClaudeMessagesClient
}

function createDefaultDependencies(): ProviderAdapterDependencies {
  return {
    requestMapper: createRequestMapper(),
    responseMapper: createResponseMapper(),
    capabilityValidator: createCapabilityValidator(),
    modelSelectionStrategy: createModelSelectionStrategy(),
    errorTranslator: createRealProviderErrorTranslator(),
    lifecycle: createEnvGatedProviderLifecycle(CLAUDE_PROVIDER_ID, CLAUDE_REQUIRED_ENV_VAR),
    clock: systemClock,
    idGenerator: randomIdGenerator,
  }
}

export function createClaudeProviderAdapter(options: ClaudeProviderAdapterOptions = {}): ProviderAdapter {
  return new ClaudeProviderAdapter(
    options.metadata ?? DEFAULT_CLAUDE_METADATA,
    options.models ?? [DEFAULT_CLAUDE_MODEL],
    { ...createDefaultDependencies(), ...options.dependencies },
    options.client ?? createRealClaudeMessagesClient(),
  )
}
