# Architecture — Quantum Speed Reading™ (Reading Runtime)

## Status: PROPOSED — Architecture Only. Awaiting Architectural Review.

No production code, UI, or business logic has been written against this document. Nothing here has
been implemented. Per the brief that requested it: this document designs and locks an architecture;
it does not authorize building it.

**Governed by (read in full before this document was written):** `LEARNING_SCIENCE_FRAMEWORK.md`,
`COGNITIVE_SKILLS_MAP.md`, `QUANTUM_SPEED_READING_CURRICULUM.md`, `EXERCISE_SPEC_TEMPLATE.md`,
`docs/adr/0001-ai-learning-studio-domain-model.md`, `docs/adr/0002-domain-layered-architecture.md`,
`docs/ARCHITECTURE_CONSOLIDATION_REPORT.md`, and the three completed engine layers this document builds
on: `docs/PRODUCTION_HANDOFF_UCE_6.md`, `docs/PRODUCTION_HANDOFF_LSE_1.md`, `docs/PRODUCTION_HANDOFF_LSE_2.md`.

---

# 0. Scope and the One Layering Rule

**Quantum Speed Reading™'s runtime consumes exactly three things:**

1. **Universal Learning Object™** (`@/core/universal-learning-engine/universal-learning-object`)
2. **Learning Session Engine™** (`@/core/learning-session-engine`)
3. **Adaptive Learning Runtime™** (`@/core/adaptive-learning-runtime`)

**It never imports, directly, from:** raw document/PDF parsing (`upload/`, `extraction/`), the chunk
engine (`learning-chunk/`), the semantic enrichment engine (`semantic-enrichment/`), the knowledge graph
engine (`knowledge-graph/`), or the learning analysis engine (`learning-analysis/`).

**The one subtlety worth locking down in writing, because it is easy to misread as a contradiction:**
the ULO's own barrel *re-exports* `LearningChunk`, `ChunkAnalysis`, `GraphEdge`, and every other
lower-engine type, and embeds real instances of them at `ulo.knowledge.chunks`, `ulo.analysis.chunkAnalyses`,
`ulo.knowledge.graph`, etc. **Reading those fields off an already-obtained `UniversalLearningObject` is
consuming the ULO — it is allowed and expected.** What is forbidden is importing `@/core/universal-learning-engine/learning-chunk`
(or any other lower-engine module path) directly and calling its own builders/validators. Every reference
to chunk content, reading metrics, or analysis fields anywhere below in this document means "read off the
ULO already in hand," never "reach past it." This is the exact same discipline LSE-1 and LSE-2 already
established and is not a new rule — restated here because Quantum Speed Reading is the first layer that
will actually *display* chunk content to a learner, where the temptation to reach for a shortcut is
highest.

---

# 1. Two Substrates — What This Architecture Covers, and What It Deliberately Does Not

Before any component design, one honest fact has to be named: **Quantum Speed Reading™ already exists in
this codebase as a large, live, production system** (`src/features/quantum-speed-reading/`,
`src/features/rapid-visual-intelligence/`, `src/features/flash-intelligence/`, `src/app/labs/quantum-speed-reading/*`
— roughly 25 exercise routes, a 23-file adaptive-intelligence engine, its own `ReadingSessionRecord`/WPM/
comprehension model, and the generic `UniversalExercisePlayer`/`useUniversalExerciseRuntime` presentation
runtime under `src/components/exercise-engine/` and `src/lib/exercise-engine/`). None of it imports from
`src/core/`. This is not dead code to route around quietly — it is the shipped product today, and
`docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` already documents real, named debt in that system that this
document must not add an unacknowledged seventh instance of.

That existing system operates on **isolated stimuli**: a word, a number, a symbol, a phrase, drawn from a
generic content bank, with no relationship to a specific document a learner uploaded or is trying to
understand. `ExerciseDefinition` + `ContentDataset` (`src/lib/exercise-engine/datasetEngine.ts`) is the
right, working substrate for that — it has no concept of a document, and forcing a `UniversalLearningObject`
underneath a word-flash drill would manufacture a fake "document" for content that was never a document to
begin with.

The new engine this document architects operates on the **opposite substrate**: real passage/document
content, extracted, chunked, enriched, and graphed by UCE-1…6 into a real `UniversalLearningObject`. This
is the substrate every exercise in the curriculum's **Reading Flow Module™ onward** (`Reading Speed™`,
`RSVP™`, `Flash Reading™`, `Peripheral Vision Reading™`, `Chunk Reading™`, `Multi-Line Reading™`, `Pattern
Recognition™`, and every module after it) genuinely needs — they all read *something with real meaning*,
whether that's a learner's own uploaded document or a platform-curated practice passage. Both content
sources produce a ULO through the same one pipeline; there is deliberately no second, parallel "practice
passage" data model.

**The Eye Foundation Module™** (`Eye Warm-up™`, `Eye Stretch™`, `Eye Span™`, `Regression Control™`) is
explicitly **out of scope for this architecture**, on the same principled basis: these exercises require
no literacy and no text at all (Curriculum §4 — "requires no reading ability"). There is no document to
build a ULO from. They remain governed by the existing isolated-stimulus runtime, or a future, separate,
much smaller "Visual Readiness Runtime" architecture — not by this one. Forcing them onto a ULO substrate
would be exactly the kind of manufactured, unnecessary complexity `LEARNING_SCIENCE_FRAMEWORK.md` §11
("avoid unnecessary complexity... every added element must earn its place") warns against.

