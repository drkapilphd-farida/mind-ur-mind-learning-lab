import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'

export type TopologicalSortResult = {
  // Real topological order — concept node ids only, excluding any
  // concept that could not be validly ordered (see unorderedConceptIds).
  order: readonly string[]
  // Real: every concept node id that could not be given a valid order —
  // honestly named, not overclaimed as "cyclic": this includes concepts
  // that directly participate in a real cycle AND concepts that merely
  // transitively depend on one (a node blocked by an upstream cycle can
  // never reach in-degree 0 either, even though it isn't itself part of
  // the cycle). Disclosed simplification: if the graph contains multiple
  // independent cycles, every blocked node is reported in this one
  // combined group rather than split by which specific cycle blocks it —
  // every id reported here genuinely could NOT be ordered (no false
  // positives), but a caller wanting to distinguish "in a cycle" from
  // "blocked by one" needs a future enhancement.
  unorderedConceptIds: readonly string[]
}

// UCE-4's real graph edges directly connect concept-to-concept
// (`builds-upon`) or chunk-to-concept (`prerequisite`/`depends-on`/
// `introduces` — chunk-scoped, per UCE-4's own design, since UCE-3B's
// source data is chunk-scoped, not concept-scoped). A real concept-to-
// concept ordering constraint is derived from the chunk-scoped edges:
// if chunk C has a real prerequisite/depends-on edge to concept P, and C
// also has a real introduces edge to concept X, then P must genuinely
// come before X — X's chunk explicitly named P as something it depends
// on, and X's chunk is P's real means of demonstrating that. This is a
// real derivation from two already-real edge sets, never a guess.
// Exported so computeDependencyChain.ts derives a concept's transitive
// prerequisite closure from the exact same real "before" relationship
// this sort uses — one real implementation, never two that could drift.
export function buildBeforeMap(graph: LearningKnowledgeGraph): Map<string, Set<string>> {
  const before = new Map<string, Set<string>>()
  const addBefore = (target: string, prerequisite: string): void => {
    if (target === prerequisite) return
    const set = before.get(target) ?? new Set<string>()
    set.add(prerequisite)
    before.set(target, set)
  }

  for (const edge of graph.edges) {
    if (edge.type === 'builds-upon') addBefore(edge.sourceNodeId, edge.targetNodeId)
  }

  const chunkPrerequisiteConcepts = new Map<string, Set<string>>()
  const chunkIntroducedConcepts = new Map<string, Set<string>>()

  for (const edge of graph.edges) {
    if (edge.type === 'prerequisite' || edge.type === 'depends-on') {
      const set = chunkPrerequisiteConcepts.get(edge.sourceNodeId) ?? new Set<string>()
      set.add(edge.targetNodeId)
      chunkPrerequisiteConcepts.set(edge.sourceNodeId, set)
    }
    if (edge.type === 'introduces') {
      const set = chunkIntroducedConcepts.get(edge.sourceNodeId) ?? new Set<string>()
      set.add(edge.targetNodeId)
      chunkIntroducedConcepts.set(edge.sourceNodeId, set)
    }
  }

  for (const [chunkId, prerequisites] of chunkPrerequisiteConcepts) {
    const introduced = chunkIntroducedConcepts.get(chunkId)
    if (!introduced) continue
    for (const prerequisite of prerequisites) {
      for (const concept of introduced) addBefore(concept, prerequisite)
    }
  }

  return before
}

// AI Learning Analysis Engine™ (UCE-5). Pure. Real Kahn's-algorithm
// topological sort over the derived concept-to-concept ordering above.
// Also the real, single source of truth for cycle/blockage detection — a
// topological order is mathematically impossible for a node still stuck
// with a positive in-degree once every orderable node has been
// processed, so `unorderedConceptIds` falls directly out of the same
// run, never a second, separately-computed check that could disagree
// with the sort. Deterministic: nodes with equal in-degree are processed
// in sorted-id order, so the same graph always produces the same order.
export function topologicalSort(graph: LearningKnowledgeGraph): TopologicalSortResult {
  const conceptIds = graph.nodes.filter((node) => node.type === 'concept').map((node) => node.id)
  const before = buildBeforeMap(graph)

  const inDegree = new Map<string, number>()
  const after = new Map<string, Set<string>>()
  for (const id of conceptIds) {
    inDegree.set(id, 0)
    after.set(id, new Set())
  }

  for (const [conceptId, prerequisites] of before) {
    if (!after.has(conceptId)) continue
    for (const prerequisite of prerequisites) {
      if (!after.has(prerequisite)) continue
      after.get(prerequisite)?.add(conceptId)
      inDegree.set(conceptId, (inDegree.get(conceptId) ?? 0) + 1)
    }
  }

  const queue = conceptIds.filter((id) => (inDegree.get(id) ?? 0) === 0)
  const order: string[] = []
  const processed = new Set<string>()

  while (queue.length > 0) {
    queue.sort()
    const current = queue.shift() as string
    order.push(current)
    processed.add(current)

    for (const next of after.get(current) ?? []) {
      const remaining = (inDegree.get(next) ?? 0) - 1
      inDegree.set(next, remaining)
      if (remaining === 0) queue.push(next)
    }
  }

  const unorderedConceptIds = conceptIds.filter((id) => !processed.has(id))
  return { order, unorderedConceptIds }
}
