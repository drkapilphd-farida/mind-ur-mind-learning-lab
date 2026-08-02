// Visual Width Validator™ — the pipeline step between chunk/phrase
// generation and rendering:
//   Sentence → Chunk Builder → Visual Width Validator → Typography Engine → Renderer
//
// The Typography Engine (FitText/.fit-text in globals.css) guarantees text
// never overflows its card — but "doesn't overflow" and "instantly
// perceivable as one complete unit" are different guarantees. A word that
// only fits by wrapping or hyphenating mid-word at the smallest allowed size
// still forces the reader to decode it in pieces, which fails Quantum Speed
// Reading's core pedagogy regardless of whether the CSS is technically safe.
// This validator keeps that content out of the candidate pool in the first
// place, so typography is never asked to rescue it.
//
// Pure content-generation-time logic — no DOM, no measurement. Uses a
// conservative worst-case estimate (average bold-sans character width) at
// each role's floor font-size and minimum realistic container width. These
// constants are kept in sync with — not read from — the corresponding
// `--fit-min` and `--fit-cqi-cap` values in globals.css's `.fit-text-*`
// rules; if those change, update both.

// Mirrors FitTextRole minus 'symbol' — single-character symbol/number
// content is never at risk of this failure mode.
export type VisualRole = 'display' | 'option' | 'line'

// Matches each role's --fit-min in globals.css.
const MIN_FONT_PX: Record<VisualRole, number> = {
  display: 18,
  option: 12,
  line: 16,
}

// Conservative minimum realistic container width (px) per role — the
// narrowest a card is expected to be at the smallest supported viewport
// (mobile), not the typical/average width. If content fits here, it fits
// everywhere wider (desktop, laptop, tablet).
const MIN_CONTAINER_WIDTH_PX: Record<VisualRole, number> = {
  display: 260,
  option: 110,
  line: 240,
}

// Bold sans-serif characters average roughly 0.55–0.6em wide; 0.6 errs
// conservative (rejects more readily) rather than risk a false pass.
const AVG_CHAR_WIDTH_EM = 0.6

// Splits on whitespace AND hyphens — a hyphenated compound (e.g.
// "right-hemisphere") is allowed to break at its own hyphen, a natural,
// readable break, not the letter-by-letter failure this guards against.
// Only genuinely unbreakable runs of characters need to fit whole.
function atomicUnits(text: string): string[] {
  return text
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean)
}

function unitFitsAtFloor(unit: string, role: VisualRole): boolean {
  const widthPx = unit.length * AVG_CHAR_WIDTH_EM * MIN_FONT_PX[role]
  return widthPx <= MIN_CONTAINER_WIDTH_PX[role]
}

// True only if every atomic unit in `text` can render on its own line at
// the role's floor font size, in the narrowest realistic card. Multi-word
// wrapping across lines is fine (Multi-Line Reading is built entirely on
// exactly that) — only a single unit needing to break mid-word is not.
export function isVisuallyValid(text: string, role: VisualRole): boolean {
  const units = atomicUnits(text)
  if (units.length === 0) return false
  return units.every((unit) => unitFitsAtFloor(unit, role))
}