**The word/number/symbol/phrase drill exercises** already live under Flash Intelligence Pack™ and Rapid
Visual Intelligence (`word-flash`, `number-flash`, `symbol-flash`, `mixed-flash`, `peripheral-flash`,
`flash-images`, `flash-words`, `flash-symbols`, `flash-numbers`, `flash-phrases`) sit in a genuine gray
zone — the curriculum's own `RSVP™`/`Flash Reading™` descriptions suggest real single-word presentation,
which this architecture could serve, but the live implementation draws from a generic vocabulary bank, not
a specific document. **This document does not resolve that overlap** — it is exactly the kind of
product/naming decision §6 of the Consolidation Report flagged as needing an explicit human call, not an
architecture document's unilateral guess. It is named here as an **open question**, not decided (§25).

**Locked scope statement:** this architecture governs real, document-grounded reading — any Learning
Mode™ session where the content being read is a real `UniversalLearningObject` built from real extracted,
chunked content. It supersedes nothing that already ships; it is designed to eventually become the engine
behind the passage-reading flow (`start/*`, `reading-speed`, `paragraph-reading`, `chunk-reading`,
`multi-line-reading`, `sentence-reading`, `phrase-reading`, `progressive-chunk-reading`) — a migration
decision for a future, separate sprint, not this one.

---

# 2. Locked Architecture Recap

```
Universal Learning Object™           (immutable, single source of truth — UCE-1…6)
        ↓
Learning Session Engine™              (LSE-1 — stateful per-learner session; natural-order queue)
        ↓
Adaptive Learning Runtime™            (LSE-2 — chunk-strategy-ordered queue; 9 runtime decisions)
        ↓
Quantum Speed Reading™ Reading Runtime   ← this document
        ↓
Future Learning Modes™                (Memory Mode™, Smart Notes™, Mind Map™, Flashcards™, MCQs™,
                                        Revision™, Research™, AI Mentor™)
```

Quantum Speed Reading™ is not a peer of Memory Mode™/Flashcards™/etc. in the abstract — it is the
**first real implementation** of the `LearningModeType = 'quantum-speed-reading'` value LSE-1 already
reserved (`types/LearningModeExtension.ts`) and the `RuntimeModeAdapter` extension point LSE-2 already
reserved (`types/RuntimeExtension.ts`). Every other Learning Mode™ that eventually gets built will follow
the exact same layering this document establishes — wrap the Adaptive Runtime, delegate every shared
concern to it, add only what is genuinely new to that mode.

**Placement:** `src/core/quantum-speed-reading/` — a sibling of `universal-learning-engine/`,
`learning-session-engine/`, and `adaptive-learning-runtime/` under `src/core/`, not a `src/features/*`
vertical slice. This follows the precedent this session's own three prior sprints established (UCE, LSE-1,
LSE-2 all live under `src/core/` as the Learning Operating System's own layers), not ADR 0002's older
`src/features/*`/`src/{api,services,...}` split, which explicitly scoped itself to the pre-existing Brain
Training Studio™ and the separate `/preview/*` AI Learning Studio™ shell — neither of which this new
engine is part of.

---

# 3. Component Hierarchy

```
src/core/quantum-speed-reading/
  types/
    ReadingPresentationState.ts     the new ephemeral per-chunk presentation state machine
    ReadingSpeedModel.ts            ReadingSpeedProfile, ChunkPaceRecord, ReadingSpeedModel
    ReadingAttentionModel.ts        ReadingAttentionSample, ReadingAttentionModel
    ReadingFocusModel.ts            ReadingFocusTrend, ReadingFocusModel
    ReadingRecallHook.ts            reserved — ReadingRecallHookTrigger, ReadingRecallHookAdapter
    ReadingCompletionSummary.ts     qualitative, non-scored completion summary
    ReadingRuntimeEvent.ts          the reading-mode-only event log (distinct from RuntimeEvent)
    ReadingRuntimeState.ts          the wrapping state object (this layer's AdaptiveRuntimeState)
    ReadingActionResult.ts          Result-type return shape every reading decision returns
    ReadingPresentationMode.ts      reserved extension point — the pluggable exercise-type interface
    index.ts                        barrel
  internal/
    computeReadingSpeedTarget.ts    derives target WPM from real ULO signals (pure)
    computeChunkPace.ts             derives real actual-WPM from real event timestamps (pure)
    evaluateFocusTrend.ts           derives qualitative focus trend from real signals (pure)
    resolveRecallHookTrigger.ts     decides whether a recall hook should fire (pure)
    buildReadingCompletionSummary.ts composes the qualitative completion summary (pure)
    (each: pure, single shared implementation, mirroring LSE-1/LSE-2's own internal/ discipline)
  decisions/
    startReading.ts       wraps LSE-2 startRuntime
    continueReading.ts    wraps LSE-2 continueRuntime
    pauseReading.ts       wraps LSE-2 pauseRuntime
    resumeReading.ts      wraps LSE-2 resumeRuntime
    repeatReadingChunk.ts wraps LSE-2 repeatChunk
    skipReadingChunk.ts   wraps LSE-2 skipChunk
    markForRevisitLater.ts wraps LSE-2 revisitLater
    acknowledgeCheckpoint.ts wraps LSE-2 checkpointRuntime
    completeReading.ts    wraps LSE-2 completeRuntime
    (each: Result-type, delegates the shared concern to the matching LSE-2 decision verbatim, adds
    only the reading-layer side effect that decision genuinely needs — see §6)
  testFixtures.ts
  index.ts                 top-level public barrel — the one import path for consumers
```

This mirrors LSE-2's own file layout almost exactly (`types/`, `internal/`, `decisions/`, `testFixtures.ts`,
`index.ts`) — deliberately. A future engineer who has read the LSE-2 handoff already knows how to navigate
this module.

---

# 4. Reading Runtime

