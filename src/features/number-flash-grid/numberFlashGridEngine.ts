// Number Flash Grid™ — pure numerical-recall engine logic, deliberately
// kept free of React. Mirrors dotMemoryGridEngine.ts's own "pure
// generation logic, separate from the Canvas that renders it" split, but
// each target here carries a DIGIT alongside its cell position — recall
// must match both where a number was AND what it was, not just where.
export type NumberFlashGridSize = 4 | 5

export const NUMBER_FLASH_GRID_SIZES: readonly NumberFlashGridSize[] = [4, 5]

export const NUMBER_FLASH_GRID_ROUNDS_PER_SESSION = 5

export type NumberFlashTargetCell = { cellIndex: number; digit: number }

// Both escalation axes the spec calls for ("more numbers or tighter
// timing") run together across the 5 rounds: digit count climbs from 3 to
// the spec's own 6-digit ceiling (holding at 6 for the last two rounds,
// since there's no headroom left above it), while flash duration keeps
// shrinking every round, including after digit count has already capped —
// so round 5 is still measurably harder than round 4.
const DIGIT_COUNTS_BY_ROUND: readonly number[] = [3, 4, 5, 6, 6]
const FLASH_DURATION_MS_BY_ROUND: readonly number[] = [1000, 850, 700, 600, 500]

export function totalCellsForGridSize(gridSize: NumberFlashGridSize): number {
  return gridSize * gridSize
}

// Never ask for more than half the grid's own cells — keeps recall
// genuinely achievable even if the round progression or grid size options
// ever change. With today's 4×4-and-up grids and 3-6 digit range this cap
// never actually triggers (6 ≤ 8, half of the smallest grid, 16 cells).
export function digitCountForRound(roundIndex: number, gridSize: NumberFlashGridSize): number {
  const base = DIGIT_COUNTS_BY_ROUND[roundIndex] ?? DIGIT_COUNTS_BY_ROUND[DIGIT_COUNTS_BY_ROUND.length - 1]!
  return Math.min(base, Math.floor(totalCellsForGridSize(gridSize) / 2))
}

export function flashDurationMsForRound(roundIndex: number): number {
  return FLASH_DURATION_MS_BY_ROUND[roundIndex] ?? FLASH_DURATION_MS_BY_ROUND[FLASH_DURATION_MS_BY_ROUND.length - 1]!
}

// A Fisher-Yates partial shuffle, picking `count` distinct cell indices out
// of `totalCells`, returned in ascending order. Own-copy of
// dotMemoryGridEngine.ts's identical pickTargetCellIndices — small,
// self-contained logic duplicated per this app's established convention
// rather than a cross-feature import.
function pickCellIndices(totalCells: number, count: number, randomFn: () => number): number[] {
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

// Picks `count` distinct cells and assigns each a random 0-9 digit (digits
// may repeat across cells within the same round — real recall can't lean
// on "every digit is unique" as a crutch). `randomFn` is injectable
// (defaults to Math.random) purely so tests can drive it deterministically;
// it's called first for the cell shuffle, then once per cell for its
// digit, in that fixed order.
export function pickTargetCells(totalCells: number, count: number, randomFn: () => number = Math.random): NumberFlashTargetCell[] {
  const cellIndices = pickCellIndices(totalCells, count, randomFn)
  return cellIndices.map((cellIndex) => ({ cellIndex, digit: Math.floor(randomFn() * 10) }))
}

export function computeAccuracyPercent(correctCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0
  return Math.round((correctCount / totalCount) * 100)
}
