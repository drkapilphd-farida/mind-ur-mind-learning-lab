// ESP Zener Card Telepathy Sprint™ — the first Intuition Development
// exercise, deliberately its own folder/content, separate from every
// Reading Mode and every other advanced training exercise (no shared
// files, no route collision). A genuinely random 25-card Zener deck (5
// copies of each of the 5 classic ESP symbols) — mirrors the real
// historical Zener-card parapsychology test protocol exactly, rather than
// an arbitrary round count, and keeps each symbol's true baseline
// probability an honest 1-in-5 (20%) per guess throughout the whole deck.
export type ZenerSymbolId = 'circle' | 'cross' | 'waves' | 'square' | 'star'

export type ZenerSymbolDefinition = {
  id: ZenerSymbolId
  label: string
}

export const ZENER_SYMBOLS: readonly ZenerSymbolDefinition[] = [
  { id: 'circle', label: 'Circle' },
  { id: 'cross', label: 'Cross' },
  { id: 'waves', label: 'Waves' },
  { id: 'square', label: 'Square' },
  { id: 'star', label: 'Star' },
] as const

const COPIES_PER_SYMBOL = 5
export const ZENER_DECK_SIZE = ZENER_SYMBOLS.length * COPIES_PER_SYMBOL

// A real Fisher-Yates shuffle (uniform random permutation) of a genuine
// 5-of-each-symbol deck — not a lorem-ipsum-style placeholder. Client-side
// only, generated fresh per attempt (never at module scope, never during
// any server render), same convention as generateShuffledSchulteGrid.
export function generateShuffledZenerDeck(): readonly ZenerSymbolId[] {
  const deck: ZenerSymbolId[] = []
  for (const symbol of ZENER_SYMBOLS) {
    for (let i = 0; i < COPIES_PER_SYMBOL; i += 1) {
      deck.push(symbol.id)
    }
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const atI = deck[i]
    const atJ = deck[j]
    if (atI === undefined || atJ === undefined) continue
    deck[i] = atJ
    deck[j] = atI
  }
  return deck
}

// Streak & Multiplier System — every 3 consecutive correct guesses bumps
// the multiplier by +1 (streak 0-2 -> x1, 3-5 -> x2, 6-8 -> x3, ...),
// applied to a flat base-points value per correct guess. A single,
// deterministic formula both the live Canvas and the completion screen
// can share, rather than duplicating the escalation logic in two places.
export const BASE_POINTS_PER_CORRECT_GUESS = 100
const STREAK_MULTIPLIER_STEP = 3

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForCorrectGuess(streakAfterThisGuess: number): number {
  return BASE_POINTS_PER_CORRECT_GUESS * computeStreakMultiplier(streakAfterThisGuess)
}
