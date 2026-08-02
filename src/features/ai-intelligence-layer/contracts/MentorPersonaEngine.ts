import type { MentorPersona, MentorPersonaSelectionInput } from '../types'

// "Create deterministic mentor personalities... Mock only." Selection
// is pure and deterministic: the same input always yields the same
// persona — no randomness, no hidden state.
export interface MentorPersonaEngine {
  selectPersona(input: MentorPersonaSelectionInput): MentorPersona
  getPersonaById(id: string): MentorPersona | undefined
  listPersonas(): readonly MentorPersona[]
}
