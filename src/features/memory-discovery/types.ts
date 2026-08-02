import { z } from 'zod'

// The nineteen scenes of Memory Discovery™, in flow order: FLASH →
// DISAPPEAR → RECOGNITION → MICRO INSIGHT → AUTO NEXT for every
// experiment. Each experiment splits into a stimulus screen (auto-timed,
// disappears) and a tiny-decision screen (single- or multi-select,
// auto-advances) — none of them end on a passive "Continue" tap. A Micro
// Brain Insight™ follows every experiment's own recall step.
//
// Memory Discovery Foundation™ (Sprint-1) — reordered from the original
// founder flow (Visual → Word → Chunk → Sentence → Image → Number) into
// the new locked 5-Mission order: Visual Memory → Number Memory → Word
// Memory → Pattern & Sequence → Recognition & Recall. This array (see
// `memoryMissions.ts`'s own `MISSION_SCENES`/`SCENE_TO_MISSION`, built
// directly from this order) is the single source of truth for that
// journey order, mirroring how `READING_SPRINT_ORDER` anchors Reading
// Discovery's own mission sequence. Learning Memory Profile™ is one
// combined closing scene (absorbing what used to be two separate
// screens, Final Observation and Transition) so "Continue" only appears
// once at the very end, alongside Welcome's "Begin" as the only two
// manual taps outside the new Mission Intro/Mission Complete beats.
//
// Memory Discovery Scientific Foundation™ (Sprint-1.5) — three real
// changes from the Sprint-1 shape: (1) `number-memory-choice` is gone —
// Number Memory™ is now a real, self-contained, multi-round Digit Span™
// (`DigitSpanCard`) that runs its own internal flash→choice loop across
// several rounds inside the single `number-memory-display` scene,
// FIX-02; (2) `chunk-recall-*` is renamed to `pattern-sequence-*` and
// now measures real ordered-sequence memory (`patternSequence.ts`), not
// word-chunk recognition, FIX-04; (3) Recognition & Recall gains a third
// real content type — `shape-recognition-*` — alongside the existing
// Sentence Recall (words) and Image Recall (objects), FIX-05.
export const MEMORY_DISCOVERY_SCENES = [
  'welcome',
  'visual-memory-display',
  'visual-memory-recall',
  'visual-memory-insight',
  'number-memory-display',
  'number-memory-insight',
  'word-memory-display',
  'word-memory-recall',
  'word-memory-insight',
  'pattern-sequence-display',
  'pattern-sequence-choice',
  'pattern-sequence-insight',
  'sentence-recall-display',
  'sentence-recall-choice',
  'sentence-recall-insight',
  'image-recall-display',
  'image-recall-choice',
  'image-recall-insight',
  'shape-recognition-display',
  'shape-recognition-choice',
  'shape-recognition-insight',
  'learning-memory-profile',
] as const

export type MemoryDiscoverySceneId = (typeof MEMORY_DISCOVERY_SCENES)[number]

// Observation only — how long a scene was on screen, which option was
// picked, which items were marked as recalled. No correctness, no score,
// ever. Maps onto the six observation categories: Visual Recall, Word
// Recall, Chunk Recall, Sentence Recall, Number Recall, Image Recall.
const SceneTimingEventSchema = z
  .object({
    type: z.literal('scene_timing'),
    scene: z.enum(MEMORY_DISCOVERY_SCENES),
    dwellMs: z.number().nonnegative(),
  })
  .strict()

const OptionResponseEventSchema = z
  .object({
    type: z.literal('option_response'),
    questionId: z.string().min(1),
    selectedOptionId: z.string().min(1),
  })
  .strict()

const RecallResponseEventSchema = z
  .object({
    type: z.literal('recall_response'),
    questionId: z.string().min(1),
    selectedItems: z.array(z.string().min(1)),
  })
  .strict()

// Sprint-1.5 FIX-02/FIX-10 — Digit Span™'s own real, structured
// multi-round result (rounds completed, correct count, longest real span
// reached, total real recognition time across every round). A single
// `scene_timing` entry for `number-memory-display` can't carry this —
// that scene now runs several real internal rounds, not one. "Do not
// calculate the final Memory Profile yet... Sprint-2 will use these
// signals" — this event exists purely to persist the raw real data for
// that future engine; nothing here computes a score.
const DigitSpanResultEventSchema = z
  .object({
    type: z.literal('digit_span_result'),
    roundsCompleted: z.number().nonnegative(),
    correctCount: z.number().nonnegative(),
    longestCorrectLength: z.number().nonnegative(),
    totalRecognitionMs: z.number().nonnegative(),
  })
  .strict()

export const MemoryDiscoveryEventSchema = z.discriminatedUnion('type', [
  SceneTimingEventSchema,
  OptionResponseEventSchema,
  RecallResponseEventSchema,
  DigitSpanResultEventSchema,
])
export type MemoryDiscoveryEvent = z.infer<typeof MemoryDiscoveryEventSchema>

export const MemoryDiscoverySessionInputSchema = z
  .object({
    events: z.array(MemoryDiscoveryEventSchema).min(1),
    completed: z.boolean(),
  })
  .strict()
export type MemoryDiscoverySessionInput = z.infer<typeof MemoryDiscoverySessionInputSchema>

export type MemoryDiscoverySessionResult = { success: true } | { success: false; error: string }

export type ChoiceOption = {
  id: string
  label: string
}

export type ChoiceQuestion = {
  id: string
  prompt: string
  options: readonly ChoiceOption[]
}
