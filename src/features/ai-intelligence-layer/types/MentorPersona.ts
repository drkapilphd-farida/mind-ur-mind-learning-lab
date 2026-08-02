import type { MentorPersonaId } from './MentorPersonaId'

// One persona's full data — `systemPromptFragment` is the deterministic
// text the Prompt Composition Engine embeds verbatim into the final
// systemPrompt; `focusAreas` documents which labs/topics this persona
// is meant for, used by DefaultMentorPersonaEngine's own selection
// logic (and inspectable by a caller without re-deriving it).
export type MentorPersona = {
  id: MentorPersonaId
  displayName: string
  tone: string
  focusAreas: readonly string[]
  systemPromptFragment: string
}
