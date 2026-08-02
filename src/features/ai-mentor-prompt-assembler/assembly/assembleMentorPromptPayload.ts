import type { MentorPromptInstruction, MentorPromptPayload, MentorPromptSection } from '../types'
import type { PromptAssemblyInputs } from './PromptAssemblyInputs'

// The fixed instruction catalog — deterministic slugs, never sentences
// ("No natural-language generation"). `system-baseline` and
// `personalization-baseline` are always included; `journey-reference`
// only when there's a journey to reference.
const BASE_INSTRUCTIONS: readonly MentorPromptInstruction[] = [
  { id: 'system-baseline', directive: 'maintain-mentor-persona' },
  { id: 'personalization-baseline', directive: 'use-personalization-context' },
]
const JOURNEY_INSTRUCTION: MentorPromptInstruction = { id: 'journey-reference', directive: 'reference-current-journey' }

// Pure — "Assemble payloads ... Produce only structured payload
// objects. No natural-language generation." Builds the 6 fixed
// sections, in the Sprint 30 brief's own Section 3 order, always — a
// section with nothing to say still appears, with an empty `values`
// array, never omitted (same "always produce" precedent as the
// Response Composition Engine, Sprint 29).
export function assembleMentorPromptPayload(inputs: PromptAssemblyInputs, now: string, id: string): MentorPromptPayload {
  const sections: MentorPromptSection[] = [
    { type: 'system-context', values: [inputs.sourceResponseId, inputs.responseSource] },
    { type: 'learner-context', values: [inputs.profileLifecycle, ...inputs.memoryReferenceIds] },
    { type: 'current-journey', values: [inputs.currentJourney ?? 'none', inputs.difficultyLevel ?? 'none'] },
    { type: 'recommendations', values: inputs.recommendationValues },
    { type: 'next-actions', values: inputs.nextActionValues },
    { type: 'metadata', values: [String(inputs.appliedAdaptationCount)] },
  ]

  const instructions: readonly MentorPromptInstruction[] = inputs.currentJourney ? [...BASE_INSTRUCTIONS, JOURNEY_INSTRUCTION] : BASE_INSTRUCTIONS

  return {
    id,
    version: 1,
    context: {
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      profileLifecycle: inputs.profileLifecycle,
      currentJourney: inputs.currentJourney,
      difficultyLevel: inputs.difficultyLevel,
    },
    sections,
    instructions,
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'prompt-assembler', generatedAt: now },
  }
}