`ReadingRuntimeState` is the canonical output of this layer — the same relationship LSE-2's
`AdaptiveRuntimeState` has to LSE-1's `LearningSession`: it **wraps** a real `AdaptiveRuntimeState` by
reference (never mutated, never reimplemented) and adds only what LSE-2 has no concept of.

```
ReadingRuntimeState = {
  id: string
  runtime: AdaptiveRuntimeState          // LSE-2, embedded whole, never mutated directly
  presentationMode: ReadingPresentationModeId
  presentationState: ReadingPresentationState
  speedModel: ReadingSpeedModel
  attentionModel: ReadingAttentionModel
  focusModel: ReadingFocusModel
  recallHookLog: readonly ReadingRecallHookRecord[]
  eventLog: readonly ReadingRuntimeEvent[]
  version: { schemaVersion: string; revision: number }
  createdAt: string
  lastModifiedAt: string
}
```

**Why a third wrapper layer, rather than extending `AdaptiveRuntimeState` itself:** the same reason LSE-2
didn't extend `LearningSession` — pacing, attention, and recall are genuinely reading-specific concerns
that Memory Mode™, Flashcards™, and every other future Learning Mode™ will not share in this shape. Pushing
them into the shared Adaptive Runtime would contaminate a generic layer with one mode's vocabulary — the
same anti-pattern LSE-2's own handoff doc explicitly reasoned against when it kept `scheduledQueue`
separate from LSE-1's `session.queue`.

