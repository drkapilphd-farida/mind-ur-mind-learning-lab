import { z } from 'zod'

// Focus Discovery Foundation™ (Sprint-1) — the real Mission Journey™
// scene order. Unlike Memory Discovery (a separate flash/recall scene
// per beat), every Focus Discovery mission is one continuous, real,
// interactive attention task — there's no "stimulus disappears, then a
// separate recall screen" split here, so each mission is exactly one
// scene, mirroring how Number Memory's own Digit Span™ became one
// self-contained multi-round component in Memory Discovery Sprint-1.5.
export const FOCUS_DISCOVERY_SCENES = [
  'welcome',
  'attention-lock',
  'visual-search',
  'reaction-focus',
  'sustained-focus',
  'cognitive-flexibility',
  'focus-discovery-complete',
] as const

export type FocusDiscoverySceneId = (typeof FOCUS_DISCOVERY_SCENES)[number]

// Observation only — how long a scene was on screen. Same shape as
// Reading/Memory Discovery's own identical event.
const SceneTimingEventSchema = z
  .object({
    type: z.literal('scene_timing'),
    scene: z.enum(FOCUS_DISCOVERY_SCENES),
    dwellMs: z.number().nonnegative(),
  })
  .strict()

// FIX-02/FIX-14 — Attention Lock™ (Selective Attention). Raw counts only
// — no accuracy percentage, no "distraction resistance" score computed
// here. Sprint-2's Focus Intelligence Engine™ derives those from this.
// Sprint-1.8 AI Learning Model™ — `highestLevelReached` and
// `stabilizedRounds` are the real, new signal the Adaptive Difficulty
// Engine™ itself produces (never displayed — "future personalization in
// AI Learning Studio™"). Unlike the fixed Sprint-1.7 ladder, a real
// session's own real level no longer always equals `roundsCompleted -
// 1`, since a struggling round now holds the real level rather than
// advancing it.
const AttentionLockResultEventSchema = z
  .object({
    type: z.literal('attention_lock_result'),
    roundsCompleted: z.number().nonnegative(),
    totalTargets: z.number().nonnegative(),
    correctTaps: z.number().nonnegative(),
    falseTaps: z.number().nonnegative(),
    avgReactionMs: z.number().nonnegative(),
    highestLevelReached: z.number().nonnegative(),
    stabilizedRounds: z.number().nonnegative(),
  })
  .strict()

// FIX-03/FIX-14 — Visual Search™ (Visual Attention).
const VisualSearchResultEventSchema = z
  .object({
    type: z.literal('visual_search_result'),
    roundsCompleted: z.number().nonnegative(),
    correctFirstTapCount: z.number().nonnegative(),
    wrongTapsTotal: z.number().nonnegative(),
    avgSearchMs: z.number().nonnegative(),
    highestLevelReached: z.number().nonnegative(),
    stabilizedRounds: z.number().nonnegative(),
  })
  .strict()

// FIX-04/FIX-14 — Reaction Focus™ (Attention Speed). `reactionTimesMs`
// is kept as a real, per-trial array (not just an average) so Sprint-2
// can derive real Consistency (variance) from it — an average alone
// can't distinguish "steady" from "erratic but balanced."
const ReactionFocusResultEventSchema = z
  .object({
    type: z.literal('reaction_focus_result'),
    trialsCompleted: z.number().nonnegative(),
    hits: z.number().nonnegative(),
    prematureTaps: z.number().nonnegative(),
    missedTargets: z.number().nonnegative(),
    reactionTimesMs: z.array(z.number().nonnegative()),
  })
  .strict()

// FIX-05/FIX-14 — Sustained Focus™ (Long-Term Attention). Accuracy
// split into three real, equal time thirds of the real session duration
// — the raw material for a real "fatigue pattern," never computed here.
const SustainedFocusResultEventSchema = z
  .object({
    type: z.literal('sustained_focus_result'),
    totalTicks: z.number().nonnegative(),
    correctHits: z.number().nonnegative(),
    missedTargets: z.number().nonnegative(),
    falseTaps: z.number().nonnegative(),
    earlyAccuracy: z.number().min(0).max(1),
    midAccuracy: z.number().min(0).max(1),
    lateAccuracy: z.number().min(0).max(1),
  })
  .strict()

// FIX-06/FIX-14 — Cognitive Flexibility™ (Mental Adaptability).
// `incorrectHabitResponses` — a real, honest perseveration signal: a tap
// that would have been correct under the PREVIOUS round's rule but is
// wrong under the current one.
const CognitiveFlexibilityResultEventSchema = z
  .object({
    type: z.literal('cognitive_flexibility_result'),
    roundsCompleted: z.number().nonnegative(),
    correctTaps: z.number().nonnegative(),
    incorrectHabitResponses: z.number().nonnegative(),
    missedTargets: z.number().nonnegative(),
    avgAdaptationMs: z.number().nonnegative(),
    highestLevelReached: z.number().nonnegative(),
    stabilizedRounds: z.number().nonnegative(),
  })
  .strict()

export const FocusDiscoveryEventSchema = z.discriminatedUnion('type', [
  SceneTimingEventSchema,
  AttentionLockResultEventSchema,
  VisualSearchResultEventSchema,
  ReactionFocusResultEventSchema,
  SustainedFocusResultEventSchema,
  CognitiveFlexibilityResultEventSchema,
])
export type FocusDiscoveryEvent = z.infer<typeof FocusDiscoveryEventSchema>

export const FocusDiscoverySessionInputSchema = z
  .object({
    events: z.array(FocusDiscoveryEventSchema).min(1),
    completed: z.boolean(),
  })
  .strict()
export type FocusDiscoverySessionInput = z.infer<typeof FocusDiscoverySessionInputSchema>

export type FocusDiscoverySessionResult = { success: true } | { success: false; error: string }
