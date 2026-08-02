import type { MentorPromptPayload } from '@/features/ai-mentor-prompt-assembler'
import type { TranslationInputs } from '../translation'
import type { TranslationOrchestrationInputs } from './TranslationOrchestrationInputs'

function sectionValues(payload: MentorPromptPayload, type: string): readonly string[] {
  return payload.sections.find((section) => section.type === type)?.values ?? []
}

// Pure — the one function that turns a real `MentorPromptPayload`
// (from the approved Prompt Assembly Engine) into the fully
// self-contained `TranslationInputs` the Translation Engine™
// consumes. This is the *only* place `MentorPromptPayload`'s own shape
// is inspected — nothing in `../translation/` or `../validation/`
// knows this type exists. `instructions` is passed through unchanged —
// `MentorPromptInstruction` and `ProviderInstruction` are already
// structurally identical.
export function buildTranslationInputs(inputs: TranslationOrchestrationInputs): TranslationInputs {
  const { promptPayload } = inputs

  return {
    learnerId: inputs.learnerId,
    profileId: inputs.profileId,
    systemContextValues: sectionValues(promptPayload, 'system-context'),
    learnerContextValues: sectionValues(promptPayload, 'learner-context'),
    currentJourneyValues: sectionValues(promptPayload, 'current-journey'),
    recommendationValues: sectionValues(promptPayload, 'recommendations'),
    nextActionValues: sectionValues(promptPayload, 'next-actions'),
    metadataValues: sectionValues(promptPayload, 'metadata'),
    instructions: promptPayload.instructions,
  }
}