**What Reading Runtime deliberately does NOT own:** queue ordering (LSE-2's `scheduledQueue`/`ChunkStrategy`),
position advancement (LSE-2's `position`), completion% (LSE-2's `progress`), or lifecycle status
(LSE-1's `session.status`, reached via `runtime.session.status`). All four are read, never duplicated.

---

# 5. Reading Flow

Reading Flow is the moment-to-moment orchestration loop, not a new persisted state — it is the runtime
behavior that, for the chunk currently at `runtime.position`, resolves real content and hands it to
whichever `ReadingPresentationMode` is active:

```
1. Resolve current chunk:
     chunkNodeId = readingRuntimeState.runtime.position.chunkNodeId
     chunk       = ulo.knowledge.chunks.find(c => c.id === chunkNodeId)   // ULO field access — allowed, §0
     analysis    = ulo.analysis.chunkAnalyses.find(a => a.chunkNodeId === chunkNodeId)

2. Compute this chunk's real pacing target (§10) and attention/focus baseline (§11, §12)
     from `chunk`/`analysis`/`ulo.experience.attentionBlueprint` — reused, never re-derived.

3. Hand (chunk.content, chunk.blocks, target pace) to the active ReadingPresentationMode (§18),
     which owns *how* to render/pace it (RSVP single-word stream, whole-line reveal, chunk-grouped
     flash, multi-line static reveal, ...). Reading Flow does not know or care which mode is active —
     this is the reserved extension point boundary.

4. The presentation mode signals real completion of the current chunk (learner finished, or an
     auto-pacing timer elapsed) → Reading Flow calls `continueReading()` (§6) → which calls LSE-2's
     `continueRuntime` → which re-applies Chunk Scheduling and advances `position` → loop to step 1
     for the new `position`, or exits to Reading Completion (§15) if the queue is exhausted.
```

Reading Flow never advances `position` itself, never calls `applyChunkStrategy` itself, and never marks a
chunk completed itself — every one of those remains LSE-2's exclusive responsibility, reached only through
the Reading Decisions in §6. Reading Flow's only genuinely new logic is step 3: choosing *how* to present
already-resolved real content, which is precisely the reading-specific concern LSE-2 has no opinion about.

---

# 6. Reading Session Lifecycle

Every Reading Decision is a thin wrapper: delegate the shared concern to the matching LSE-2 decision
verbatim, then apply only the reading-layer side effect that decision genuinely needs. No Reading Decision
reimplements a transition check, a queue recomputation, or a progress calculation — all three stay LSE-2's.

| Reading Decision | Delegates to (LSE-2) | Reading-layer side effect |
|---|---|---|
| `startReading` | `startRuntime` | initializes `speedModel`/`attentionModel`/`focusModel` from real ULO signals; sets `presentationState = 'countdown'` |
| `continueReading` | `continueRuntime` | records real chunk pace (§10) for the just-finished chunk; resets `presentationState = 'countdown'` for the next one |
| `pauseReading` | `pauseRuntime` | freezes `presentationState` as-is (captured, not reset); pauses the attention sampler |
| `resumeReading` | `resumeRuntime` | restores the frozen `presentationState` unchanged; resumes the attention sampler |
| `repeatReadingChunk` | `repeatChunk` | resets only the pacing timer for the current chunk; `presentationState` returns to `'countdown'` |
| `skipReadingChunk` | `skipChunk` | discards any in-progress pace sample for the skipped chunk (an honest non-measurement, never a fabricated 0 WPM) |
| `markForRevisitLater` | `revisitLater` | no reading-layer side effect — pure pass-through; the mark itself is entirely LSE-2's concern |
| `acknowledgeCheckpoint` | `checkpointRuntime` | sets `presentationState = 'checkpoint'`; may resolve a Reading Recall Hook (§13) |
| `completeReading` | `completeRuntime` | builds the final `ReadingCompletionSummary` (§15) |

Every Reading Decision returns the same `ReadingActionResult` shape (`{ success: true; state; events } |
{ success: false; error }`) — the same Result-type convention as every layer beneath it. A failure from
the wrapped LSE-2 call (e.g. `invalid-transition`) propagates through unchanged; Reading Decisions never
swallow or reinterpret an LSE-2 error.

---

# 7. Reading States

**Two tiers, deliberately kept separate rather than merged into one enum:**

**Tier 1 — Runtime Lifecycle State.** Reused verbatim from LSE-1/LSE-2: `runtime.session.status`
(`'not-started' | 'active' | 'paused' | 'completed' | 'cancelled'`). Governs whether a reading runtime
exists and is running at all. Never re-implemented at this layer.

**Tier 2 — Reading Presentation State.** New, ephemeral, scoped to the *current* chunk only — resets on
every `continueReading`/`repeatReadingChunk` call, has no meaning outside an `'active'` Tier 1 status:

```
'idle' → 'countdown' → 'presenting' → ['checkpoint'] → ['recall'] → 'between-chunks' → 'idle' (next chunk)
                                                                            ↓ (queue exhausted)
                                                                       'complete'
```

- `idle` — no chunk actively being presented (entered only transiently between decisions).
- `countdown` — brief pre-read orientation beat before pacing begins (Learning Science Framework §11:
  "end with reflection" has a mirror-image beginning-of-chunk beat here — a settling moment, not a race
  start).
- `presenting` — the active presentation-mode pacing loop is running.
- `checkpoint` — entered only when the current chunk's real `isCheckpoint` (LSE-2's `scheduledQueue` item,
  itself resolved from real `'introduces'` graph edges) is true; pacing pauses.
- `recall` — entered only if a Reading Recall Hook (§13) actually fires for this chunk; optional, skipped
  entirely for chunks with no fired hook.
- `between-chunks` — a brief, always-present reflection beat before the next chunk begins (Learning
  Science Framework §11's "end with reflection" rule, applied structurally rather than left to a future
  UI's discretion to remember).
- `complete` — terminal; mirrors Tier 1 reaching `'completed'`.

**Interaction between tiers:** a `pauseReading` call freezes whatever Tier 2 state was active and leaves
it untouched (LSE-2's own `pauseRuntime` touches nothing but `session.status`, by design — see LSE-2
handoff §"Why the Runtime Owns a Second Queue"); `resumeReading` restores it exactly. A learner who paused
mid-`presenting` resumes back into `presenting` at the same chunk, never silently bumped to `countdown`.

---

# 8. Reading Navigation

Reading Navigation reads LSE-2's already-public state (`runtime.scheduledQueue`, `runtime.position`) to
answer presentation-facing questions ("what chunk is this, out of how many," "what's coming up next") —
it never reaches into LSE-2's `internal/` navigation helpers (`findQueueIndex`, `getNextQueueItem`, etc.
— not part of LSE-2's public barrel, exactly as LSE-2 itself never reached into LSE-1's internals).

**What Reading Navigation can answer today, entirely from already-public state:**
- Current position (`runtime.position.queueIndex` / `.chunkNodeId`) and total (`runtime.scheduledQueue.items.length`).
- Forward progress (`runtime.progress`) — reused, never recomputed.
- Whether the current chunk is a checkpoint (`scheduledQueue.items[position.queueIndex].isCheckpoint`).

**What Reading Navigation genuinely cannot do today, honestly disclosed rather than worked around:**
arbitrary jump-to-chunk (e.g. "jump to page 4" for exam-prep skimming, or "go back two chunks" for
research re-reading). LSE-2's 9 runtime decisions only move forward (`continueRuntime`/`skipChunk`) or
stay in place (`repeatChunk`/`revisitLater`); there is no `jumpToChunk` decision. This is named explicitly
as a **future Adaptive Runtime extension** (§18, §25), not something Quantum Speed Reading works around by
bypassing LSE-2 — bypassing it would mean this layer starts mutating queue/position itself, breaking the
one-writer discipline every layer below it has maintained.

---

# 9. Reading Progress

Reading Progress is `runtime.progress` (LSE-2's `RuntimeProgress`: `completedChunkIds`, `remainingChunkIds`,
`completionPercentage`, `estimatedTimeLeftSeconds`, `skippedCount`, `revisitCount`) — read, never
recomputed, never duplicated at this layer. Quantum Speed Reading's only genuine addition is
**presentational framing**, and even that is an architectural constraint, not a UI decision left open:
per `LEARNING_SCIENCE_FRAMEWORK.md` §8/§9, `completionPercentage` may be used to size a progress
indicator, but must never be presented as, or alongside, a score, grade, or comparison. This document
draws that line for whoever designs the UI later; it does not design the UI itself.

---

# 10. Reading Speed Model

The first genuinely new concern LSE-2 has no vocabulary for. Real, never fabricated:

```
ReadingSpeedProfile = {
  ageBand: '5-8' | '9-12' | 'teen' | 'adult'
  goal: 'general' | 'exam-prep' | 'research' | 'casual'
  startingWpm: number
  ceilingWpm: number
}

ChunkPaceRecord = {
  chunkNodeId: string
  targetWpm: number        // computed, §internal/computeReadingSpeedTarget.ts
  actualWpm: number | null // derived from real event timestamps once the chunk completes; null while in progress
}

ReadingSpeedModel = {
  profile: ReadingSpeedProfile
  currentTargetWpm: number
  level: 'orientation' | 'consistency' | 'automaticity' | 'mastery'   // reused verbatim, §12
  perChunkPace: readonly ChunkPaceRecord[]
}
```

**`targetWpm` is derived, never guessed:** `internal/computeReadingSpeedTarget.ts` starts from the real
`chunk.statistics.wordCount` and `chunk.readingMetrics.estimatedReadingSeconds` (already-real UCE-1 output)
to establish a baseline pace, then adjusts it down for chunks with high real `analysis.chunkAnalyses[].readingComplexity`/
`learningDifficulty` (UCE-5 output) — the same "reuse an already-real upstream signal, never invent a new
one" discipline LSE-2's own chunk-scheduling strategies used. `ReadingSpeedProfile.startingWpm`/`ceilingWpm`
bound it per age/goal, never overriding what the content itself says is reasonable.

**`actualWpm` is derived, never separately timed:** `internal/computeChunkPace.ts` reads the real
`chunk-started`/`chunk-completed` timestamps LSE-2 already emits (`runtime.eventLog`) — this layer never
starts its own competing clock.

**`level` is the Learning Science Framework's own four-stage model (§12), reused by name, not
reinterpreted.** Progression from one level to the next is gated by sustained comfortable completion
across multiple real sessions — never a single attempt, never a calendar deadline (Framework §12's own
rule, restated here because it is the one governing constraint on how `currentTargetWpm` may legitimately
increase). What "sustained comfortable" means quantitatively (how many sessions, what pace-consistency
threshold) is deliberately left to a future implementation sprint's own explicit design, not invented here.

---

# 11. Reading Attention Model

Moment-to-moment presence, not session-level trend (that's Reading Focus, §12 — the two are kept distinct
on purpose):

```
ReadingAttentionSample = {
  chunkNodeId: string
  occurredAt: string
  signal: 'present' | 'idle' | 'away'
}

ReadingAttentionModel = {
  samples: readonly ReadingAttentionSample[]
  currentSignal: 'present' | 'idle' | 'away'
}
```

**What produces a sample is explicitly out of scope here** (no UI/business logic per the brief) — a future
implementation sprint decides the concrete signal source (pointer/keyboard activity, page-visibility
changes, a deliberate "still there?" pulse). This document only locks the *shape* samples take and where
they live (on `ReadingRuntimeState`, never pushed into LSE-2's `AdaptiveRuntimeState`, per §4's boundary).

**Internal use only, per Cognitive Skills Map §6:** `currentSignal` may inform Reading Flow (e.g., pause
auto-pacing while `'away'`) and Reading Focus's trend (§12), but is never displayed to the learner as a
tracked/logged number — consistent with the platform-wide rule that internal inference and external
numeric silence are both permanent, simultaneous requirements.

---

# 12. Reading Focus Model

Session-level sustained-engagement trend — an umbrella judgment, not a raw signal:

```
ReadingFocusModel = {
  sessionFocusTrend: 'building' | 'steady' | 'declining'
  perChunkFocusLevel: readonly { chunkNodeId: string; focusLevel: FocusLevel }[]   // FocusLevel reused from ULO
}
```

`perChunkFocusLevel` is a direct read of `ulo.experience.attentionBlueprint.entries` — the real,
already-computed UCE-6 threshold classification over `expectedCognitiveLoad` — never a second, competing
focus signal invented at this layer.

`sessionFocusTrend` is derived (`internal/evaluateFocusTrend.ts`) from three already-real signals, never a
new one: the Reading Attention Model's recent `'away'`/`'idle'` sample density (§11), and two signals LSE-2
already tracks per chunk via `evaluateLearningState()` — `isRepeatedChunk` and `isMarkedForRevisit`, both
honest proxies for "this is where the learner is struggling," reused rather than re-derived. A rising rate
of repeats/revisits/away-samples across recent chunks yields `'declining'`; a falling rate yields
`'building'`; otherwise `'steady'`. Exact thresholds are a future implementation decision, not locked here.

**This is the model a future adaptive-pacing decision would consult** — e.g., "suggest a `skip-chunk` or
a `revisit-later`" — but this document does not wire that suggestion logic; it only locks where the signal
that would inform it lives.

---

# 13. Reading Recall Hooks

**Reserved extension point — type-only, no implementation, no UI, consistent with this sprint's mandate.**
Deliberately named "Recall Hook," never "quiz" or "test": the platform's own product-vocabulary rule (no
quiz/test/score language in anything learner-facing) and Learning Science Framework §3's "Retrieval"
principle ("actively reproducing something from memory... strengthens retention") justify the mechanism,
not the legacy naming — the existing `ComprehensionQuizExperience.tsx` (§1) predates that vocabulary rule
and is explicitly not the pattern this new hook follows.

