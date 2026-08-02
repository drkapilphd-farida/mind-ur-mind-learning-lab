// Universal Learning Session Engine™ (LSE-1). Real position within a
// session's own `LearningQueue`. `chunkNodeId` is `null` only when the
// session has no queue item to point at — before starting, or when the
// ULO produced a real, honest zero-chunk queue (an edge case, not a
// crash).
export type SessionPosition = {
  queueIndex: number
  chunkNodeId: string | null
}
