import type { Memory, MemoryImportance } from '../domain'

const IMPORTANCE_ORDER: readonly MemoryImportance[] = ['critical', 'high', 'medium', 'low', 'temporary']

function importanceRank(importance: MemoryImportance): number {
  return IMPORTANCE_ORDER.indexOf(importance)
}

// Shared by every DefaultMemoryRetrievalService method that needs
// "most important, then most recent" ordering — "no duplicated logic."
export function sortByImportanceThenRecency(memories: readonly Memory[]): readonly Memory[] {
  return [...memories].sort((a, b) => importanceRank(a.importance) - importanceRank(b.importance) || b.createdAt.localeCompare(a.createdAt))
}
