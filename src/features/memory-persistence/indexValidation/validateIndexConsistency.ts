import type { Memory, MemoryId } from '../domain'
import type { MemoryIndex } from '../indexDomain'
import { BUILTIN_INDEX_KEY_EXTRACTORS } from '../builtinIndexes'
import type { IndexValidationIssue } from './IndexValidationIssue'
import type { IndexValidationResult } from './IndexValidationResult'

// Pure — given an index and the authoritative set of memories it
// should reflect, checks all four of the brief's named categories:
//
// - duplicate-entry: the same `key` appears in more than one entry.
// - missing-reference: an entry references a memory id that doesn't
//   exist in `memories` (a dangling reference).
// - invalid-key: an entry's `key` doesn't match what the built-in
//   extractor for this index actually produces for one of its
//   referenced memories (a corrupted/stale association).
// - orphaned-entry: an entry has no valid (existing) memory
//   references at all.
//
// "Consistency verification" is the result as a whole: `valid` is
// true iff no issues were found across all four checks.
export function validateIndexConsistency(index: MemoryIndex, memories: readonly Memory[]): IndexValidationResult {
  const issues: IndexValidationIssue[] = []
  const memoriesById = new Map<MemoryId, Memory>(memories.map((memory) => [memory.id, memory]))
  const extractor = BUILTIN_INDEX_KEY_EXTRACTORS[index.metadata.indexType]

  const seenKeys = new Set<string>()

  for (const entry of index.entries) {
    if (seenKeys.has(entry.key)) {
      issues.push({
        type: 'duplicate-entry',
        key: entry.key,
        memoryId: null,
        detail: `Key "${entry.key}" appears in more than one index entry.`,
      })
    }
    seenKeys.add(entry.key)

    let hasValidReference = false

    for (const memoryId of entry.memoryIds) {
      const memory = memoriesById.get(memoryId)

      if (!memory) {
        issues.push({
          type: 'missing-reference',
          key: entry.key,
          memoryId,
          detail: `Entry "${entry.key}" references memory id "${memoryId}", which does not exist.`,
        })
        continue
      }

      hasValidReference = true

      if (!extractor(memory).includes(entry.key)) {
        issues.push({
          type: 'invalid-key',
          key: entry.key,
          memoryId,
          detail: `Memory "${memoryId}" does not actually produce key "${entry.key}" for this index.`,
        })
      }
    }

    if (!hasValidReference) {
      issues.push({
        type: 'orphaned-entry',
        key: entry.key,
        memoryId: null,
        detail: `Entry "${entry.key}" has no valid memory references.`,
      })
    }
  }

  return { valid: issues.length === 0, issues }
}
