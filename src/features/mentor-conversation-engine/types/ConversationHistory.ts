import type { ConversationTurn } from './ConversationTurn'

// ConversationHistory™ — the full, append-only turn log for one
// session. In-memory only ("Fully Testable," no persistence concern
// this sprint) — a future real store persists this same shape.
export type ConversationHistory = {
  turns: readonly ConversationTurn[]
}
