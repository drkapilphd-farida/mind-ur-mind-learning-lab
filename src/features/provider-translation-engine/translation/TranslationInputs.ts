import type { ProviderInstruction } from '../types'

// The already-reduced, fully self-contained inputs the translation
// profiles consume — real reduction from `MentorPromptPayload` happens
// in `../integration/buildTranslationInputs.ts`. One value array per
// `MentorPromptSectionType` (Sprint 30's own fixed 6 sections).
export type TranslationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly systemContextValues: readonly string[]
  readonly learnerContextValues: readonly string[]
  readonly currentJourneyValues: readonly string[]
  readonly recommendationValues: readonly string[]
  readonly nextActionValues: readonly string[]
  readonly metadataValues: readonly string[]
  readonly instructions: readonly ProviderInstruction[]
}