```
ReadingRecallHookTrigger = 'checkpoint' | 'high-memory-difficulty-chunk' | 'manual'

ReadingRecallHookAdapter = {
  shouldTrigger?: (evaluation: LearningStateEvaluation, chunk: LearningChunk) => boolean
  onTrigger?: (state: ReadingRuntimeState, chunk: LearningChunk) => void
}
```

`shouldTrigger` receives LSE-2's own `LearningStateEvaluation` (already public, §11 of LSE-2's handoff)
and the real `LearningChunk` — never new state. The default, unimplemented trigger candidates named here:
real checkpoints (`isCheckpoint`, already LSE-2's own signal) and chunks with high real
`ulo.learning.memoryBlueprint` `memoryDifficulty` — both already-real signals, reused, never invented for
this purpose. `'manual'` is reserved for a future Learning Mentor-initiated hook, not built here.

No Reading Decision calls into a `ReadingRecallHookAdapter` this sprint. `presentationState = 'recall'`
(§7) is a reserved state slot for when this extension point is eventually implemented — its presence in
the state machine does not mean the mechanism is built.

---

# 14. Reading Checkpoints

100% reused from LSE-2 — the only layer this document adds no new detection logic to at all. LSE-2's
`checkpointRuntime` decision and its automatic `checkpoint-reached` event emission (on arrival at a real
`isCheckpoint` queue item, itself resolved from real `'introduces'` graph edges cross-referenced against
`ulo.experience.learningJourney.steps`) are the entire mechanism. `acknowledgeCheckpoint` (§6) is a thin
wrapper: delegate to `checkpointRuntime`, set `presentationState = 'checkpoint'`, optionally resolve a
Reading Recall Hook (§13). No second notion of "checkpoint" is introduced.

---

# 15. Reading Completion

Also 100% reused for the mechanism (LSE-2's `completeRuntime`, and automatic completion once
`continueReading`/`skipReadingChunk` exhaust the scheduled queue, both already calling LSE-1's own
`completeSession` under the hood per LSE-2's own documented delegation). Quantum Speed Reading's only
genuine addition is **synthesizing a real, honest, non-scored completion summary**:

```
ReadingCompletionSummary = {
  chunksCompleted: number          // runtime.progress.completedChunkIds.length — reused
  chunksSkipped: number            // runtime.progress.skippedCount — reused
  chunksRevisited: number          // runtime.progress.revisitCount — reused
  paceTrend: 'settling-in' | 'holding-steady' | 'building-speed'   // derived from speedModel.perChunkPace
  focusTrend: ReadingFocusModel['sessionFocusTrend']                 // reused, §12
  totalTimeSeconds: number         // derived from real chunk-started/chunk-completed event timestamps
}
```

**Deliberately absent:** any field named `score`, `accuracy` (as a number), `grade`, or `wpm` presented as
a standalone final figure. Per Mastery Philosophy (Learning Science Framework §8, Curriculum §8): mastery
is consistency, comfort, reduced effort, automaticity, and transfer — observed over real sessions, never
a single-session number. `ReadingCompletionSummary` is this session's honest contribution to that
longer-term picture, not a verdict in itself. Raw numeric metrics this summary is built from (§16) are
retained internally for that longer-term picture (§17) — never displayed as this session's own grade.

---

# 16. Reading Metrics

**Raw (internal, real, numeric — never displayed as a score):**
- Actual WPM per chunk (`ChunkPaceRecord.actualWpm`, §10) and session-aggregate.
- Time-on-task per chunk and per session (derived from real event timestamps).
- Chunks completed/skipped/repeated/revisited (LSE-2's own counts, reused).
- Attention sample density (`'away'`/`'idle'` ratio, §11).
- Recall hook fire count and (once implemented) response outcomes (§13).

**Derived (internal, qualitative — the vocabulary this layer is allowed to expose):**
- `ReadingSpeedModel.level` (§10) — four-stage, reused from Learning Science Framework §12.
- `ReadingFocusModel.sessionFocusTrend` (§12) — three-value qualitative trend.
- `ReadingCompletionSummary.paceTrend` (§15) — three-value qualitative trend.

No raw metric in the first list is ever surfaced to a learner directly by this layer. Only the derived,
qualitative vocabulary in the second list is designed to eventually reach the AI Mentor's own descriptive
language (`LEARNING_SCIENCE_FRAMEWORK.md` §7) — and even that hand-off is a future sprint's concern, not
built here.

---

# 17. Reading Analytics

**Explicitly reserved, not implemented — the clearest "future sprint" boundary in this document.** The
Adaptive Runtime (and everything wrapping it, including this layer) is in-memory and ephemeral per LSE-1's
and LSE-2's own handoff docs — no persistence layer exists yet anywhere in the UCE→LSE→Adaptive Runtime
arc. Reading Analytics is the future persistence/aggregation layer that would:

- Subscribe to real `ReadingRuntimeEvent`s (§4's event log) via the reserved `RuntimeModeAdapter`/
  `ReadingRecallHookAdapter` hooks and persist them as real event-sourced records — never a derived
  summary persisted in place of the real events.
- Compute cross-session trends (pace trend over weeks, consistency measured behaviorally per Mastery
  Philosophy) — never a leaderboard, streak-as-competition, or cross-learner comparison (Learning Science
  Framework §9's permanent rule).

**This must not become a seventh parallel analytics system.** `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md`
already documents six real duplicates in the existing Reading Lab's analytics surface (streak computation
triplicated, `computeJourneyProgress` collision, `TodaysMissionCard` collision, XP vs. Mind Score). Before
any future sprint implements Reading Analytics for this new engine, it must explicitly decide — the same
way that report asked Sprint 46 to decide — whether it feeds the existing `adaptive-intelligence/` engine
(`readingProfileEngine.ts`, `personalBestsEngine.ts`, etc.) or stands beside it as a distinct,
clearly-named surface. This document does not decide that; it names the requirement so a future sprint
cannot claim it wasn't flagged (§25).

---

# 18. Reading Extension Points

**`ReadingPresentationMode` — the pluggable exercise-type interface.** Reserved, type-only:

```
ReadingPresentationModeId =
  | 'whole-line'        // Reading Speed™ — comfortable, steady real-text reading
  | 'rsvp'              // RSVP™ — single-word, fixed-point, rapid-paced presentation
  | 'flash'             // Flash Reading™ — RSVP at briefer exposure durations
  | 'peripheral'        // Peripheral Vision Reading™ — central fixation, wide awareness
  | 'chunk-grouped'      // Chunk Reading™ — small word-groups as one visual unit
  | 'multi-line'         // Multi-Line Reading™ — vertical, cross-line tracking
  | 'pattern'            // Pattern Recognition™ — structural/visual pattern noticing

ReadingPresentationMode = {
  id: ReadingPresentationModeId
  // Reserved shape only — how a mode renders/paces (chunk, speedModel) → presentation state
  // transitions is a future implementation sprint's decision, not designed here.
}
```

Every curriculum exercise from `Reading Speed™` through `Pattern Recognition™` (Reading Flow Module™ +
Reading Expansion Module™) maps to exactly one `ReadingPresentationModeId` above — confirming the
extension point covers the full in-scope curriculum without redesign. `Dual Hemisphere Synchronization™`
onward (Whole Brain Reading Module™, Intuition & Advanced Cognition Module™) would each add one further
`ReadingPresentationModeId`, following the same pattern — not enumerated exhaustively here since none of
them are the immediate next sprint, per the same "grows without redesign" principle Cognitive Skills Map
§9 already applies to skills.

**`RuntimeModeAdapter`** (LSE-2, already reserved) — Quantum Speed Reading is this extension point's first
real consumer, but this sprint still only designs, never implements, a concrete adapter.

**`ReadingSpeedProfile`** (§10) — the age/goal configuration surface. This is where "beginner vs. advanced,
child vs. adult, exam prep vs. research reading" are served entirely through configuration, never new
runtime logic (§23 demonstrates this concretely).

**Named future Adaptive Runtime extension (not this layer's to build, §8):** a `jumpToChunk` runtime
decision, for arbitrary non-sequential navigation. Recorded here so it is not silently worked around by a
future implementation reaching past LSE-2.

---

# 19. Data Flow

```
UniversalLearningObject (built once, upstream — Learning Project or curated practice passage, same UCE
pipeline either way)
        │
        ▼
LSE-1 startSession(ulo, learnerId, 'reading')
   → LearningSession { queue (natural order), position, progress, eventLog }
        │
        ▼
LSE-2 startRuntime(ulo, learnerId, 'reading', chunkStrategy)
   → AdaptiveRuntimeState { session, strategy, scheduledQueue, position, progress, eventLog }
        │
        ▼
QSR startReading(ulo, learnerId, chunkStrategy, readingSpeedProfile, presentationMode)
   → ReadingRuntimeState { runtime, speedModel, attentionModel, focusModel, presentationState, eventLog }
        │
        ▼
Reading Flow (§5): resolve current chunk from ulo.knowledge.chunks via runtime.position.chunkNodeId
   → hand to active ReadingPresentationMode → learner reads → presentation signals completion
        │
        ▼
QSR continueReading(state, ulo) → LSE-2 continueRuntime(runtime, ulo) → re-applies chunk strategy,
   advances position (or, if exhausted, delegates to LSE-1 completeSession) → loop to Reading Flow
        │
        ▼ (queue exhausted)
QSR buildReadingCompletionSummary(state) → ReadingCompletionSummary (§15)
```

Nothing in this flow writes back to the ULO (immutable throughout) or to LSE-1's `LearningSession`/LSE-2's
`AdaptiveRuntimeState` except through their own public decisions — Quantum Speed Reading never constructs
a `LearningSession` or `AdaptiveRuntimeState` field by hand.

---

# 20. Event Flow

Three independent, layered event logs — each new type deliberately does **not** reuse the layer below it's
event type, the same disclosed choice LSE-2 already made relative to LSE-1 (`RuntimeEvent` is not
`SessionEvent`, because it fires against a different queue). `ReadingRuntimeEvent` follows the same
reasoning relative to `RuntimeEvent`:

| Layer | Event type | Fires on |
|---|---|---|
| LSE-1 | `SessionEvent` | `session.eventLog` — LSE-1's own lifecycle (chunk-started, chunk-completed, checkpoint-reached, session-paused/resumed/completed, progress-updated) against the **natural-order** queue |
| LSE-2 | `RuntimeEvent` | `runtime.eventLog` — the same event *kinds*, plus chunk-skipped/repeated/marked-for-revisit, against the **scheduled** queue |
| QSR | `ReadingRuntimeEvent` | `state.eventLog` — reading-presentation-layer only |

```
ReadingRuntimeEventType =
  | 'presentation-started' | 'presentation-paused' | 'presentation-resumed'
  | 'pace-adjusted'
  | 'attention-sample-recorded'
  | 'recall-hook-fired' | 'recall-response-recorded'
  | 'reading-completed'
```

**Deliberately excluded from the persisted event log:** per-word/per-unit presentation ticks (each RSVP
word flash, each fixation point). These are owned entirely by the active `ReadingPresentationMode` as
ephemeral, in-memory rendering state — persisting one event per word would flood the log with
implementation detail no consumer needs, the same "real, named events only, never a flood" discipline
LSE-1/LSE-2 already applied when they chose their own fixed, small event vocabularies rather than emitting
generically on every internal step.

---

# 21. State Model

```
Tier 1 (reused, LSE-1/LSE-2):  not-started → active ⇄ paused → completed
                                                  ↘ cancelled (from any of the first three)

Tier 2 (new, this layer, meaningful only while Tier 1 = active):
  idle → countdown → presenting → [checkpoint] → [recall] → between-chunks → idle (next chunk)
                                                                    ↓
                                                                complete (queue exhausted)
```

A pause/resume cycle is transparent to Tier 2: Tier 2 state is captured, frozen, and restored unchanged —
never reset by a pause. A `repeatReadingChunk`/`markForRevisitLater` call does not change Tier 1 at all
(both require `'active'`, per LSE-2's own transition table) and returns Tier 2 to `countdown` (repeat) or
leaves it untouched (revisit-later is mark-only, mirroring LSE-2's own `revisitLater` decision exactly).

---

# 22. Metrics Model

| Category | Examples | Computed from | Displayed to learner? |
|---|---|---|---|
| Reused, unmodified | `completionPercentage`, `estimatedTimeLeftSeconds`, `skippedCount`, `revisitCount` | LSE-2 `RuntimeProgress` | Only as non-scored progress framing (§9) |
| New, raw, internal | actual WPM per chunk, time-on-task, attention sample density | Real event timestamps + presentation-layer samples | Never directly |
| New, derived, qualitative | `ReadingSpeedModel.level`, `ReadingFocusModel.sessionFocusTrend`, `ReadingCompletionSummary.paceTrend` | The raw metrics above, thresholded | Eventually, via AI Mentor descriptive language only (future sprint) |
| Reserved, not yet real | Recall hook response accuracy | `ReadingRecallHookAdapter` (§13, unimplemented) | Never as a score, per Mastery Philosophy |

---

# 23. Configurability Matrix — "Without Redesign"

The brief requires this architecture to support beginner and advanced readers, children and adults, exam
preparation, and research reading, without redesign. Concretely, every one of these is a **configuration
choice across three already-designed extension points** — no new runtime logic:

| Learner / Goal | `ChunkStrategy` (LSE-2, already built) | `ReadingSpeedProfile` (§10) | `ReadingPresentationModeId` (§18) |
|---|---|---|---|
| Beginner / young child | `sequential` | low `startingWpm`, low `ceilingWpm`, `ageBand: '5-8'` or `'9-12'` | `whole-line` |
| Advanced adult reader | `adaptive-queue` | high `startingWpm`/`ceilingWpm`, `ageBand: 'adult'` | `chunk-grouped` or `multi-line` |
| Exam preparation | `dependency-first` or `review-first` | `goal: 'exam-prep'`, tighter pacing against `estimatedTimeLeftSeconds` | `rsvp` or `flash` |
| Research reading | `priority-first`, heavy use of `markForRevisitLater` | `goal: 'research'`, relaxed ceiling | `chunk-grouped` or `pattern` |

Every column already exists as a real, built (`ChunkStrategy`) or designed-in-this-document
(`ReadingSpeedProfile`, `ReadingPresentationModeId`) extension point. Serving a new learner population or
goal is authoring a new row in this table — a configuration/content decision — never a new decision
function, a new state, or a new queue-ordering algorithm.

---

# 24. Relationship to the Existing Production System

Restated plainly, so this is unambiguous to whoever reviews this document: **nothing in this architecture
modifies, imports from, or is imported by** `src/features/quantum-speed-reading/`,
`src/features/rapid-visual-intelligence/`, `src/features/flash-intelligence/`,
`src/components/exercise-engine/`, `src/lib/exercise-engine/`, `src/lib/exercises/`, or any route under
`src/app/labs/quantum-speed-reading/`. That system continues to serve the isolated-stimulus drills and
(today) the passage-reading flow exactly as it does now. This document's engine is additive and currently
unreferenced by anything shipped — the same "compiles, dead code, verified via `tsc --noEmit`" posture
ADR 0002 explicitly took for its own foundation-sprint scaffolding, and the same posture every prior sprint
in this arc (UCE-1…6, LSE-1, LSE-2) has taken until a consumer is explicitly authorized.

A future migration sprint — not this one — would be the one to decide whether and how the existing
passage-reading flow (`start/*`, `reading-speed`, `chunk-reading`, etc.) is re-pointed at this engine. That
decision is explicitly out of scope here.

---

# 25. Open Questions for Architectural Review

1. **Do the Flash Intelligence Pack™/Rapid Visual Intelligence isolated-word/number/symbol drills belong
   on this ULO-based substrate, or do they stay on the existing content-item substrate permanently?**
   (§1). Both are defensible; this document takes no position.
2. **Does Reading Analytics (§17) eventually feed the existing `adaptive-intelligence/` engine, or stand
   beside it as a distinct surface?** Named as a required decision before that future sprint begins, per
   the Consolidation Report's own precedent.
3. **Is a `jumpToChunk` Adaptive Runtime decision (§8, §18) worth adding to LSE-2** for exam-prep/research
   navigation, or is `revisit-later` + `adaptive-queue` sufficient in practice? Recommend prototyping
   against real usage before adding a new LSE-2 decision, since LSE-2 is locked/complete.
4. **What is the concrete signal source for `ReadingAttentionSample` (§11)?** Named as a required design
   decision for whichever future sprint implements this layer, not decided here.
5. **Exact numeric thresholds** for `ReadingSpeedModel.level` progression (§10) and `sessionFocusTrend`
   classification (§12) — deliberately left to implementation, consistent with this document's "shape,
   not behavior" mandate.

---

# 26. Future Extension Strategy

The same principle `LEARNING_SCIENCE_FRAMEWORK.md` §15 already states for future Labs applies one level
down, to future Learning Modes™ built on this same Adaptive Runtime:

- Every future Learning Mode™ (Memory Mode™, Flashcards™, MCQs™, Revision™, Research™, AI Mentor™) wraps
  `AdaptiveRuntimeState` the same way this document's `ReadingRuntimeState` does — delegate every shared
  concern, add only what is genuinely new to that mode.
- No future Learning Mode™ pushes its own vocabulary down into `AdaptiveRuntimeState` or `LearningSession`
  — both stay generic, exactly as LSE-2's own handoff already committed to.
- Every future Learning Mode™'s difficulty/pacing model reuses LSE-2's 5 `ChunkStrategy` values before
  proposing a 6th; a 6th is only justified if it produces a genuinely new ordering none of the existing 5
  can express (the same bar LSE-2's own strategies were held to).
- Every future Learning Mode™'s completion/metrics model follows §15/§16's shape: raw metrics stay
  internal, only qualitative, behaviorally-framed trends are designed to eventually reach a learner or the
  AI Mentor.

---

# Verification

This document describes architecture only. No files under `src/core/quantum-speed-reading/` exist yet; no
test suite, `tsc`, or build was run, because nothing was implemented. Verification of an implementation
against this design is the next sprint's responsibility, not this one's.

**STOP.** Per the brief: do not implement Quantum Speed Reading™. Wait for architectural review before
writing production code.
