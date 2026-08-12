// Dot Memory Grid™ — pure spatial-memory engine logic, deliberately kept
// free of React: grid sizing, the per-round dot-count progression, random
// target-cell selection, and accuracy math. Mirrors
// schulteGridDataset.ts's own "pure generation logic, separate from the
// Canvas that renders it" split.
export type DotMemoryGridSize = 4 | 5 | 6

export const DOT_MEMORY_GRID_SIZES: readonly DotMemoryGridSize[] = [4, 5, 6]

export const DOT_MEMORY_GRID_ROUNDS_PER_SESSION = 5

export const DOT_MEMORY_FLASH_DURATION_MS = 1000

// The dot-count progression across the 5 rounds of a session — each round
// asks for one more cell than the last, per the spec's own "3 to 7 dots
// depending on difficulty" range. Deliberately NOT tied to grid size on
// its own (a session's grid size is fixed for its whole duration, chosen
// once in Settings); dot count is the axis that escalates round to round.
const BASE_DOT_COUNTS_BY_ROUND: readonly number[] = [3, 4, 5, 6, 7]

export function totalCellsForGridSize(gridSize: DotMemoryGridSize): number {
  return gridSize * gridSize
}

// Never ask for more than half the grid's own cells — keeps recall
// genuinely achievable even if the round progression or grid size options
// ever change. With today's 4×4-and-up grids and 3-7 dot range this cap
// never actually triggers (7 ≤ 8, half of the smallest grid, 16 cells).
export function dotCountForRound(roundIndex: number, gridSize: DotMemoryGridSize): number {
  const base = BASE_DOT_COUNTS_BY_ROUND[roundIndex] ?? BASE_DOT_COUNTS_BY_ROUND[BASE_DOT_COUNTS_BY_ROUND.length - 1]!
  return Math.min(base, Math.floor(totalCellsForGridSize(gridSize) / 2))
}

// A Fisher-Yates partial shuffle, picking `count` distinct cell indices out
// of `totalCells`, returned in ascending order (rendering order is what
// actually matters, not pick order — sorting keeps output deterministic
// for a given shuffle regardless of how the caller iterates it).
// `randomFn` is injectable (defaults to Math.random) purely so tests can
// drive it deterministically.
export function pickTargetCellIndices(totalCells: number, count: number, randomFn: () => number = Math.random): number[] {
  const pool = Array.from({ length: totalCells }, (_, index) => index)
  const pickCount = Math.min(Math.max(count, 0), totalCells)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1))
    const temp = pool[i]!
    pool[i] = pool[j]!
    pool[j] = temp
  }
  return pool.slice(0, pickCount).sort((a, b) => a - b)
}

export function computeAccuracyPercent(correctCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0
  return Math.round((correctCount / totalCount) * 100)
}
