import { createMentorContextOrchestrationService } from '@/features/ai-mentor-personalization-bridge'
import { createMentorResponseOrchestrationService } from '@/features/ai-mentor-response-composer'
import { createMentorPromptOrchestrationService } from '@/features/ai-mentor-prompt-assembler'
import { createTranslationOrchestrationService } from '@/features/provider-translation-engine'
import { createPipelineOrchestrationService } from '@/features/provider-request-pipeline'
import { createResponseOrchestrationService } from '@/features/provider-response-pipeline'
import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { buildSyntheticRawResponse } from '../integration'
import type { AIOrchestrationInputs } from '../integration'
import { transitionPipelineStage } from '../pipeline'
import { validatePipelineIntegrity } from '../validation'
import { generateAIOrchestrationDiagnostics } from '../diagnostics'
import type { AIOrchestrationResult, PipelineStage } from '../types'
import type { AIPipelineOrchestrationResult } from './AIPipelineOrchestrationResult'
import type { AIOrchestrationService } from './AIOrchestrationService'

export type AIOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): AIOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements AIOrchestrationService — "Coordinate the following
// existing components only... No business logic duplication." Calls
// each of the 6 sub-features' own `create*OrchestrationService().generate()`
// factories directly, in the fixed pipeline order, threading each
// stage's real output into the next stage's own input shape (verified
// field-for-field against each feature's actual files before writing
// this). If any sub-service's own `validationResult.valid` is false,
// the pipeline stops immediately and transitions straight to `failed`
// — later stages are never called. "AI Memory Engine™",
// "Personalization Engine™", "Adaptive Learning Planner™" are
// coordinated by feeding their already-computed objects into the
// bridge call (Sprint 28's own seam), never recomputed here.
export class DefaultAIOrchestrationService implements AIOrchestrationService {
  constructor(private readonly dependencies: AIOrchestrationServiceDependencies) {}

  generate(inputs: AIOrchestrationInputs): AIPipelineOrchestrationResult {
    const now = this.dependencies.clock.now()
    const id = this.dependencies.idGenerator.generate()

    const result = this.runPipeline(inputs, now, id)
    const validationResult = validatePipelineIntegrity(result, inputs.configurationFacts)
    const diagnostics = generateAIOrchestrationDiagnostics(result, validationResult)

    return { result, validationResult, diagnostics }
  }

  private runPipeline(inputs: AIOrchestrationInputs, now: string, id: string): AIOrchestrationResult {
    let currentStage: PipelineStage = 'initialized'
    const completedStages: PipelineStage[] = ['initialized']

    const advance = (to: PipelineStage): void => {
      currentStage = transitionPipelineStage(currentStage, to)
      completedStages.push(currentStage)
    }
    const fail = (): AIOrchestrationResult => {
      advance('failed')
      return this.finalize(inputs, now, id, currentStage, completedStages, 'failed', null, null)
    }

    // Stage: Context Ready — ai-mentor-personalization-bridge, coordinating
    // Personalization Engine™ + AI Memory Engine™ + (transitively) Adaptive
    // Learning Planner™.
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
    if (!contextResult.validationResult.valid) return fail()
    advance('context-ready')
    const mentorContext = contextResult.snapshot.context

    // Stage: Prompt Ready — ai-mentor-response-composer then ai-mentor-prompt-assembler.
    const responseResult = createMentorResponseOrchestrationService().generate({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      mentorContext,
      executionPlan: inputs.executionPlan,
      configurationFacts: inputs.configurationFacts,
    })
    if (!responseResult.validationResult.valid) return fail()

    const promptResult = createMentorPromptOrchestrationService().generate({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      mentorResponse: responseResult.response,
      mentorContext,
      configurationFacts: inputs.configurationFacts,
    })
    if (!promptResult.validationResult.valid) return fail()
    advance('prompt-ready')

    // Stage: Request Ready — provider-translation-engine then provider-request-pipeline.
    const translationResult = createTranslationOrchestrationService().generate({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      promptPayload: promptResult.payload,
      providerId: inputs.providerId,
      configurationFacts: inputs.configurationFacts,
    })
    if (!translationResult.validationResult.valid) return fail()

    const requestPipelineResult = createPipelineOrchestrationService().generate({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      providerRequest: translationResult.request,
      configurationFacts: inputs.configurationFacts,
    })
    if (!requestPipelineResult.validationResult.valid) return fail()
    advance('request-ready')

    // Stage: Response Normalized — provider-response-pipeline, fed a
    // deterministic synthetic raw response ("No provider execution").
    const rawResponse = buildSyntheticRawResponse(requestPipelineResult.request)
    const responsePipelineResult = createResponseOrchestrationService().generate({
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      executionRequest: requestPipelineResult.request,
      rawResponse,
      configurationFacts: inputs.configurationFacts,
    })
    if (!responsePipelineResult.validationResult.valid) return fail()
    advance('response-normalized')

    // Stage: Completed
    advance('completed')

    return this.finalize(
      inputs,
      now,
      id,
      currentStage,
      completedStages,
      'completed',
      responsePipelineResult.response.content.text,
      responsePipelineResult.response.providerId,
    )
  }

  private finalize(
    inputs: AIOrchestrationInputs,
    now: string,
    id: string,
    stage: PipelineStage,
    completedStages: readonly PipelineStage[],
    completionStatus: 'completed' | 'failed',
    responseText: string | null,
    providerId: string | null,
  ): AIOrchestrationResult {
    return {
      id,
      version: 1,
      context: { learnerId: inputs.learnerId, profileId: inputs.profileId, stage, completedStages },
      completionStatus,
      responseText,
      providerId,
      metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'ai-orchestration-pipeline', generatedAt: now },
    }
  }
}

export function createAIOrchestrationService(overrides: Partial<AIOrchestrationServiceDependencies> = {}): AIOrchestrationService {
  return new DefaultAIOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
