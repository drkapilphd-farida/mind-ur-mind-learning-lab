// Word Flash Grid™ — pure visual-linguistic recall engine logic,
// deliberately kept free of React. Mirrors numberFlashGridEngine.ts's own
// "pure generation logic, separate from the Canvas that renders it" split,
// but recall here is genuinely different from both siblings
// (dotMemoryGridEngine.ts, numberFlashGridEngine.ts): the vocabulary is
// open-ended (26 possible words, not a closed 0-9 set), so unlike digits
// — which are cheap enough to always offer all 10 as picker options —
// words need their own scoped picker: the round's own target words plus a
// handful of decoys drawn from the rest of the bank, not the entire bank
// every time.
export type WordFlashGridSize = 4 | 5

export const WORD_FLASH_GRID_SIZES: readonly WordFlashGridSize[] = [4, 5]

export const WORD_FLASH_GRID_ROUNDS_PER_SESSION = 5

export type WordFlashTargetCell = { cellIndex: number; word: string }

// Both escalation axes run together across the 5 rounds: word count climbs
// from 3 to the spec's own 6-word ceiling (holding at 6 for the last two
// rounds, since there's no headroom left above it), while flash duration
// keeps shrinking every round, including after word count has already
// capped — so round 5 is still measurably harder than round 4. Identical
// shape to numberFlashGridEngine.ts's own progression, by design — the
// three Right Brain flash-grid exercises share one difficulty language.
const WORD_COUNTS_BY_ROUND: readonly number[] = [3, 4, 5, 6, 6]
const FLASH_DURATION_MS_BY_ROUND: readonly number[] = [1000, 850, 700, 600, 500]

// Short, high-impact cognitive/brain-training words — real, hand-picked
// vocabulary (no lorem, no filler, no AI/API call), uppercase for visual
// punch and flash-legibility at small grid-cell sizes. 20 words gives
// comfortable headroom above the 6-word round ceiling for both distinct
// target selection and picker decoys.
export const WORD_FLASH_BANK: readonly string[] = [
  'FOCUS',
  'CALM',
  'FLOW',
  'SPARK',
  'RISE',
  'BOLD',
  'ZEN',
  'PEAK',
  'GLOW',
  'CLEAR',
  'SHARP',
  'SWIFT',
  'BRAVE',
  'QUIET',
  'BRIGHT',
  'STEADY',
  'KEEN',
  'VIVID',
  'ALERT',
  'TRUE',
]

const PICKER_DECOY_COUNT = 4

export function totalCellsForGridSize(gridSize: WordFlashGridSize): number {
  return gridSize * gridSize
}

// Never ask for more than half the grid's own cells, and never more
// distinct words than the bank actually has — keeps recall genuinely
// achievable even if the round progression, grid size options, or bank
// size ever change. With today's 4×4-and-up grids, 3-6 word range, and
// 20-word bank, neither cap ever actually triggers.
export function wordCountForRound(roundIndex: number, gridSize: WordFlashGridSize): number {
  const base = WORD_COUNTS_BY_ROUND[roundIndex] ?? WORD_COUNTS_BY_ROUND[WORD_COUNTS_BY_ROUND.length - 1]!
  return Math.min(base, Math.floor(totalCellsForGridSize(gridSize) / 2), WORD_FLASH_BANK.length)
}

export function flashDurationMsForRound(roundIndex: number): number {
  return FLASH_DURATION_MS_BY_ROUND[roundIndex] ?? FLASH_DURATION_MS_BY_ROUND[FLASH_DURATION_MS_BY_ROUND.length - 1]!
}

// A Fisher-Yates shuffle of a readonly array, returned as a new array —
// the one piece of genuinely shared shuffling logic both pickTargetWords
// (shuffling cell positions) and buildWordPickerOptions (shuffling word
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

// Picks `count` distinct cells and assigns each a DISTINCT word from the
// bank — unlike numberFlashGridEngine.ts's digits (which deliberately
// allow repeats, since there are only 10 possible values), words repeating
// within a round would make the picker trivially guessable ("only one cell
// could be BOLD"), so distinctness here is a real fairness requirement,
// not just a nicety. `randomFn` is injectable (defaults to Math.random)
// purely so tests can drive it deterministically; it's called first for
// the cell shuffle, then for the word shuffle, in that fixed order.
export function pickTargetWords(totalCells: number, count: number, randomFn: () => number = Math.random): WordFlashTargetCell[] {
  const cellIndices = pickCellIndices(totalCells, count, randomFn)
  const words = shuffle(WORD_FLASH_BANK, randomFn).slice(0, cellIndices.length)
  return cellIndices.map((cellIndex, index) => ({ cellIndex, word: words[index]! }))
}

// The picker a recall round actually shows: every real target word, plus
// a handful of decoys drawn from the rest of the bank (so recall genuinely
// tests "was BOLD really here," not "which of these 3 words wasn't
// blank"), all shuffled together so position never leaks which entries are
// targets.
export function buildWordPickerOptions(targetWords: readonly string[], randomFn: () => number = Math.random, decoyCount = PICKER_DECOY_COUNT): string[] {
  const remainingBank = WORD_FLASH_BANK.filter((word) => !targetWords.includes(word))
  const decoys = shuffle(remainingBank, randomFn).slice(0, Math.min(decoyCount, remainingBank.length))
  return shuffle([...targetWords, ...decoys], randomFn)
}

export function computeAccuracyPercent(correctCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0
  return Math.round((correctCount / totalCount) * 100)
}
