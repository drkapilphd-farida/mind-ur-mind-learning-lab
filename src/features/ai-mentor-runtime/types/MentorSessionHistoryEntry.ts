import type { MentorSessionStatus } from './MentorSession'

// AI Mentor™ Sprint-4 — Session History. One real, past or present
// mentor session, with its real turn count — never a preview/summary of
// what was said, just a real structural fact (how many real turns
// happened), the same "structural fact, not content" discipline this
// module's own recommendations already follow.
export type MentorSessionHistoryEntry = {
  id: string
  status: MentorSessionStatus
  startedAt: string
  endedAt: string | null
  turnCount: number
}
