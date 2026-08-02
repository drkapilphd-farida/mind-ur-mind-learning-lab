import type { MentorContext } from '@/features/ai-mentor/types'
import type { MentorPrompt, MentorProviderReply, ProviderAdapter as MentorProviderAdapterContract } from '@/features/ai-mentor/contracts'
import type { AIProvider, IdGenerator, ProviderAdapter as AIProviderAdapterContract, ProviderFactory, ProviderRegistry } from '@/features/ai-provider/contracts'
import type { ProviderSelectionCriteria } from '@/features/ai-provider/types'
import { createMockProviderAdapter } from '@/features/ai-provider/adapter'
import { createProviderFactory } from '@/features/ai-provider/factory'
import { createProviderRegistry } from '@/features/ai-provider/registry'
import { CHAT_CAPABILITIES } from '@/features/ai-provider/providers'
import { randomIdGenerator } from '@/features/ai-provider/adapters'
import { mapMentorPromptToAIRequest } from './mapMentorPromptToAIRequest'
import { resolveModelId } from './resolveModelId'

export type MentorAIProviderAdapterDependencies = {
  factory: ProviderFactory
  lifecycleAdapters: readonly AIProviderAdapterContract[]
  selectionCriteria: ProviderSelectionCriteria
  idGenerator: IdGenerator
}

const DEFAULT_PROVIDER_ID = 'mentor-bridge-provider'
const DEFAULT_MODEL_ID = 'mentor-bridge-model'

// The one default, self-contained wiring this bridge ships with: a
// fresh ProviderRegistry (ai-provider Chunk 1, unmodified) holding
// exactly one Chunk 3 MockProviderAdapter — "everything must still use
// ONLY MockProviderAdapter" — resolved through a real Chunk 2
// ProviderFactory. `lifecycleAdapters` keeps the concretely-typed
// ProviderAdapter reference around separately from the registry (which
// only knows the narrower AIProvider shape) purely so this class can
// call `initialize()` on it; nothing else needs that narrower type.
function createDefaultDependencies(): MentorAIProviderAdapterDependencies {
  const adapter = createMockProviderAdapter({
    metadata: {
      id: DEFAULT_PROVIDER_ID,
      displayName: 'Mentor Bridge Mock Provider',
      description: 'The default MockProviderAdapter-backed provider AI Mentor talks to through this bridge — mocked, deterministic, no real model.',
      supportsFineTuning: false,
    },
    models: [
      {
        id: DEFAULT_MODEL_ID,
        displayName: 'Mentor Bridge Mock Model',
        providerId: DEFAULT_PROVIDER_ID,
        capabilities: CHAT_CAPABILITIES,
        contextWindowTokens: 8_192,
        maxOutputTokens: 1_024,
      },
    ],
  })

  const registry: ProviderRegistry = createProviderRegistry()
  registry.register(adapter)

  return {
    factory: createProviderFactory(registry),
    lifecycleAdapters: [adapter],
    selectionCriteria: { providerId: DEFAULT_PROVIDER_ID, preferredModelId: DEFAULT_MODEL_ID, requiredCapabilities: ['chat'] },
    idGenerator: randomIdGenerator,
  }
}

// Implements ai-mentor's ProviderAdapter contract — the seam that
// contract's own header comment named as "a future concrete
// ProviderAdapter implementation may internally call into [a provider
// layer's] machinery." This is that implementation: "Provider
// selection flow" (factory.resolve), "Provider capability validation"
// (requiredCapabilities: ['chat'] in the default selection criteria,
// enforced by ai-provider's own Chunk 2 CapabilityResolver), and
// "Conversation → Provider pipeline" (generateReply itself) all happen
// here. Neither ai-mentor nor ai-provider was modified to make this
// work — this class lives in its own bounded context, importing from
// both, so ai-provider's "Provider Layer must be the ONLY component
// that knows about AI providers" stays true (ai-provider still knows
// nothing about ai-mentor) and ai-mentor's own files stay untouched
// (wired in purely via the existing `providerAdapter` dependency-
// injection seam on createMentorPipeline/createConversationOrchestrator).
export class MentorAIProviderAdapter implements MentorProviderAdapterContract {
  private initialized = false

  constructor(private readonly deps: MentorAIProviderAdapterDependencies) {}

  async generateReply(prompt: MentorPrompt, _context: MentorContext): Promise<MentorProviderReply> {
    await this.ensureInitialized()

    const provider: AIProvider = this.deps.factory.resolve(this.deps.selectionCriteria)
    const modelId = resolveModelId(provider, this.deps.selectionCriteria)
    const requestId = this.deps.idGenerator.generate()

    const aiRequest = mapMentorPromptToAIRequest(prompt, requestId, modelId)
    const aiResponse = await provider.generate(aiRequest)

    // "AI Mentor response pipeline" — the reverse translation. Trivial
    // today (AIResponse.content carries everything MentorProviderReply
    // needs), but a real, named step rather than an inline field access
    // at the call site, matching DefaultResponseMapper's role in Chunk 3.
    return { content: aiResponse.content }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return
    await Promise.all(this.deps.lifecycleAdapters.map((adapter) => adapter.initialize()))
    this.initialized = true
  }
}

export function createMentorAIProviderAdapter(overrides: Partial<MentorAIProviderAdapterDependencies> = {}): MentorProviderAdapterContract {
  return new MentorAIProviderAdapter({ ...createDefaultDependencies(), ...overrides })
}
