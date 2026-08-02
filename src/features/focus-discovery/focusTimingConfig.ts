// Focus Discovery™ — the one centralized timing configuration, mirroring
// Memory Discovery's own `memoryTimingConfig.ts` (FIX-12 there: "Move all
// timing values into a centralized configuration... future tuning should
// require changing configuration, not application logic"). Nothing below
// is a scoring rule — purely real, named, tunable numbers every Focus
// Discovery component reads instead of a scattered literal.

// ── Premium Motion™ (FIX-12) ─────────────────────────────────────────────

// "Every transition should feel calm and premium... avoid abrupt screen
// changes." Same real ceiling Memory Discovery's own Premium Motion rule
// uses.
export const SCENE_ENTER_MS = 220
export const SCENE_EXIT_MS = 180

// A tapped object's own brief, real visual feedback (correct/false tap)
// before it either fades away (correct) or resets (false) — long enough
// to register, far too short to read as a wait.
export const TAP_FEEDBACK_MS = 180

// A real, calm blinking pulse rate every mission's own "blinking
// elements" distractor uses (FIX-01) — slow enough to read as
// "intentional," never a chaotic strobe (FIX-12).
export const BLINK_INTERVAL_MS = 260

// A real, honest visual scale for "smaller targets" (Attention Lock's
// own Round 6) — small enough to genuinely demand more precise
// attention, never so small it becomes an accessibility problem.
export const SMALL_TARGET_SCALE = 0.65

// ── Attention Lock™ — 5-Level Progressive Difficulty Ladder™ ─────────────
// Sprint-1.7 RULE-01/02/03 — "Level 1 Very Easy → Level 5 Expert...
// increase only one variable at a time." Object count rises every level
// (8→16→24→32→40); each later level ALSO keeps every earlier real
// distraction dimension active and adds exactly one more — a real,
// cumulative ramp, never a sudden jump, never two new dimensions at once.
export const ATTENTION_LOCK_ROUND_COUNT = 5
export const ATTENTION_LOCK_OBJECT_COUNTS = [8, 16, 24, 32, 40] as const
// Level index (0-based) each new real dimension first appears at, and
// stays active every level after: Level 2 → similar colours, Level 3 →
// movement, Level 4 → smaller target, Level 5 → blinking.
export const ATTENTION_LOCK_SIMILAR_COLOR_FROM_ROUND = 1
export const ATTENTION_LOCK_MOVEMENT_FROM_ROUND = 2
export const ATTENTION_LOCK_SMALLER_TARGET_FROM_ROUND = 3
export const ATTENTION_LOCK_BLINKING_FROM_ROUND = 4

// ── Visual Search™ — 5-Level Progressive Difficulty Ladder™ ──────────────
// Real density rising every level; each later level adds exactly one new
// real dimension — Level 2 → the real target described by shape AND
// colour (not shape alone), Level 3 → one real near-duplicate decoy,
// Level 4 → a second real near-duplicate decoy, Level 5 → a real smaller
// target.
export const VISUAL_SEARCH_ROUND_COUNT = 5
export const VISUAL_SEARCH_OBJECT_COUNTS = [14, 18, 22, 26, 30] as const
export const VISUAL_SEARCH_COLOR_DESCRIPTION_FROM_ROUND = 1
export const VISUAL_SEARCH_SIMILAR_DECOYS_FROM_ROUND = 2
export const VISUAL_SEARCH_MAX_SIMILAR_DECOYS_FROM_ROUND = 3
export const VISUAL_SEARCH_MAX_SIMILAR_DECOYS = 2
export const VISUAL_SEARCH_SMALLER_TARGET_FROM_ROUND = 4

// ── Reaction Focus™ — Progressive Difficulty Ladder™ ─────────────────────

