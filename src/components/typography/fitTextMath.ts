// Typography Engine™ — pure sizing math, kept separate from FitText.tsx
// (which has JSX) so it's directly unit-testable without a JSX-aware test
// runner. See the `.fit-text` rule in globals.css for how this combines
// with the container-width (cqi) term to produce the final font size.

// Short/medium content (up to BASELINE density) costs nothing — shrink only
// starts past that, so "connection"-length words stay comfortably large
// instead of prematurely hitting a role's floor. K is tuned so the longest
// required hard word (23 chars, e.g. "electroencephalography") reaches
// exactly the floor (shrink = 1) in every role — verified empirically
// against real rendered widths, not just asserted.
const BASELINE_DENSITY = 6
const K = 1 / (23 - BASELINE_DENSITY)

// Longest word dominates the shrink — that's what actually risks overflow.
// Extra words add a light penalty (they can wrap at spaces, so need less
// than a single word of the same length would). Overall bulk adds the
// least. This is what makes a 4-word phrase of short words stay large
// while a single very long word shrinks hard.
export function computeShrink(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 0

  const longest = Math.max(...words.map((w) => w.length))
  const totalChars = text.length
  const density =
    longest +
    0.3 * Math.max(0, words.length - 1) +
    0.05 * Math.max(0, totalChars - longest)

  return Math.min(1, Math.max(0, density - BASELINE_DENSITY) * K)
}
