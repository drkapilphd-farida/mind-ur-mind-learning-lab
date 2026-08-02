import type { ConversationContext, ConversationMemory, ConversationPromptPackage } from '../types'
import type { PromptComposer } from '../contracts'
import { MENTOR_PERSONALITY, TONE_BY_CONVERSATION_TYPE } from '../personality'
import { CONVERSATION_SAFETY_RULES } from '../safety'

// Implements PromptComposer. `systemPrompt` is built from exactly 4
// ingredients, in order — the fixed MentorPersonality description, the
// tone for this ConversationType, every safety rule, and a one-line
// memory note — so no ConversationPromptPackage this composer produces
// can omit the safety framing. `contextSummary` only ever includes
// fields ConversationContext actually has (never a fabricated line for
// a `null` field — "No hallucinated learner data").
export class DefaultPromptComposer implements PromptComposer {
  compose(context: ConversationContext, memory: ConversationMemory): ConversationPromptPackage {
    const tone = TONE_BY_CONVERSATION_TYPE[context.conversationType]
    const safetyGuidance = CONVERSATION_SAFETY_RULES.map((rule) => `- ${rule.description}`).join('\n')

    const memoryLine = memory.lastConversationType
      ? `The learner's last conversation was a "${memory.lastConversationType}" conversation.`
      : "This is the learner's first conversation with the mentor."

    const contextLines = [
      `Learner: ${context.learnerName}.`,
      context.focusSkill !== null ? `Focus skill: ${context.focusSkill}.` : null,
      context.currentMilestone !== null ? `Current milestone: ${context.currentMilestone}.` : null,
      context.recommendedExercise !== null ? `Recommended exercise: ${context.recommendedExercise}.` : null,
      context.progressPercent !== null ? `Progress: ${context.progressPercent}%.` : null,
      context.streak !== null ? `Streak: ${context.streak} days.` : null,
    ].filter((line): line is string => line !== null)

    const systemPrompt = [MENTOR_PERSONALITY.description, `Tone for this conversation: ${tone}.`, '', 'Safety rules (always follow):', safetyGuidance, '', memoryLine].join(
      '\n',
    )

    return { systemPrompt, tone, contextSummary: contextLines.join('\n') }
  }
}

export function createPromptComposer(): PromptComposer {
  return new DefaultPromptComposer()
}
