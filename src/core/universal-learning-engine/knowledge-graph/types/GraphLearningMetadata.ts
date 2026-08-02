// Learning Knowledge Graph™ (UCE-4) — RESERVED Learning Layer extension
// point. "Do NOT implement business logic. Design production-ready
// extension points only." Every field is optional and none are
// populated this sprint — a future engine (UCE-5, the Learning Session
// Engine) attaches real learning-order/adaptive data here without
// redesigning ConceptGraphNode or the graph model around it.
export type ConceptRole = 'core' | 'supporting' | 'optional' | 'advanced'

export type GraphLearningMetadata = {
  // Future engine — this concept's real position in an optimal learning
  // sequence across the whole graph.
  learningOrder?: number
  // Future engine — concept node ids a learner must master before this one.
  mustLearnBefore?: readonly string[]
  // Future engine — concept node ids recommended to study right after this one.
  recommendedNext?: readonly string[]
  // Future engine — this concept's real pedagogical role once classified.
  conceptRole?: ConceptRole
  // Future engine — how urgently this concept needs revision, 0-1.
  revisionPriority?: number
  // Future engine — id of the learning journey/path this concept belongs to.
  learningJourneyId?: string
  // Future engine — adaptive, per-learner-model weighting, 0-1.
  adaptiveWeight?: number
}
