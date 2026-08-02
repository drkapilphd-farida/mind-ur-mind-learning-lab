import { createContextBuilder, createMentorMessage, createProviderAdapter, createPromptBuilder, randomIdGenerator, systemClock } from '../conversation'
import type { Clock, ContextBuilder, IdGenerator, LearningSessionAdapter, MentorInsightComposer, MentorPipeline, MentorPipelineInput, MentorRecommendationComposer, MentorResponseComposer, MentorUIResponse, ProviderAdapter, PromptBuilder } from '../contracts'
import { createLearningSessionAdapter } from './DefaultLearningSessionAdapter'
import { createMentorInsightComposer } from './DefaultMentorInsightComposer'
import { createMentorRecommendationComposer } from './DefaultMentorRecommendationComposer'
import { createMentorResponseComposer } from './DefaultMentorResponseComposer'

export type MentorPipelineDependencies = {
  learningSessionAdapter: LearningSessionAdapter
  insightComposer: MentorInsightComposer
  recommendationComposer: MentorRecommendationComposer
  contextBuilder: ContextBuilder
  promptBuilder: PromptBuilder
  providerAdapter: ProviderAdapter
  responseComposer: MentorResponseComposer
  idGenerator: IdGenerator
  clock: Clock
}

// Implements MentorPipeline — "Learning Session → Learning Intelligence
// → Conversation Context → Mentor Insight Generation → Mentor Response
// → UI-ready Response Object" as one sequence. Purely computational:
// no store writes, `conversation` and `memory` are already fetched by
// the caller (MentorOrchestrator). Insight/recommendation composition
// runs before context-building in *execution* order (context embeds
// them as fields), even though the pipeline diagram lists "Conversation
// Context" before "Mentor Insight Generation" — the diagram names the
// architectural layers touched, not a strict call order; `contextBuilder`
// (Chunk 3's ContextBuilder, reused directly rather than duplicated
// under a new "MentorContextBuilder" interface) genuinely needs
// insights/recommendations as input.
class DefaultMentorPipeline implements MentorPipeline {
  constructor(private readonly deps: MentorPipelineDependencies) {}

  async run(input: MentorPipelineInput): Promise<MentorUIResponse> {
    const snapshot = this.deps.learningSessionAdapter.adapt({
      learningProjectId: input.learningProjectId,
      plan: input.plan,
      ...(input.sessionCount !== undefined ? { sessionCount: input.sessionCount } : {}),
    })

    const insights = await this.deps.insightComposer.compose(snapshot)
    const recommendations = await this.deps.recommendationComposer.compose(snapshot, insights)

    const context = await this.deps.contextBuilder.build({
      learningProjectId: input.learningProjectId,
      conversation: input.conversation,
      insights,
      recommendations,
      memory: input.memory,
    })

    const prompt = this.deps.promptBuilder.build(context)
    const replyResult = await this.deps.providerAdapter.generateReply(prompt, context)
    const reply = createMentorMessage({ role: 'mentor', content: replyResult.content }, this.deps.idGenerator, this.deps.clock)

    return this.deps.responseComposer.compose({ conversationId: input.conversation.id, context, reply })
  }
}

export function createMentorPipeline(overrides: Partial<MentorPipelineDependencies> = {}): MentorPipeline {
  const deps: MentorPipelineDependencies = {
    learningSessionAdapter: createLearningSessionAdapter(),
    insightComposer: createMentorInsightComposer(),
    recommendationComposer: createMentorRecommendationComposer(),
    contextBuilder: createContextBuilder(),
    promptBuilder: createPromptBuilder(),
    providerAdapter: createProviderAdapter(),
    responseComposer: createMentorResponseComposer(),
    idGenerator: randomIdGenerator,
    clock: systemClock,
    ...overrides,
  }
  return new DefaultMentorPipeline(deps)
}
