// Rapid Visual Span Expander™ — a peripheral-vision warmup: a minimal
// central fixation dot, with single word/number tokens flashing one at a
// time at genuinely wide, randomized positions across the full flash
// field (including corners and edge boundaries), paced word-by-word by
// the Master Reading Engine at a real target WPM. Deliberately its own
// folder/content, separate from every Reading Mode and Schulte Grid Speed
// Drill™ — no shared files, no route collision. Real, hand-written word
// tokens (no AI, no lorem ipsum); number tokens are generated at runtime
// (client-side only, never at module scope).
export const RAPID_VISUAL_SPAN_WORD_TOKENS: readonly string[] = [
  'focus',
  'clarity',
  'patience',
  'growth',
  'insight',
  'calm',
  'steady',
  'practice',
  'wisdom',
  'presence',
  'rhythm',
  'balance',
  'momentum',
  'curiosity',
  'resolve',
  'clear',
  'quiet',
  'anchor',
  'notice',
  'expand',
]

export type RapidVisualSpanPosition = {
  xPercent: number
  yPercent: number
}

// True Peripheral Spread Sprint — replaces the earlier fixed 8-named-zone
// layout (a modest ±34% offset from center) with a genuinely wide, fully
// randomized position anywhere across the flash field, explicitly
// including corners and edge boundaries — real peripheral vision
// training needs targets near the edge of the visual field, not just
// slightly off-center. A small center dead-zone is excluded so a token
// never lands on top of the fixation dot itself.
// Kept under the theoretical 50% edge to leave room for the token's own
// rendered width (longest token, e.g. "curiosity", measured ~40% of the
// smallest mobile flash-field width) so it never clips against the
// field's overflow-hidden boundary.
const MAX_OFFSET_PERCENT = 36
const CENTER_DEAD_ZONE_PERCENT = 14

export function generateWidePeripheralPosition(): RapidVisualSpanPosition {
  let xPercent = 0
  let yPercent = 0
  let guard = 0
  do {
    xPercent = (Math.random() * 2 - 1) * MAX_OFFSET_PERCENT
    yPercent = (Math.random() * 2 - 1) * MAX_OFFSET_PERCENT
    guard += 1
  } while (Math.abs(xPercent) < CENTER_DEAD_ZONE_PERCENT && Math.abs(yPercent) < CENTER_DEAD_ZONE_PERCENT && guard < 20)
  return { xPercent, yPercent }
}

// A real 2-3 digit number token, generated client-side only.
export function generateNumberToken(): string {
  const value = Math.floor(Math.random() * 900) + 10 // 10-909
  return String(value)
}

// Picks `count` tokens without repeats, mixing real words and generated
// numbers, honestly random (not a fixed/rotating list) — client-side only.
export function pickRandomTokens(count: number): readonly string[] {
  const pool = [...RAPID_VISUAL_SPAN_WORD_TOKENS]
  const picked: string[] = []
  for (let i = 0; i < count; i += 1) {
    const useNumber = Math.random() < 0.35
    if (useNumber || pool.length === 0) {
      let candidate = generateNumberToken()
      while (picked.includes(candidate)) candidate = generateNumberToken()
      picked.push(candidate)
    } else {
      const index = Math.floor(Math.random() * pool.length)
      const [token] = pool.splice(index, 1)
      if (token !== undefined) picked.push(token)
    }
  }
  return picked
}

// Pure Timed Progression Sprint — the engine (useReadingRuntime) only ever
// completes a round by exhausting its unit list; it has no independent
// wall-clock/duration concept, and that hook is locked. So a "20-second
// round" is achieved honestly by *dosing content to the time budget*: at a
// given target WPM, one word dwells for `60000/targetWpm` ms, so a round of
// `round(targetWpm * durationSeconds / 60)` single-word tokens takes almost
// exactly `durationSeconds` of real time to flash through — no separate
// timer needed, and the round naturally speeds up (shows more words, same
// duration) as targetWpm increases each round.
export function computeRoundWordCount(targetWpm: number, durationSeconds: number): number {
  return Math.max(1, Math.round((targetWpm * durationSeconds) / 60))
}
