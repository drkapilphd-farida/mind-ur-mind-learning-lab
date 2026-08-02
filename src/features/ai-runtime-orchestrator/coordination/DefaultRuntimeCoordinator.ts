import { createMentorContextOrchestrationService } from '@/features/ai-mentor-personalization-bridge'
import { createMentorResponseOrchestrationService } from '@/features/ai-mentor-response-composer'
import { createMentorPromptOrchestrationService } from '@/features/ai-mentor-prompt-assembler'
import {
  createProviderSelectionRegistry,
  createProviderPriorityResolver,
  createProviderCapabilityResolver,
  createDefaultProviderSelectionResolver,
  createFallbackProviderResolver,
  createProviderSelectionEngine,
  ALL_CATALOG_ENTRIES,
  type ProviderSelectionEngine,
  type SelectionCapability,
} from '@/features/provider-selection-engine'
import {
  createModelRegistry,
  createModelPriorityResolver,
  createModelCapabilityResolver,
  createDefaultModelResolver,
  createFallbackModelResolver,
  createModelSelectionEngine,
  ALL_MODEL_CATALOG_ENTRIES,
  type ModelSelectionEngine,
  type ModelCapability,
} from '@/features/model-selection-engine'
import { createRequestExecutionPipeline, type RequestExecutionPipeline } from '@/features/request-execution-pipeline'
import {
  createProviderAdapterFactory,
  type ProviderAdapterFactory,
  type ProviderAdapterExecutionRequest,
  type ProviderAdapterRawResponse,
} from '@/features/provider-adapter-layer'
import { createResponseProcessingPipeline, type ResponseProcessingPipeline, type RawResponsePayload } from '@/features/response-processing-pipeline'
import { createRuntimeFailureHandler } from '../failureHandling'
import type { RuntimeFailureHandler } from '../failureHandling'
import { createRuntimeLifecycleManager } from '../lifecycle'
import type { RuntimeLifecycleManager } from '../lifecycle'
import { buildRuntimeExecutionPlan } from '../planning'
import type { RuntimeOrchestrationInputs } from '../integration'
import type { AIRuntimeResult, RuntimeExecutionContext, RuntimeState, RuntimeValidationIssueType } from '../types'
import type { RuntimeCoordinator } from './RuntimeCoordinator'

export type RuntimeCoordinatorDependencies = {
  providerSelectionEngine: ProviderSelectionEngine
  modelSelectionEngine: ModelSelectionEngine
  requestExecutionPipeline: RequestExecutionPipeline
  providerAdapterFactory: ProviderAdapterFactory
  responseProcessingPipeline: ResponseProcessingPipeline
  lifecycleManager: RuntimeLifecycleManager
  failureHandler: RuntimeFailureHandler
}

// Real, self-seeded default wiring — provider/model registries are
// seeded once, here, with the real catalogs, never rebuilt per run.
// Overridable (see `createRuntimeCoordinator`) so tests can substitute
// a stub selection engine to force `missing-provider`/`missing-model`
// — the real catalogs always have a usable fallback candidate, so
// those two failure paths are otherwise unreachable from the outside.
function createDefaultDependencies(): RuntimeCoordinatorDependencies {
  const providerRegistry = createProviderSelectionRegistry()
  for (const entry of ALL_CATALOG_ENTRIES) providerRegistry.register(entry)
  const providerPriorityResolver = createProviderPriorityResolver()
  const providerCapabilityResolver = createProviderCapabilityResolver()
  const providerSelectionEngine = createProviderSelectionEngine(
    providerRegistry,
    createDefaultProviderSelectionResolver(providerCapabilityResolver, providerPriorityResolver),
    createFallbackProviderResolver(providerPriorityResolver),
  )

  const modelRegistry = createModelRegistry()
  for (const entry of ALL_MODEL_CATALOG_ENTRIES) modelRegistry.register(entry)
  const modelPriorityResolver = createModelPriorityResolver()
  const modelCapabilityResolver = createModelCapabilityResolver()
  const modelSelectionEngine = createModelSelectionEngine(
    modelRegistry,
    createDefaultModelResolver(modelCapabilityResolver, modelPriorityResolver),
    createFallbackModelResolver(modelPriorityResolver),
  )

  return {
    providerSelectionEngine,
    modelSelectionEngine,
    requestExecutionPipeline: createRequestExecutionPipeline(),
    providerAdapterFactory: createProviderAdapterFactory(),
    responseProcessingPipeline: createResponseProcessingPipeline(),
    lifecycleManager: createRuntimeLifecycleManager(),
    failureHandler: createRuntimeFailureHandler(),
  }
}

