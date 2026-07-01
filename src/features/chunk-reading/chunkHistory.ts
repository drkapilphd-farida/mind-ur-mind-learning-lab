// Chunk History™ — localStorage analytics specific to Chunk Reading.
// Stores chunk size progression history separate from the general
// difficultyHistory.ts so future AI Mentor™ can analyse reading patterns.

import type { DifficultyTier } from '@/types/exercise-engine'

export type ChunkSessionEntry = {
  timestamp: number
  tier: DifficultyTier
  wordsPerChunk: number
  accuracyPercent: number
  flashDurationMs: number
  itemCount: number
  promoted: boolean
  recovered: boolean
}

export type ChunkAnalytics = {
  totalSessions: number
  currentWordsPerChunk: number
  bestWordsPerChunk: number
  averageAccuracy: number
  bestAccuracy: number
  totalChunksProcessed: number
  recentSessions: ChunkSessionEntry[]
}

const HISTORY_KEY = (exerciseId: string): string => `chunk-history-${exerciseId}`
const MAX_ENTRIES = 50

export function loadChunkHistory(exerciseId: string): ChunkSessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ChunkSessionEntry[]) : []
  } catch { return [] }
}

export function appendChunkSession(exerciseId: string, entry: ChunkSessionEntry): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadChunkHistory(exerciseId)
    history.push(entry)
    localStorage.setItem(HISTORY_KEY(exerciseId), JSON.stringify(history.slice(-MAX_ENTRIES)))
  } catch { /* storage full — fail silently */ }
}

export function computeChunkAnalytics(exerciseId: string): ChunkAnalytics {
  const history = loadChunkHistory(exerciseId)
  if (history.length === 0) {
    return { totalSessions: 0, currentWordsPerChunk: 2, bestWordsPerChunk: 2, averageAccuracy: 0, bestAccuracy: 0, totalChunksProcessed: 0, recentSessions: [] }
  }
  const last = history[history.length - 1]!
  const avgAccuracy = Math.round(history.reduce((a, e) => a + e.accuracyPercent, 0) / history.length)
  const bestAccuracy = Math.max(...history.map((e) => e.accuracyPercent))
  const bestChunk = Math.max(...history.map((e) => e.wordsPerChunk))
  const totalChunks = history.reduce((a, e) => a + e.itemCount, 0)
  return {
    totalSessions: history.length,
    currentWordsPerChunk: last.wordsPerChunk,
    bestWordsPerChunk: bestChunk,
    averageAccuracy: avgAccuracy,
    bestAccuracy,
    totalChunksProcessed: totalChunks,
    recentSessions: history.slice(-10),
  }
}
