// Quantum Hidden Target Grid™ — the second Intuition Development exercise,
// deliberately its own folder/content, separate from ESP Zener Card
// Telepathy Sprint™ and every other exercise (no shared files, no route
// collision). A 4×4 grid of hidden boxes — each session runs exactly
// GRID_SIZE rounds, one per tile, with every tile guaranteed to be the
// target exactly once (a shuffled sequence, not independent per-round
// random draws), the same "fair, honest baseline" design already used by
// ESP Zener's own 25-card deck — just expressed over grid positions
// instead of card symbols.
export const GRID_COLUMNS = 4
export const GRID_ROWS = 4
export const GRID_SIZE = GRID_COLUMNS * GRID_ROWS

// A real Fisher-Yates shuffle of every tile index (0..GRID_SIZE-1) — not
// a lorem-ipsum-style placeholder. Client-side only, generated fresh per
// attempt (never at module scope, never during any server render), same
// convention as generateShuffledSchulteGrid/generateShuffledZenerDeck.
export function generateShuffledTargetSequence(): readonly number[] {
  const sequence = Array.from({ length: GRID_SIZE }, (_, index) => index)
  for (let i = sequence.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const atI = sequence[i]
    const atJ = sequence[j]
    if (atI === undefined || atJ === undefined) continue
    sequence[i] = atJ
    sequence[j] = atI
  }
  return sequence
}

// Streak & Energy Points — every 3 consecutive correct guesses bumps the
// multiplier by +1 (streak 0-2 -> x1, 3-5 -> x2, 6-8 -> x3, ...), applied
// to a flat base-energy value per correct guess. Deliberately its own
// independent copy of this formula rather than importing ESP Zener's
// espZenerDataset.ts — every exercise in this project owns its own
// dataset/scoring logic self-contained (RVSE, Dynamic Chunk Sliding,
// Flash Recall, Schulte Grid, ESP Zener all follow this same "no
// cross-exercise dataset imports" convention), even where the formula
// shape happens to match a sibling exercise.
export const BASE_ENERGY_PER_CORRECT_GUESS = 100
const STREAK_MULTIPLIER_STEP = 3

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computeEnergyForCorrectGuess(streakAfterThisGuess: number): number {
  return BASE_ENERGY_PER_CORRECT_GUESS * computeStreakMultiplier(streakAfterThisGuess)
}
