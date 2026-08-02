// Adaptive Learning Runtime™ (LSE-2). A genuinely new event log, distinct
// from the Learning Session Engine's own `SessionEvent` — these fire
// against the runtime's own `scheduledQueue` (the chunk-strategy-ordered
// queue), not LSE-1's fixed natural-document-order `session.queue`, so
// reusing `SessionEvent` verbatim would misrepresent which queue a
// `chunk-started`/`chunk-completed` pair actually advanced through.
// `checkpoint-reached`/`progress-updated` share LSE-1's field shape by
// real coincidence (same underlying concept), not by import — kept
// independent so this layer never depends on LSE-1's event internals.
export type RuntimeEventType = 'chunk-started' | 'chunk-completed' | 'chunk-skipped' | 'chunk-repeated' | 'chunk-marked-for-revisit' | 'checkpoint-reached' | 'progress-updated' | 'runtime-paused' | 'runtime-resumed' | 'runtime-completed'

export type RuntimeEvent =
  | { id: string; type: 'chunk-started'; occurredAt: string; chunkNodeId: string }
  | { id: string; type: 'chunk-completed'; occurredAt: string; chunkNodeId: string }
  | { id: string; type: 'chunk-skipped'; occurredAt: string; chunkNodeId: string }
  | { id: string; type: 'chunk-repeated'; occurredAt: string; chunkNodeId: string; repeatCount: number }
  | { id: string; type: 'chunk-marked-for-revisit'; occurredAt: string; chunkNodeId: string }
  | { id: string; type: 'checkpoint-reached'; occurredAt: string; conceptNodeId: string; label: string }
  | { id: string; type: 'progress-updated'; occurredAt: string; completionPercentage: number }
  | { id: string; type: 'runtime-paused'; occurredAt: string }
  | { id: string; type: 'runtime-resumed'; occurredAt: string }
  | { id: string; type: 'runtime-completed'; occurredAt: string }
