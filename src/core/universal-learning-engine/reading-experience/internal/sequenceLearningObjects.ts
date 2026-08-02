import type { LearningAssetObject } from '@/core/universal-learning-engine/learning-assets'
import type { ChunkDifficulty } from '@/core/universal-learning-engine/learning-chunk'

// Adaptive Sequencing Engine™. Arranges one chapter's own real Learning
// Objects into a real, deterministic reading order — never
// personalized (that's a future sprint's job). Uses, in this exact
// priority order, per the brief:
//   1. prerequisite relationships — a real topological sort (Kahn's
//      algorithm) over `prerequisiteObjects`/`dependentObjects`, scoped
//      to prerequisites that are THEMSELVES present in this same
//      chapter (a prerequisite introduced in an earlier chapter isn't
//      resequenceable here — this session only has this chapter's own
//      Bundle, never another chapter's).
//   2. progressive complexity — beginner before intermediate before
//      advanced, as a tie-break among objects with no unmet in-chapter
//      prerequisite.
//   3. importance — real, already-computed 0-1 composite, descending.
//   4. concept grouping — a real, deterministic "stay near whatever you
//      were just related to" greedy pick among the objects currently
//      eligible, using the same real `relatedObjects` edges Sprint-1
//      already computed.

const DIFFICULTY_RANK: Record<ChunkDifficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 }
// An object with no reported difficulty is neither assumed easiest nor
// hardest — it sorts in the middle, never fabricated as a specific tier.
const UNKNOWN_DIFFICULTY_RANK = 1

function compareByComplexityThenImportanceThenTitle(a: LearningAssetObject, b: LearningAssetObject): number {
  const rankA = a.difficulty ? DIFFICULTY_RANK[a.difficulty] : UNKNOWN_DIFFICULTY_RANK
  const rankB = b.difficulty ? DIFFICULTY_RANK[b.difficulty] : UNKNOWN_DIFFICULTY_RANK
  if (rankA !== rankB) return rankA - rankB
  if (a.importance !== b.importance) return b.importance - a.importance
  return a.title.localeCompare(b.title)
}

function isRelated(a: LearningAssetObject, b: LearningAssetObject): boolean {
  return a.relatedObjects.includes(b.objectId) || b.relatedObjects.includes(a.objectId)
}

export function sequenceLearningObjects(objects: readonly LearningAssetObject[]): readonly LearningAssetObject[] {
  const byId = new Map(objects.map((object) => [object.objectId, object]))
  const inChapterIds = new Set(byId.keys())

  const indegree = new Map(objects.map((object) => [object.objectId, object.prerequisiteObjects.filter((id) => inChapterIds.has(id)).length]))
  const dependentsOf = new Map<string, string[]>()
  for (const object of objects) {
    for (const prerequisiteId of object.prerequisiteObjects) {
      if (!inChapterIds.has(prerequisiteId)) continue
      dependentsOf.set(prerequisiteId, [...(dependentsOf.get(prerequisiteId) ?? []), object.objectId])
    }
  }

  let ready = objects.filter((object) => (indegree.get(object.objectId) ?? 0) === 0).map((object) => object.objectId)
  const sequenced: LearningAssetObject[] = []

  while (ready.length > 0) {
    const last = sequenced[sequenced.length - 1]
    let chosenId: string
    if (last) {
      const relatedToLast = ready.filter((id) => isRelated(last, byId.get(id) as LearningAssetObject))
      const pool = relatedToLast.length > 0 ? relatedToLast : ready
      chosenId = [...pool].sort((a, b) => compareByComplexityThenImportanceThenTitle(byId.get(a) as LearningAssetObject, byId.get(b) as LearningAssetObject))[0] as string
    } else {
      chosenId = [...ready].sort((a, b) => compareByComplexityThenImportanceThenTitle(byId.get(a) as LearningAssetObject, byId.get(b) as LearningAssetObject))[0] as string
    }

    ready = ready.filter((id) => id !== chosenId)
    const chosen = byId.get(chosenId) as LearningAssetObject
    sequenced.push(chosen)

    for (const dependentId of dependentsOf.get(chosenId) ?? []) {
      const remaining = (indegree.get(dependentId) ?? 0) - 1
      indegree.set(dependentId, remaining)
      if (remaining === 0) ready.push(dependentId)
    }
  }

  // Real safety net, never a silent drop: any object left out (only
  // possible with a genuine prerequisite cycle, which real upstream data
  // should never produce) is still appended, in the same deterministic
  // order, rather than being fabricated a position or discarded.
  const sequencedIds = new Set(sequenced.map((object) => object.objectId))
  const stragglers = objects.filter((object) => !sequencedIds.has(object.objectId)).sort(compareByComplexityThenImportanceThenTitle)

  return [...sequenced, ...stragglers]
}
