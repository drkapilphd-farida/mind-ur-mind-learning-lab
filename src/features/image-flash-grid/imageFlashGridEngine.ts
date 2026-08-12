// Image Flash Grid™ — pure photographic icon-recall engine logic,
// deliberately kept free of React. Own-copy of wordFlashGridEngine.ts's
// exact shape (same escalation, same scoped-picker-with-decoys design),
// swapping the open-ended word vocabulary for a bank of distinct, vibrant
// single-glyph icons — pure shape/image recall, no linguistic component
// at all, the genuinely different cognitive skill this exercise trains
// versus its three siblings (dot position, digit, word).
export type ImageFlashGridSize = 4 | 5

export const IMAGE_FLASH_GRID_SIZES: readonly ImageFlashGridSize[] = [4, 5]

export const IMAGE_FLASH_GRID_ROUNDS_PER_SESSION = 5

export type ImageFlashTargetCell = { cellIndex: number; icon: string }

// Both escalation axes run together across the 5 rounds: icon count climbs
// from 3 to the spec's own 6-icon ceiling (holding at 6 for the last two
// rounds, since there's no headroom left above it), while flash duration
// keeps shrinking every round, including after icon count has already
// capped — so round 5 is still measurably harder than round 4. Identical
// shape to numberFlashGridEngine.ts's / wordFlashGridEngine.ts's own
// progression, by design — all four Right Brain flash-grid exercises
// share one difficulty language.
const ICON_COUNTS_BY_ROUND: readonly number[] = [3, 4, 5, 6, 6]
const FLASH_DURATION_MS_BY_ROUND: readonly number[] = [1000, 850, 700, 600, 500]

// Distinct, vibrant, single-glyph thematic icons — real emoji (no lorem,
// no filler, no AI/API call), each visually distinct from every other so
// recall genuinely tests "which icon was here," not "which of these two
// near-identical glyphs." 20 icons gives comfortable headroom above the
// 6-icon round ceiling for both distinct target selection and picker
// decoys, matching wordFlashGridEngine.ts's own 20-word bank size.
export const ICON_FLASH_BANK: readonly string[] = [
  '⭐',
  '💎',
  '⚡',
  '🔥',
  '☀️',
  '🌙',
  '🌳',
  '🌊',
  '🌈',
  '❄️',
  '🍀',
  '🦋',
  '🌸',
  '🌵',
  '🔮',
  '🎯',
  '🎵',
  '🍁',
  '🌻',
  '🪐',
]

const PICKER_DECOY_COUNT = 4

export function totalCellsForGridSize(gridSize: ImageFlashGridSize): number {
  return gridSize * gridSize
}

// Never ask for more than half the grid's own cells, and never more
// distinct icons than the bank actually has — keeps recall genuinely
// achievable even if the round progression, grid size options, or bank
// size ever change. With today's 4×4-and-up grids, 3-6 icon range, and
// 20-icon bank, neither cap ever actually triggers.
export function iconCountForRound(roundIndex: number, gridSize: ImageFlashGridSize): number {
  const base = ICON_COUNTS_BY_ROUND[roundIndex] ?? ICON_COUNTS_BY_ROUND[ICON_COUNTS_BY_ROUND.length - 1]!
  return Math.min(base, Math.floor(totalCellsForGridSize(gridSize) / 2), ICON_FLASH_BANK.length)
}

export function flashDurationMsForRound(roundIndex: number): number {
  return FLASH_DURATION_MS_BY_ROUND[roundIndex] ?? FLASH_DURATION_MS_BY_ROUND[FLASH_DURATION_MS_BY_ROUND.length - 1]!
}

// A Fisher-Yates shuffle of a readonly array, returned as a new array —
// the one piece of genuinely shared shuffling logic both pickTargetIcons
// (shuffling cell positions) and buildIconPickerOptions (shuffling icon
// order) need, so it's factored once here rather than duplicated twice
// within this same file.
function shuffle<T>(items: readonly T[], randomFn: () => number): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}

function pickCellIndices(totalCells: number, count: number, randomFn: () => number): number[] {
  const pool = Array.from({ length: totalCells }, (_, index) => index)
  const pickCount = Math.min(Math.max(count, 0), totalCells)
  return shuffle(pool, randomFn)
    .slice(0, pickCount)
    .sort((a, b) => a - b)
}

// Picks `count` distinct cells and assigns each a DISTINCT icon from the
// bank — repeating an icon within a round would make the picker trivially
// guessable ("only one cell could be 🔥"), so distinctness here is a real
// fairness requirement, matching wordFlashGridEngine.ts's identical
// reasoning for words (as opposed to numberFlashGridEngine.ts's digits,
// which deliberately allow repeats since there are only 10 possible
// values). `randomFn` is injectable (defaults to Math.random) purely so
// tests can drive it deterministically; it's called first for the cell
// shuffle, then for the icon shuffle, in that fixed order.
export function pickTargetIcons(totalCells: number, count: number, randomFn: () => number = Math.random): ImageFlashTargetCell[] {
  const cellIndices = pickCellIndices(totalCells, count, randomFn)
  const icons = shuffle(ICON_FLASH_BANK, randomFn).slice(0, cellIndices.length)
  return cellIndices.map((cellIndex, index) => ({ cellIndex, icon: icons[index]! }))
}

// The picker a recall round actually shows: every real target icon, plus
// a handful of decoys drawn from the rest of the bank (so recall
// genuinely tests "was 🔥 really here," not "which of these 3 icons
// wasn't blank"), all shuffled together so position never leaks which
// entries are targets.
export function buildIconPickerOptions(targetIcons: readonly string[], randomFn: () => number = Math.random, decoyCount = PICKER_DECOY_COUNT): string[] {
  const remainingBank = ICON_FLASH_BANK.filter((icon) => !targetIcons.includes(icon))
  const decoys = shuffle(remainingBank, randomFn).slice(0, Math.min(decoyCount, remainingBank.length))
  return shuffle([...targetIcons, ...decoys], randomFn)
}

export function computeAccuracyPercent(correctCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0
  return Math.round((correctCount / totalCount) * 100)
}