export const REACTION_FOCUS_TRIAL_COUNT = 7
// "Vary the appearance interval... avoid fixed rhythms." Real, narrower,
// more irregular-feeling window than a single wide uniform draw — this
// project's own brief example intervals (700, 1200, 400, 1800ms) all
// fall inside this real range.
export const REACTION_FOCUS_MIN_DELAY_MS = 400
export const REACTION_FOCUS_MAX_DELAY_MS = 1800
// How long a real target stays live before it counts as a real missed
// target.
export const REACTION_FOCUS_TARGET_TIMEOUT_MS = 2000
// A real trial may show zero, one, or two real decoys before the real
// target — never a fixed "one decoy or none" pattern, so the real
// rhythm genuinely can't be learned.
export const REACTION_FOCUS_MAX_DECOYS_PER_TRIAL = 2
export const REACTION_FOCUS_DECOY_DISPLAY_MS = 500
// Sprint-1.7 RULE-01/02 — the same 7 real trials get progressively
// harder: the earliest trials never show more than one real decoy and
// use the full, gentler delay band; from this real trial index on, a
// second real decoy becomes possible; from this later real trial index
// on, real "time pressure" tightens the delay band itself (never longer
// waits, only shorter, faster-arriving real targets).
export const REACTION_FOCUS_SECOND_DECOY_FROM_TRIAL = 3
export const REACTION_FOCUS_TIME_PRESSURE_FROM_TRIAL = 5
export const REACTION_FOCUS_HARD_MAX_DELAY_MS = 1200

// ── Sustained Focus™ (FIX-05) — 7 real cumulative stages ─────────────────

// "Approximately 30-45 seconds." Randomized once per real session within
// this real window — never the identical duration twice.
export const SUSTAINED_FOCUS_MIN_DURATION_MS = 30000
export const SUSTAINED_FOCUS_MAX_DURATION_MS = 45000
export const SUSTAINED_FOCUS_MIN_TICK_MS = 900
export const SUSTAINED_FOCUS_MAX_TICK_MS = 1600
// A real tick's own object stays tappable this long before it counts as
// a real miss (target) or safely expires (distractor).
export const SUSTAINED_FOCUS_TICK_WINDOW_MS = 1100
// The real session duration splits into 7 equal real stages, mirroring
// the brief's own progression (10 objects → 15 → 20 → moving → colour →
// blinking → clutter) — each stage keeps every earlier real dimension
// active and adds exactly one more, never several at once.
export const SUSTAINED_FOCUS_STAGE_COUNT = 7
export const SUSTAINED_FOCUS_DENSITY_STAGE_2 = 1
export const SUSTAINED_FOCUS_DENSITY_STAGE_3 = 2
export const SUSTAINED_FOCUS_MOVEMENT_FROM_STAGE = 3
export const SUSTAINED_FOCUS_COLOR_VARIATION_FROM_STAGE = 4
export const SUSTAINED_FOCUS_BLINKING_FROM_STAGE = 5
export const SUSTAINED_FOCUS_HIGH_CLUTTER_FROM_STAGE = 6
export const SUSTAINED_FOCUS_BASE_CLUTTER_PROBABILITY = 0.2
export const SUSTAINED_FOCUS_HIGH_CLUTTER_PROBABILITY = 0.55

// ── Cognitive Flexibility™ — 5-Level Progressive Difficulty Ladder™ ──────

// Five real rounds, real object count rising every level (10→14→18→
// 22→26) on top of the existing real rule-switching challenge — enough
// real rounds for a genuinely unpredictable rule-kind order (FIX-06/
// FIX-09) rather than an always-the-same color→color→shape→motion
// sequence.
export const COGNITIVE_FLEXIBILITY_ROUND_COUNT = 5
export const COGNITIVE_FLEXIBILITY_ROUND_OBJECT_COUNTS = [10, 14, 18, 22, 26] as const
// How many real matching objects exist per round (the ones the current
// rule says to tap).
export const COGNITIVE_FLEXIBILITY_TARGETS_PER_ROUND = 3
