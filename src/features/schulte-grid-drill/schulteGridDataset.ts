// Schulte Grid Speed Drill™ — a 5×5 visual focus and peripheral search
// warmup, deliberately its own folder/content, separate from every
// Reading Mode (no shared files, no route collision). Unlike every
// Reading Mode's dataset, there is no real-text content to author here —
// the "content" is simply the numbers 1-25 in a genuinely randomized
// grid position, regenerated fresh for every attempt.
export const SCHULTE_GRID_SIZE = 5
export const SCHULTE_GRID_TOTAL_CELLS = SCHULTE_GRID_SIZE * SCHULTE_GRID_SIZE

// A real Fisher-Yates shuffle (uniform random permutation), not a
// lorem-ipsum-style placeholder — every cell genuinely ends up in a
// random position, verified live per attempt. Deliberately called only
// client-side, at the moment a new attempt actually starts (never at
// module scope or during any server render), since Math.random() output
// must never differ between server and client for the same render.
export function generateShuffledSchulteGrid(): readonly number[] {
  const numbers = Array.from({ length: SCHULTE_GRID_TOTAL_CELLS }, (_, index) => index + 1)
  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    // i/j are always valid in-bounds indices here (0 <= j <= i < length),
    // but noUncheckedIndexedAccess still types array reads as possibly
    // undefined — guard defensively rather than assert.
    const atI = numbers[i]
    const atJ = numbers[j]
    if (atI === undefined || atJ === undefined) continue
    numbers[i] = atJ
    numbers[j] = atI
  }
  return numbers
}
