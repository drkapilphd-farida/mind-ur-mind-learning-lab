import type { MentorPersona, MentorPersonaSelectionInput } from '../types'
import type { MentorPersonaEngine } from '../contracts'
import { MENTOR_PERSONAS } from './MENTOR_PERSONAS'
import { UnknownMentorPersonaError } from './UnknownMentorPersonaError'

// Implements MentorPersonaEngine. Deterministic priority order: (1) an
// explicit teacherModeRequested always wins; (2) a child learner routes
// to Parent Guide™ (the guidance is meant to be read by the parent);
// (3) otherwise the current lab is matched against each persona's own
// focusAreas (Reading/Memory/Focus Coach); (4) otherwise Friendly
// Mentor™ is the default. No randomness, no hidden state — the same
// input always selects the same persona.
export class DefaultMentorPersonaEngine implements MentorPersonaEngine {
  private mustGetPersona(id: string): MentorPersona {
    const persona = this.getPersonaById(id)
    if (!persona) throw new UnknownMentorPersonaError(id)
    return persona
  }

  selectPersona(input: MentorPersonaSelectionInput): MentorPersona {
    if (input.teacherModeRequested) return this.mustGetPersona('teacher-mode')
    if (input.ageGroup === 'child') return this.mustGetPersona('parent-guide')

    const { currentLab } = input
    if (currentLab) {
      const labMatch = MENTOR_PERSONAS.find((persona) => persona.focusAreas.includes(currentLab))
      if (labMatch) return labMatch
    }

    return this.mustGetPersona('friendly-mentor')
  }

  getPersonaById(id: string): MentorPersona | undefined {
    return MENTOR_PERSONAS.find((persona) => persona.id === id)
  }

  listPersonas(): readonly MentorPersona[] {
    return MENTOR_PERSONAS
  }
}

export function createMentorPersonaEngine(): MentorPersonaEngine {
  return new DefaultMentorPersonaEngine()
}