// Implements RuntimeCoordinator — "coordinating existing components"
// is this sprint's entire purpose, so this is the one file in this
// feature permitted to import other features' factory functions
// directly, matching the exact, documented precedent set by
// `ai-orchestration-pipeline/orchestration/DefaultAIOrchestrationService.ts`
// (Sprint 34).
export class DefaultRuntimeCoordinator implements RuntimeCoordinator {
  constructor(private readonly dependencies: RuntimeCoordinatorDependencies) {}

  coordinate(inputs: RuntimeOrchestrationInputs): AIRuntimeResult {
    const plan = buildRuntimeExecutionPlan(inputs)
    let context: RuntimeExecutionContext = { learnerId: inputs.learnerId, profileId: inputs.profileId, state: 'pending', completedStages: ['pending'] }

    const advance = (to: RuntimeState): void => {
      const nextState = this.dependencies.lifecycleManager.transition(context.state, to)
      context = { ...context, state: nextState, completedStages: [...context.completedStages, nextState] }
    }
    const fail = (issueType: RuntimeValidationIssueType, detail: string, selectedProviderId: string | null, selectedModelId: string | null): AIRuntimeResult => {
      advance('failed')
      return this.dependencies.failureHandler.handle({ context, issueType, detail, selectedProviderId, selectedModelId })
    }

    // Stages 1-2: Personalization + Recommendation —
    // ai-mentor-personalization-bridge, coordinating Personalization
    // Engine + AI Memory Engine + (transitively) the recommendation
    // set already threaded into this one call's own input.
    const contextResult = createMentorContextOrchestrationService().generate({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      profile: inputs.profile,
      executionPlan: inputs.executionPlan,
      recommendationSet: inputs.recommendationSet,
      adaptation: inputs.adaptation,
      memoryContext: inputs.memoryContext,
      configurationFacts: inputs.configurationFacts,
    })
    if (!contextResult.validationResult.valid) return fail('missing-execution-context', 'Personalization context assembly failed.', null, null)
    advance('personalization-ready')
    advance('recommendation-ready')
    const mentorContext = contextResult.snapshot.context

    // Stage 3: AI Mentor — ai-mentor-response-composer then
    // ai-mentor-prompt-assembler.
    const responseResult = createMentorResponseOrchestrationService().generate({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      mentorContext,
      executionPlan: inputs.executionPlan,
      configurationFacts: inputs.configurationFacts,
    })
    if (!responseResult.validationResult.valid) return fail('invalid-runtime-state', 'Mentor response composition failed.', null, null)

    const promptResult = createMentorPromptOrchestrationService().generate({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      mentorResponse: responseResult.response,
      mentorContext,
      configurationFacts: inputs.configurationFacts,
    })
    if (!promptResult.validationResult.valid) return fail('invalid-runtime-state', 'Mentor prompt assembly failed.', null, null)
    advance('mentor-ready')

    // Stage 4: Provider Selection.
    const providerOutcome = this.dependencies.providerSelectionEngine.select({
      requestedCapability: plan.requestedCapability as SelectionCapability | null,
      preferredProviderId: plan.preferredProviderId,
      requiredModel: null,
    })
    if (providerOutcome.resolutionPath === 'none' || !providerOutcome.selectedProviderId) {
      return fail('missing-provider', 'No provider could be selected.', null, null)
    }
    const selectedProviderId = providerOutcome.selectedProviderId
    advance('provider-selected')

    // Stage 5: Model Selection, scoped to the selected provider.
    const modelOutcome = this.dependencies.modelSelectionEngine.select({
      providerId: selectedProviderId,
      requestedCapability: plan.requestedCapability as ModelCapability | null,
      preferredModelId: plan.preferredModelId,
      minimumContextSize: plan.minimumContextSize,
    })
    if (modelOutcome.resolutionPath === 'none' || !modelOutcome.selectedModelId) {
      return fail('missing-model', 'No model could be selected for the chosen provider.', selectedProviderId, null)
    }
    const selectedModelId = modelOutcome.selectedModelId
    advance('model-selected')

    // Stage 6: Request Execution Pipeline.
    const pipelineResult = this.dependencies.requestExecutionPipeline.execute({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      providerId: selectedProviderId,
      modelId: selectedModelId,
      systemPrompt: inputs.systemPrompt,
      userPrompt: inputs.userPrompt,
      configuration: inputs.requestConfiguration,
      safetyConfiguration: inputs.safetyConfiguration,
    })
    if (!pipelineResult.validationResult.valid) {
      return fail('request-pipeline-failure', 'The request execution pipeline rejected the assembled request.', selectedProviderId, selectedModelId)
    }
    advance('request-ready')

    // Stage 7: Mock Provider Adapter (provider-adapter-layer) — no
    // real execution; a deterministic synthetic raw response, mirroring
    // `ai-orchestration-pipeline/integration/buildSyntheticRawResponse.ts`'s
    // own "no provider execution" posture.
    let adapter
    try {
      adapter = this.dependencies.providerAdapterFactory.create(selectedProviderId)
    } catch {
      return fail('provider-adapter-failure', `No provider adapter definition exists for provider "${selectedProviderId}".`, selectedProviderId, selectedModelId)
    }

    const adapterExecutionRequest: ProviderAdapterExecutionRequest = {
      id: pipelineResult.envelope.id,
      providerId: selectedProviderId,
      messageCount: 2,
      instructionCount: 0,
      payloadSummary: ['system', 'user'],
    }
    if (!adapter.validateRequest(adapterExecutionRequest).valid) {
      return fail('provider-adapter-failure', 'The provider adapter rejected the execution request.', selectedProviderId, selectedModelId)
    }
    const transformed = adapter.transformExecutionRequest(adapterExecutionRequest)
    adapter.buildProviderPayload(transformed)

    const syntheticRawResponse: ProviderAdapterRawResponse = {
      providerId: selectedProviderId,
      outputText: `Echo: ${pipelineResult.envelope.payload.userPrompt}`,
      finishReason: 'stop',
      modelUsed: selectedModelId,
    }
    const normalized = adapter.normalizeProviderResponse(syntheticRawResponse)
    if (!adapter.validateProviderResponse(normalized).valid) {
      return fail('provider-adapter-failure', 'The provider adapter rejected the normalized response.', selectedProviderId, selectedModelId)
    }
    const adapterResult = adapter.buildExecutionResult(normalized, pipelineResult.envelope.id)
    advance('adapter-processed')

    // Stage 8: Response Processing Pipeline.
    const rawResponsePayload: RawResponsePayload = {
      providerId: selectedProviderId,
      content: adapterResult.outputText,
      finishReason: normalized.finishReason,
      usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      metadata: { modelUsed: normalized.modelUsed, requestId: pipelineResult.envelope.id },
      errorPayload: null,
    }
    const responseProcessingResult = this.dependencies.responseProcessingPipeline.process(rawResponsePayload)
    if (!responseProcessingResult.validationResult.valid) {
      return fail('response-pipeline-failure', 'The response processing pipeline rejected the normalized response.', selectedProviderId, selectedModelId)
    }
    advance('response-ready')

    // Stage 9: Unified Runtime Result.
    advance('completed')

    return {
      state: context.state,
      completionStatus: 'completed',
      success: {
        responseText: responseProcessingResult.envelope.content,
        providerId: selectedProviderId,
        modelId: selectedModelId,
        finishReason: responseProcessingResult.envelope.finishReason,
      },
      failureReason: null,
      diagnostics: {
        learnerId: inputs.learnerId,
        profileId: inputs.profileId,
        finalState: context.state,
        completedStages: context.completedStages,
        validationResult: { valid: true, issues: [] },
        selectedProviderId,
        selectedModelId,
      },
    }
  }
}

export function createRuntimeCoordinator(overrides: Partial<RuntimeCoordinatorDependencies> = {}): RuntimeCoordinator {
  return new DefaultRuntimeCoordinator({ ...createDefaultDependencies(), ...overrides })
}
