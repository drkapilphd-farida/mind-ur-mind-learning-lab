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
import { CHAT_CAPABILITIES } from '@/features/ai-provider/providers'
import { createEnvGatedProviderLifecycle } from '../lifecycle'
import { createRealProviderErrorTranslator } from '../errorTranslation'
import { createRealOpenAIChatClient, type OpenAIChatClient } from '../clients'
import { OpenAIProviderAdapter } from './OpenAIProviderAdapter'

const OPENAI_PROVIDER_ID = 'openai'
const OPENAI_REQUIRED_ENV_VAR = 'OPENAI_API_KEY'

// A single, well-known, cost-effective chat model — illustrative like
// Sprint 6's own MODEL_REGISTRY entries. Verify/update against
// OpenAI's current model lineup before relying on this in production;
// a caller can always target a different model via
// ProviderSelectionCriteria.preferredModelId / AIRequest.modelId
// regardless of what's registered here by default.
const DEFAULT_OPENAI_MODEL: AIModel = {
  id: 'gpt-4o-mini',
  displayName: 'GPT-4o mini',
  providerId: OPENAI_PROVIDER_ID,
  capabilities: CHAT_CAPABILITIES,
  contextWindowTokens: 128_000,
  maxOutputTokens: 16_384,
}

const DEFAULT_OPENAI_METADATA: ProviderMetadata = {
  id: OPENAI_PROVIDER_ID,
  displayName: 'OpenAI',
  description: 'Real OpenAI Chat Completions adapter. Disabled unless OPENAI_API_KEY is set.',
  supportsFineTuning: true,
}

export type OpenAIProviderAdapterOptions = {
  metadata?: ProviderMetadata
  models?: readonly AIModel[]
  dependencies?: Partial<ProviderAdapterDependencies>
  client?: OpenAIChatClient
}

function createDefaultDependencies(): ProviderAdapterDependencies {
  return {
    requestMapper: createRequestMapper(),
    responseMapper: createResponseMapper(),
    capabilityValidator: createCapabilityValidator(),
    modelSelectionStrategy: createModelSelectionStrategy(),
    errorTranslator: createRealProviderErrorTranslator(),
    lifecycle: createEnvGatedProviderLifecycle(OPENAI_PROVIDER_ID, OPENAI_REQUIRED_ENV_VAR),
    clock: systemClock,
    idGenerator: randomIdGenerator,
  }
}

// Real, but inert until initialize()'d — and initialize() itself only
// ever checks for OPENAI_API_KEY's presence (EnvGatedProviderLifecycle),
// never makes a network call. Registered into a registry unconditionally
// (Sprint 8's Provider Registration) — "Mock Provider remains default"
// and "Real providers are disabled by default" are enforced by
// RuntimeProviderSwitcher's resolution order, not by withholding
// registration.
export function createOpenAIProviderAdapter(options: OpenAIProviderAdapterOptions = {}): ProviderAdapter {
  return new OpenAIProviderAdapter(
    options.metadata ?? DEFAULT_OPENAI_METADATA,
    options.models ?? [DEFAULT_OPENAI_MODEL],
    { ...createDefaultDependencies(), ...options.dependencies },
    options.client ?? createRealOpenAIChatClient(),
  )
}
