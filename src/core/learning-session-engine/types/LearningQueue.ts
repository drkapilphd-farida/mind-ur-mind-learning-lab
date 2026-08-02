// Universal Learning Session Engine™ (LSE-1). Real, built once per
// session start/restart by internal/buildLearningQueue.ts — never
// hand-authored. `order` is the chunk's own real
// `ulo.knowledge.chunks[].location.order`. `isCheckpoint`/
// `checkpointConceptNodeId`/`checkpointLabel` are real: true only when
// this exact chunk is the one a real `'introduces'` GraphEdge on
// `ulo.knowledge.graph` connects to one of `ulo.experience.
// learningJourney.steps`' milestone concepts — reusing UCE-6's own real
// milestone data, never re-deriving a second, possibly-different notion
// of "checkpoint."
export type LearningQueueItem = {
  chunkNodeId: string
  order: number
  isCheckpoint: boolean
  checkpointConceptNodeId?: string
  checkpointLabel?: string
}

export type LearningQueue = {
  items: readonly LearningQueueItem[]
}
