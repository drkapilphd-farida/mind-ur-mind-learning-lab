// AI Mentor™ Sprint-2 — the first real conversation turn. One real,
// persisted, append-only message per real learner-mentor exchange —
// never edited, never retracted, mirroring how the migration's own
// comment describes it.
export type MentorConversationTurnRole = 'mentor' | 'learner'

export type MentorConversationTurn = {
  id: string
  mentorSessionId: string
  role: MentorConversationTurnRole
  content: string
  createdAt: string
}
