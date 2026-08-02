import type {
  ConversationContext,
  FormattedResponse,
  JourneyContext,
  MindContext,
  PromptPackage,
  RawAIResponseInput,
  UserContext,
} from './types'
import type {
  ConversationContextEngine,
  JourneyContextEngine,
  MentorPersonaEngine,
  MindContextEngine,
  PromptCompositionEngine,
  ResponseFormatter,
  SafetyRulesEngine,
  UserContextEngine,
} from './contracts'
import { createUserContextEngine } from './userContext'
import { createMindContextEngine } from './mindContext'
import { createJourneyContextEngine } from './journeyContext'
import { createConversationContextEngine } from './conversationContext'
import { createMentorPersonaEngine } from './mentorPersona'
import { createSafetyRulesEngine } from './safetyRules'
import { createPromptCompositionEngine } from './promptComposition'
import { createResponseFormatter } from './responseFormatter'

export type AIIntelligenceLayerDependencies = {
  userContextEngine: UserContextEngine
  mindContextEngine: MindContextEngine
  journeyContextEngine: JourneyContextEngine
  conversationContextEngine: ConversationContextEngine
  mentorPersonaEngine: MentorPersonaEngine
  safetyRulesEngine: SafetyRulesEngine
  promptCompositionEngine: PromptCompositionEngine
  responseFormatter: ResponseFormatter
}

export type BuildPromptPackageInput = {
  userContext?: Partial<UserContext>
  mindContext?: Partial<MindContext>
  journeyContext?: Partial<JourneyContext>
  conversationContext?: Partial<ConversationContext>
  teacherModeRequested?: boolean
}

// The AI Intelligence Layer's™ single public entry point — composes all
// 8 engines into the two operations everything upstream (a future
// Conversation Layer integration) actually needs: build a prompt before
// calling a provider, format a response after. Never calls a provider
// itself — "sits between the Learning Platform and every future AI
// Provider," it doesn't reach into the Provider Layer.
export interface AIIntelligenceLayer {
  buildPromptPackage(input: BuildPromptPackageInput): PromptPackage
  formatResponse(raw: RawAIResponseInput): FormattedResponse
}

function createDefaultDependencies(): AIIntelligenceLayerDependencies {
  return {
    userContextEngine: createUserContextEngine(),
    mindContextEngine: createMindContextEngine(),
    journeyContextEngine: createJourneyContextEngine(),
    conversationContextEngine: createConversationContextEngine(),
    mentorPersonaEngine: createMentorPersonaEngine(),
    safetyRulesEngine: createSafetyRulesEngine(),
    promptCompositionEngine: createPromptCompositionEngine(),
    responseFormatter: createResponseFormatter(),
  }
}

class DefaultAIIntelligenceLayer implements AIIntelligenceLayer {
  constructor(private readonly dependencies: AIIntelligenceLayerDependencies) {}

  buildPromptPackage(input: BuildPromptPackageInput): PromptPackage {
    const userContext = this.dependencies.userContextEngine.buildContext(input.userContext ?? {})
    const mindContext = this.dependencies.mindContextEngine.buildContext(input.mindContext ?? {})
    const journeyContext = this.dependencies.journeyContextEngine.buildContext(input.journeyContext ?? {})
    const conversationContext = this.dependencies.conversationContextEngine.buildContext(input.conversationContext ?? {})

    // Persona selection is derived from the already-built UserContext
    // (currentLab, ageGroup) rather than asking the caller to repeat
    // those fields — one source of truth per fact.
    const persona = this.dependencies.mentorPersonaEngine.selectPersona({
      currentLab: userContext.currentLab,
      ageGroup: userContext.ageGroup,
      teacherModeRequested: input.teacherModeRequested ?? false,
    })

    const safetyRules = this.dependencies.safetyRulesEngine.getRules()

    return this.dependencies.promptCompositionEngine.compose({
      userContext,
      journeyContext,
      mindContext,
      conversationContext,
      persona,
      safetyRules,
    })
  }

  formatResponse(raw: RawAIResponseInput): FormattedResponse {
    return this.dependencies.responseFormatter.format(raw)
  }
}

export function createAIIntelligenceLayer(overrides: Partial<AIIntelligenceLayerDependencies> = {}): AIIntelligenceLayer {
  return new DefaultAIIntelligenceLayer({ ...createDefaultDependencies(), ...overrides })
}
