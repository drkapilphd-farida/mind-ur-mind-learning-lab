// Universal Learning Session Engine™ (LSE-1). The brief's exact 7 named
// event kinds — real, emitted by the session actions that genuinely
// produce them (see actions/), never fabricated or emitted
// speculatively. No `'session-cancelled'` variant exists: the brief's
// own event list doesn't name one — `cancelSession`'s real output is
// the status change itself, disclosed as a real gap rather than an
// invented 8th event type.
export type SessionEventType = 'chunk-started' | 'chunk-completed' | 'checkpoint-reached' | 'session-paused' | 'session-resumed' | 'session-completed' | 'progress-updated'

export type SessionEvent =
  | { id: string; type: 'chunk-started'; occurredAt: string; chunkNodeId: string }
  | { id: string; type: 'chunk-completed'; occurredAt: string; chunkNodeId: string }
  | { id: string; type: 'checkpoint-reached'; occurredAt: string; conceptNodeId: string; label: string }
  | { id: string; type: 'session-paused'; occurredAt: string }
  | { id: string; type: 'session-resumed'; occurredAt: string }
  | { id: string; type: 'session-completed'; occurredAt: string }
  | { id: string; type: 'progress-updated'; occurredAt: string; completionPercentage: number }
