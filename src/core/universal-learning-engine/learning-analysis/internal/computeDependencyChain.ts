import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildBeforeMap } from './topologicalSort'

// AI Learning Analysis Engine™ (UCE-5). Pure. Real BFS transitive
// closure over the same "before" relationship topologicalSort.ts uses —
// every concept `conceptId` genuinely depends on, directly or through a
// real chain of intermediate concepts. Breadth-first discovery order
// (nearest real prerequisites first) — not a claim about optimal
// learning sequence; `LearningAnalysis.recommendedLearningOrder` is the
// real topological order for that.
export function computeDependencyChain(graph: LearningKnowledgeGraph, conceptId: string): readonly string[] {
  const before = buildBeforeMap(graph)
  const visited = new Set<string>()
  const chain: string[] = []
  const queue: string[] = [...(before.get(conceptId) ?? [])]

  while (queue.length > 0) {
    const current = queue.shift() as string
    if (visited.has(current) || current === conceptId) continue
    visited.add(current)
    chain.push(current)
    for (const next of before.get(current) ?? []) {
      if (!visited.has(next)) queue.push(next)
    }
  }

  return chain
}
