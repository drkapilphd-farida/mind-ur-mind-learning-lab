import { z } from 'zod'

// Reading Runtime Engine™ (Sprint-2 Part-2) — further simplified from
// Part-1's 10 fine-grained scenes down to the 7 real macro checkpoints
// this architecture now actually saves session events for. Each of the
// 5 Sprints is no longer a fixed handful of named sub-scenes
// (`quick-look`, `quick-look-options`, ...) — it's a continuous runtime
// over many real, dynamically-queued items (see `readingSprints.ts` /
// `localSprintContentProvider.ts`), so the persisted, Zod-validated
// session log now records one real `scene_timing` event per whole
// Sprint (its real total dwell time), not one per item — the much
// richer per-item signal stream (real recognition-speed/answer-time per
// word/phrase/sentence/paragraph/question) lives in the in-session
// `LearningIntelligenceEngine` instead (see
// `discover-learning-potential/intelligence/`), matching the locked
// stage structure's own "Live Reading Runtime → ... → AI Observation
// Saved" (saved once, at the end of a Sprint, not mid-runtime).
//
// NOTE: these string literals intentionally aren't imported from
// `ReadingSprintId` (`readingSprints.ts`) to avoid a circular import —
// `word`/`phrase`/`sentence`/`paragraph`/`meaning` here must stay in
// sync with `READING_SPRINT_ORDER` there.
export const READING_DISCOVERY_SCENES = ['intro', 'word', 'phrase', 'sentence', 'paragraph', 'meaning', 'reading-summary'] as const

export type ReadingDiscoverySceneId = (typeof READING_DISCOVERY_SCENES)[number]

// Observation only — how long each real macro checkpoint (module intro,
// each of the 5 Sprints, Reading Summary) took, in total. No correctness,
// no score, ever. Sprint-2 Part-2 removed `option_response` (previously
// one per real question answered) — Meaning Sprint alone now answers
// real questions, many per session, and that much finer-grained real
// signal lives in the in-session `LearningIntelligenceEngine` instead
// (see `readingSprints.ts`'s own comment on this split) — nothing else
// in this feature calls it anymore.
const SceneTimingEventSchema = z
  .object({
    type: z.literal('scene_timing'),
    scene: z.enum(READING_DISCOVERY_SCENES),
    dwellMs: z.number().nonnegative(),
  })
  .strict()

export const ReadingDiscoveryEventSchema = z.discriminatedUnion('type', [SceneTimingEventSchema])
export type ReadingDiscoveryEvent = z.infer<typeof ReadingDiscoveryEventSchema>

export const ReadingDiscoverySessionInputSchema = z
  .object({
    events: z.array(ReadingDiscoveryEventSchema).min(1),
    completed: z.boolean(),
  })
  .strict()
export type ReadingDiscoverySessionInput = z.infer<typeof ReadingDiscoverySessionInputSchema>

export type ReadingDiscoverySessionResult = { success: true } | { success: false; error: string }

export type ComprehensionOption = {
  id: string
  label: string
}

export type ComprehensionQuestion = {
  id: string
  prompt: string
  options: readonly ComprehensionOption[]
  // Sprint-2.6B FIX-16 — the real, authored-correct option id, used
  // *internally only* by the runtime to compute a real comprehension/
  // question-accuracy signal for the new Reading Intelligence Model.
  // `ComprehensionCard` never reads this field — it never shows
  // right/wrong in the UI, unchanged from every prior sprint's own rule.
  correctOptionId: string
}
