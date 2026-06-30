// Symbols and single characters for Flash Symbols™.
// Groups of visually similar characters maximise the discrimination challenge.

// Group: uppercase letters (easy at long durations, hard at short)
export const LETTERS_UPPER: readonly string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
]

// Group: digits (high visual similarity within this set)
export const DIGITS: readonly string[] = [
  '0', '1', 'l', '2', 'Z', '5', 'S', '6', '9', '8',
]

// Group: common symbols
export const SYMBOLS_COMMON: readonly string[] = [
  '@', '#', '$', '%', '&', '*', '!', '?', '+', '=',
]

// Pairs of visually similar characters — used to generate distractors
// that maximise the recognition challenge without being unfair.
export const SIMILAR_PAIRS: readonly [string, string][] = [
  ['O', '0'], ['I', 'l'], ['S', '5'], ['Z', '2'], ['G', '6'],
  ['B', '8'], ['@', 'Q'], ['$', 'S'], ['!', 'l'], ['#', 'H'],
]

export function getSymbolsByDifficulty(flashDurationMs: number): readonly string[] {
  if (flashDurationMs >= 300) return LETTERS_UPPER
  if (flashDurationMs >= 150) return [...LETTERS_UPPER, ...SYMBOLS_COMMON]
  return [...DIGITS, ...SYMBOLS_COMMON]
}

// Given a target, return 3 plausible distractor symbols.
export function getSymbolDistractors(target: string, pool: readonly string[]): string[] {
  // Prefer visually similar characters as distractors
  const similar = SIMILAR_PAIRS
    .filter(([a, b]) => a === target || b === target)
    .flatMap(([a, b]) => [a, b])
    .filter((s) => s !== target)

  const distractors: string[] = [...similar]

  // Fill up to 3 from the general pool if not enough similar pairs
  for (const s of pool) {
    if (distractors.length >= 3) break
    if (s !== target && !distractors.includes(s)) distractors.push(s)
  }

  return distractors.slice(0, 3)
}
