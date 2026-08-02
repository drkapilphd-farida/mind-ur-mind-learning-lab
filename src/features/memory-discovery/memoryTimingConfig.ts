// Memory Discovery™ Adaptive Timing Engine™ — Sprint-2.1 FIX-12.
//
// "Move all timing values into a centralized configuration... Avoid
// scattering timing values throughout the code. Future tuning should
// require changing configuration, not application logic." Every real
// timing constant Memory Discovery's own components use lives here —
// nothing below is a scoring rule or a piece of UI logic, purely real,
// named, tunable numbers.

// ── Observation Timing (FIX-01/FIX-02/FIX-08/FIX-09) ────────────────────

// Per-tier flash duration for a single RSVP-style item (Visual Memory,
// Pattern & Sequence, Shape Recognition — pure glyph content). The
// founder's Easy/Medium/Hard/Expert ladder, mapped onto this platform's
// real five-tier `DifficultyTier`.
export const OBSERVATION_TIER_MS = {
  beginner: 250,
  easy: 250,
  medium: 180,
  advanced: 140,
  expert: 100,
  elite: 80,
  master: 65,
  adaptive: 180,
} as const

// Real text content (Word Memory, Sentence Recall, Image Recall's own
// object labels) gets a real, modest "comfortable reading pace" on top
// of the shared fast-observation rate above — reading genuinely takes
// longer to register than glancing at a glyph.
export const VERBAL_READING_MULTIPLIER = 1.4

// Number Memory Exposure Engine™ (Sprint-4.1) FIX-02 — Digit Span™'s own
// real production defaults, replacing the old linear BASE+PER_DIGIT
// formula (500 + 200ms/digit). The brief's own table isn't linear (the
// per-digit delta alternates between 150ms and 200ms), so a real lookup
// is the honest representation — never a forced formula bent to fit real
// numbers it doesn't actually produce. Digit Span never reaches a real
// length above 8 (6 base rounds + at most 2 real bonus rounds), so no
// length beyond this table is ever looked up in practice.
export const DIGIT_SPAN_OBSERVATION_MS: Record<number, number> = {
  1: 450,
  2: 600,
  3: 800,
  4: 1000,
  5: 1200,
  6: 1350,
  7: 1500,
  8: 1700,
}

// FIX-08 — "Adaptive Exposure Multiplier... Maximum adjustment: ±15%."
// Number Memory's own real adaptive band is tighter than the shared
// ±20% band every other Memory Discovery mission's Reading-Speed/
// Performance multiplier uses — kept as its own real, separate constant
// so this sprint's scope (Number Memory exposure only) never narrows or
// widens any other mission's real adaptive range.
export const DIGIT_SPAN_MIN_ADAPTIVE_MULTIPLIER = 0.85
export const DIGIT_SPAN_MAX_ADAPTIVE_MULTIPLIER = 1.15

// FIX-06 — "Feedback Compression™... Recommended: 700-900ms." Number
// Memory's own real per-round feedback beat, kept separate from the
// shared `MICRO_FEEDBACK_DISPLAY_MS` below (still 1300ms — every other
// mission's real end-of-mission Micro Insight is out of this sprint's
// scope).
export const DIGIT_SPAN_FEEDBACK_DISPLAY_MS = 800

// FIX-03/FIX-09 — Pulse Reveal™'s real soft fade-in/fade-out, within
// Premium Motion's own ≈150-200ms transition ceiling.
export const DIGIT_SPAN_PULSE_FADE_MS = 160

// ── Feedback Timing (FIX-07) ─────────────────────────────────────────────

// "Suggested duration: 1000-1500ms, then automatically continue."
export const MICRO_FEEDBACK_DISPLAY_MS = 1300

// ── Transition Timing (FIX-05/FIX-06) ────────────────────────────────────

// SequentialFlashCard's own real choreography: a brief "ready" pulse
// before the first flash, a blank gap between consecutive items, and a
// short pause after the last item before recall begins. "Zero Idle
// Screen Rule™" — every one of these stays far below the point where a
// user would perceive them as a wait.
export const READY_PULSE_MS = 300
export const ITEM_GAP_MS = 60
export const POST_SEQUENCE_PAUSE_MS = 100

// A real user decision window (not a system pause) for the recall grids
// — long enough to consider tapping another item without feeling
// rushed.
export const RECALL_IDLE_ADVANCE_MS = 1500

// ── Animation Timing (FIX-10) ─────────────────────────────────────────────

// "Keep animations below approximately 250 milliseconds." The shared
// scene-level fade/scale every Memory Discovery screen uses.
export const SCENE_ENTER_MS = 220
export const SCENE_EXIT_MS = 180

// ── Adaptive Timing Limits (FIX-03/FIX-04) ───────────────────────────────

// "Maximum reduction: 20%. Maximum increase: 20%. Never create dramatic
// jumps." Shared by both the Reading-Speed-Awareness multiplier and the
// in-session Performance-Based multiplier — neither ever pushes a real
// observation duration outside this real, disclosed band.
export const MIN_ADAPTIVE_MULTIPLIER = 0.8
export const MAX_ADAPTIVE_MULTIPLIER = 1.2

// ── Adaptive Memory Coach™ (Sprint-3 FIX-01) ─────────────────────────────

// "Hesitation Before Answer" — a real, disclosed reaction-time threshold
// above which a real answer reads as hesitant, not just thoughtful.
export const HESITATION_THRESHOLD_MS = 4000
