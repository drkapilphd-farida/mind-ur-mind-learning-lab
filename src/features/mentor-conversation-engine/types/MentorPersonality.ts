import type { PersonalityTrait } from './PersonalityTrait'

// MentorPersonality™ — one fixed personality (all 5 traits at once),
// not a choice among alternatives (that's what Personas are for in
// other layers of this app — this sprint models a single, consistent
// mentor identity).
export type MentorPersonality = {
  traits: readonly PersonalityTrait[]
  description: string
}
