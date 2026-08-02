# Architecture — Quantum Speed Reading™ — FINAL LOCK

## Status: LOCKED. Architecture only — no runtime, UI, or feature code has been implemented.

**Vision this document is locked against:** *"Upload Once. Learn Everywhere.™"* — a learner uploads a
document exactly once; every Learning Mode™, present and future, reads it through exactly one pipeline,
exactly one immutable source of truth, forever. Every decision below is resolved against that sentence,
not against convenience.

**Supersedes/finalizes:** `docs/ARCHITECTURE_QUANTUM_SPEED_READING.md` (the original design) and its own
prior review round. Every open item raised in that review now has a final decision. Nothing in this
document contradicts the completed, locked `docs/PRODUCTION_HANDOFF_LSE_1.md` / `docs/PRODUCTION_HANDOFF_LSE_2.md`
— those layers are not reopened.

---

# 1. The One Reading System

**Final decision.** There is exactly one Reading System, going forward: the ULO-driven Reading Runtime
this document locks. Concretely:

- **All new reading capability is built here, permanently.** The existing production passage-reading flow
  (`start/*`, `reading-speed`, `chunk-reading`, `multi-line-reading`, `sentence-reading`, `phrase-reading`,
  `progressive-chunk-reading`, `paragraph-reading` under `src/features/quantum-speed-reading/` /
  `src/app/labs/quantum-speed-reading/`) is declared **legacy** as of this lock: frozen from further
  reading-feature investment, and scheduled for migration onto this Reading Runtime in a dedicated future
  migration sprint (scope, sequencing, and cut-over plan for that sprint are explicitly not designed here
  — this lock only commits to the destination, not the migration mechanics).
- **Isolated-stimulus drills are not a second Reading System — they are a different system entirely.**
  Eye Foundation Module™ (`Eye Warm-up™`, `Eye Stretch™`, `Eye Span™`, `Regression Control™`) and the
  Flash Intelligence Pack™/Rapid Visual Intelligence drills operate on stimuli with no document and no
  meaning. "Reading," in this architecture, is specifically defined as processing real content sourced
  from a real Universal Learning Object™. A dot-tracking or isolated-symbol-flash exercise has no ULO and
  therefore cannot be, and is not, a competing Reading System. It is formally reclassified as the **Visual
  Readiness System** — permanently separate, never migrated onto ULO (locking the review's D9
  recommendation: running the full UCE pipeline over a flat stimulus bank would be real, unjustified AI
  cost and complexity for content with no structure to extract).

**Why this is best for long-term scalability.** One canonical reading pipeline means every future
improvement — a new chunk strategy, a better pacing model, a richer analytics view — is written once and
every reading exercise benefits immediately. Two reading systems would mean every such improvement is
either built twice or silently only benefits one, which is the exact failure mode
`docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` already documented once (streak computation triplicated,
`computeJourneyProgress` duplicated, XP vs. Mind Score never unified). This lock exists specifically so
that report never grows a seventh entry.

**Why this aligns with "Upload Once. Learn Everywhere.™"** A learner's uploaded content must behave
identically well regardless of which reading exercise they choose. Two reading systems would mean the
same uploaded document works fully in one and not at all (or differently) in the other — a direct
contradiction of "Everywhere." One system is the only way the promise is literally true.

---

# 2. Content Sourcing and Cold-Start Support

**Final decision.**

- **Primary path.** A learner uploads a document once, into a Learning Project. UCE-1…6 processes it once
  into a ULO. That one ULO powers every reading exercise now, and every other Learning Mode™ later (memory,
  revision, research, ...) — the literal mechanism behind "Upload Once. Learn Everywhere.™"
- **Cold-start path.** The platform maintains a small library of **Starter Documents™** — real documents,
  owned by a platform/system account rather than an individual learner, flagged as shared library content,
  ingested through the **exact same, unmodified UCE-1…6 pipeline** a user's own upload goes through. Zero
  special-casing anywhere in the engine: a Starter Document produces a ULO exactly the way a user's own
  upload does, and is consumed by the Reading Runtime exactly the way a user's own ULO is. A learner with
  zero uploads of their own reads a Starter Document; the moment they upload their own content, it is
  available identically.
- **Explicitly out of this architecture's scope:** which Starter Documents exist, how many, age-appropriate
  curation, and licensing. That is a content-operations workstream, not an engineering one — named here as
  a dependency (§8, Residual Execution Dependencies), not designed here.

**Why this is best for long-term scalability.** No second content pipeline to build, test, or maintain.
Starter Documents inherit every future engine improvement automatically, the same as user documents,
because they are not architecturally distinct from them.

**Why this aligns with "Upload Once. Learn Everywhere.™"** The platform "uploads once" on the learner's
behalf, through the identical mechanism, the moment they have nothing of their own yet — same guarantee,
same pipeline, dissolving naturally the instant the learner brings their own content.

---

# 3. Universal Learning Object™ Remains the Single Source of Truth

**Confirmed, unconditionally.** Nothing in this architecture — not the Reading Runtime, not persisted
session summaries (§5), not Reading Analytics (§12) — ever copies chunk content, analysis, or knowledge
graph data into a second store. Every reference back to real content is by `uloId` + `chunkNodeId`
(and `uloVersion`, for full traceability — the same discipline LSE-1's `LearningSession.uloVersion` already
established), never a duplicated payload. If a ULO is later re-aggregated into a new version, existing
persisted reading-state records remain honestly traceable to the exact version they were built against —
a re-aggregation never silently invalidates or rewrites history it doesn't own.

---

# 4. Layering and Consumption Rule — Now a Platform-Wide Rule

**Final decision.** The rule originally scoped to Quantum Speed Reading™ (§0 of the original architecture
document) is hereby locked as the rule **every current and future Learning Mode™ must follow**, not a
QSR-specific convention:

> A Learning Mode™ consumes only the Universal Learning Object™, the Learning Session Engine™ public
> barrel, and the Adaptive Learning Runtime™ public barrel. It never imports a lower engine
> (`upload/`, `extraction/`, `learning-chunk/`, `semantic-enrichment/`, `knowledge-graph/`,
> `learning-analysis/`) directly, and never reaches into a lower layer's `internal/` (not part of that
> layer's public API). Reading fields already embedded on an obtained ULO/`LearningSession`/
> `AdaptiveRuntimeState` — e.g. `ulo.knowledge.chunks`, `runtime.progress` — is the sanctioned way to reach
> that data; it is not an exception to the rule, it is the rule.

**Why this is best for long-term scalability.** A rule stated once, at the platform level, and verified the
same way every time (grep for `@/core/...` import targets — as LSE-2's own handoff already demonstrated) is
cheap to audit forever. A rule re-derived per Learning Mode™ would drift.

**Why this aligns with "Upload Once. Learn Everywhere.™"** This is the actual engineering mechanism that
makes "Everywhere" true: every Learning Mode™ reading from the same one ULO, through the same one
contract, is what guarantees a document behaves identically no matter which mode reads it.

---

# 5. Persistence and Cross-Session Continuity

**Final decision.** "Learn Everywhere™" requires state to survive a closed tab, a different device, and a
gap of days — the in-memory-only posture of UCE/LSE-1/LSE-2 as shipped cannot satisfy that on its own, so
this layer adds the one thing genuinely new to it:

- **What is persisted:** a derived **Reading Session Summary** — `learnerId`, `uloId`, `uloVersion`,
  `chunkStrategy`, current `level` (§9), `completionPercentage`/`completedChunkIds` count,
  `sessionFocusTrend` (§10), `paceTrend`, timestamps. Written via a Server Action (§6), one row per
  reading session, in a table shaped after ADR 0001's own precedent (`session_type` discriminator +
  `data jsonb` payload) — extending that existing pattern, not inventing a new one.
- **What is never persisted:** raw per-chunk event logs, raw WPM figures, raw attention samples, or
  anything that could be redisplayed as a score. Only the qualitative, already-derived fields defined in
  §9/§10/§16 are written. This is a hard constraint, not an optimization — it is the same "never store
  what must never be shown" discipline the original architecture document already applied to display logic
  (§9 of that document), extended here to apply to the database as well.
- **What is reconstructed, not restored byte-for-byte:** the live `ReadingRuntimeState`/
  `AdaptiveRuntimeState`/`LearningSession` tree. A returning learner's session is rebuilt fresh from the ULO
  plus the persisted Summary (e.g., "resume at 40% complete, Level: Consistency, strategy: adaptive-queue")
  — never a full historical event-log replay. This keeps the live runtime tree exactly as cheap and ephemeral
  as LSE-1/LSE-2 already designed it to be; only the durable *facts* cross session boundaries, never the
  full object graph.

**Why this is best for long-term scalability.** Persisting derived summaries instead of full state keeps
the database table small and bounded regardless of session length or event volume — a session with 5
chunks and a session with 500 produce the same-shaped, small row. The live runtime tree stays exactly as
cheap to construct as it already was.

**Why this aligns with "Upload Once. Learn Everywhere.™"** This is "Everywhere" made real: the same
learner, on a different device, a week later, picks up their real progress against the same one ULO —
without ever re-uploading or losing what they'd built.

---

# 6. Client/Server Boundary — Explicit

**Final decision.** No concern in this architecture is left ambiguous about where it executes:

| Concern | Executes | Why |
|---|---|---|
| Presentation ticks (word flash, line reveal, exposure timing) | **Client**, in-memory, ephemeral | Sub-second granularity; a network round-trip here would be real, felt latency. Already excluded from any event log by the original design (§20) — this lock confirms it is also excluded from any network call. |
| Reading Decisions (`startReading`, `continueReading`, `pauseReading`, `resumeReading`, `repeatReadingChunk`, `skipReadingChunk`, `markForRevisitLater`, `acknowledgeCheckpoint`, `completeReading`) | **Server Action** | Engineering Constitution: "All mutations via Server Actions, never client-to-own-API-route." Also the natural point to write the Reading Session Summary (§5) in the same round-trip. |
| Attention samples (§10) | **Collected client-side, batched, attached to the next Reading Decision call** | Never its own network round-trip — avoided by design, not merely by convention. |
| ULO retrieval | **Server** (Server Component / Server Action, RLS-scoped) | ULO/document data is per-learner-project and RLS-gated; never fetched client-side directly. |
| AI Mentor commentary (§8) | **Server Action**, server-side Anthropic call | API key is server-only per the Constitution, without exception. |

**Why this is best for long-term scalability.** Every future Learning Mode™ inherits this same table
verbatim — "what runs where" is answered once, platform-wide, not re-litigated per mode.

**Why this aligns with "Upload Once. Learn Everywhere.™"** Server-authoritative Reading Decisions are what
make cross-device continuity (§5) trustworthy — the server, not a client cache, is always the source of
truth for "where did I leave off."

---

# 7. Module Placement — Final, and the Convention Every Future Learning Mode™ Follows

**Final decision.** `src/core/learning-modes/quantum-speed-reading/` — not `src/core/quantum-speed-reading/`
as originally proposed, and not a `src/features/*` slice.

**Why the change from the original proposal.** The original document's own review round flagged a real
collision risk: `src/features/quantum-speed-reading/` already exists, is large, and is live. Nesting under
one real `learning-modes/` directory does two things at once: it removes the naming collision entirely,
and it makes "Future Learning Modes™" — until now only a label on a diagram — a real, navigable convention.
Every future Learning Mode™ (Memory Mode™ → `src/core/learning-modes/memory-mode/`, Flashcards™ →
`src/core/learning-modes/flashcards/`, and so on) follows the identical pattern.

**Why this is best for long-term scalability.** A future engineer building the second Learning Mode™ finds
the first one's shape by looking at its sibling directory, not by re-deriving conventions from a
prose-only handoff doc.

**Why this aligns with "Upload Once. Learn Everywhere.™"** Every Learning Mode™ under this one directory,
consuming the one ULO contract (§4), is the structural expression of "Everywhere" — one place a future
engineer looks to find every way a document can be learned from.

---

# 8. AI Processing Policy — Ingestion-Time Only, One Named Exception

**Final decision, platform-wide, not QSR-specific.**

- **Default rule:** AI processing happens exactly once per document, at ingestion time — UCE-3B's semantic
  enrichment, UCE-4's one AI-derived edge type (`builds-upon`), and UCE-5's optional `aiRefinedStrategy`
  for `'core'`-role concepts. This cost is paid once and amortized forever across every future read, by
  every learner, in every Learning Mode™, of that same document. This is the literal cost-engineering
  meaning of "Upload Once": the expensive part happens once.
- **The Reading Runtime itself makes zero AI calls.** Chunk scheduling (LSE-2), the Reading Speed Model
  (§9), and the Reading Focus Model (§10) are 100% deterministic, computed entirely from already-real ULO
  fields and real event timestamps. This was already true in the original design; it is now locked as a
  **hard platform rule**, not an implementation detail: no Learning Mode™ may perform its own duplicate
  document analysis, re-enrichment, or re-classification at runtime. If a Learning Mode™ needs a signal the
  ULO doesn't already carry, the correct fix is adding that signal to an upstream engine (UCE-3B/4/5) once,
  for every future consumer — never a private, mode-local AI call re-deriving something the pipeline should
  have produced.
- **The one sanctioned exception:** AI Mentor commentary, and only at real, named, bounded moments —
  checkpoint and completion (§9's Reading Checkpoints, §15's Reading Completion), never per-chunk. This is
  live reasoning that genuinely cannot be precomputed at ingestion (it responds to *this specific session's*
  real pace/focus trend), and it is explicitly bounded to at most one call per checkpoint plus one at
  completion — never a per-chunk cadence, directly resolving the token-efficiency concern raised in review.
- **Rule for every future Learning Mode™:** any new live/runtime AI reasoning must be named, bounded, and
  justified in that mode's own architecture document before implementation, the same way this section just
  did for the Mentor — never silently added because it seemed convenient during implementation.

**Why this is best for long-term scalability.** A cost model with exactly one exception is auditable —
"grep for AI calls outside `universal-learning-engine/` and outside the Mentor's own checkpoint/completion
hooks" is a real, cheap, permanent verification a future reviewer can run.

**Why this aligns with "Upload Once. Learn Everywhere.™"** Ingestion-time-only processing is precisely what
makes "Upload Once" true in cost terms, not just data terms — the document is understood once, and every
mode that reads it afterward gets that understanding for free.

---

# 9. Reading Speed Model — Final

**Final decision, resolving the review's flagged tension with `QUANTUM_SPEED_READING_CURRICULUM.md` §2
("speed is a consequence... never the goal pursued directly").**

The pacing mechanism is **exposure-duration/level-driven**, not WPM-target-driven:

```
ReadingSpeedModel = {
  profile: ReadingSpeedProfile           // ageBand, goal, startingLevel — configuration, §Configurability
  level: 'orientation' | 'consistency' | 'automaticity' | 'mastery'   // Learning Science Framework §12, reused verbatim
  exposureDurationSeconds: number        // the actual pacing input — how long a chunk/unit is presented
  perChunkPace: readonly {
    chunkNodeId: string
    exposureDurationSeconds: number
    derivedWpm: number | null            // OBSERVATION ONLY — never a pacing input, never displayed as a score
  }[]
}
```

- **What drives presentation timing:** `exposureDurationSeconds`, set per real chunk from the chunk's own
  real `chunk.statistics.wordCount` and `analysis.chunkAnalyses[].readingComplexity`/`learningDifficulty`
  (already-real UCE-1/UCE-5 output, reused, never re-derived) at the learner's current `level`. Advancing a
  level shortens the exposure window for a chunk of equivalent real complexity — the felt experience the
  curriculum itself describes ("Speed: 3.5s per cycle at Beginner → 2.0s at Master," `EXERCISE_SPEC_TEMPLATE.md`
  §6) — without the system's own internal logic ever being organized around "hit this WPM number."
- **What WPM is now:** a real, honest, internal-only *observation* — `derivedWpm`, computed after the fact
  from real `chunk-started`/`chunk-completed` timestamps, useful for analytics (§12) and for the Mentor's
  eventual descriptive language (§8), never fed back into the pacing decision and never displayed as a
  target or a score.
- **Level progression:** gated by sustained comfortable completion (low repeat/revisit/away rate, §10) at
  the current exposure tier, across multiple real, persisted sessions (§5) — never a single session, never
  a calendar deadline. This is Learning Science Framework §12's own rule, now enforceable in practice
  because §5 makes cross-session history real.

**Why this is best for long-term scalability.** A pacing model driven by exposure duration and complexity —
not a rate a future engineer could be tempted to "optimize" — structurally resists drifting into a
speed-chasing product over time, regardless of who tunes it next or how.

**Why this aligns with "Upload Once. Learn Everywhere.™"** The same uploaded document paces itself
correctly for a beginner and an advanced reader purely by which `level`/`exposureDurationSeconds` applies —
no separate content, no separate document, no separate system. One ULO, every reading level.

---

# 10. Attention and Focus Model — Final

**Final decision, resolving the review's surveillance-risk concern against the platform's own
"judgment-free" ethos (`Silent Observation™`, Learning Science Framework §7/§16).**

- **Signal source: passive only, permanently.** Page-visibility state and interaction-activity heartbeat
  only. **Never** a visible "are you still there?" prompt, **never** an interruption, **never** any UI
  surfacing of tracked attention data to the learner, ever, under any framing. This is a hard architectural
  constraint, locked here so it cannot be reinterpreted by whoever implements it later.
- **Batched, not per-sample-persisted.** Samples accumulate client-side and travel with the next Reading
  Decision call (§6) — never their own network round-trip, never their own state revision per sample.
- **Used for exactly two things:** (1) auto-pausing the presentation pacing loop when the learner has
  genuinely stepped away (a comfort feature, not a monitoring one), and (2) feeding `sessionFocusTrend`
  (`'building' | 'steady' | 'declining'`) — itself derived from real, already-tracked LSE-2 signals
  (`isRepeatedChunk`, `isMarkedForRevisit`, via `evaluateLearningState()`) combined with attention-sample
  density, never a new invented metric.
- **Never displayed, never scored, never compared.** `sessionFocusTrend` may eventually inform the AI
  Mentor's own qualitative language (§8) — it is never shown to the learner as a tracked number, per
  Cognitive Skills Map §6's own permanent rule.

**Why this is best for long-term scalability.** A hard, written constraint that survives regardless of who
implements or later touches this code is cheaper than re-litigating "is this creepy" once per future
change.

**Why this aligns with "Upload Once. Learn Everywhere.™"** Attention/focus modeling here exists purely to
make reading *any* uploaded document feel calmer and more comfortable everywhere it's read — never to
surveil the act of reading it.

---

# 11. Recall Hooks — Final

**Final decision, resolving the review's "is this a disguised quiz" concern.**

Recall Hooks are **open-ended, non-scored reflection prompts only.** No right/wrong evaluation exists in
this Learning Mode™, in any form, internal or displayed. A hook firing at a checkpoint or a real
high-`memoryDifficulty` chunk (`ulo.learning.memoryBlueprint`, reused) invites the learner to notice what
they recall — the retrieval act itself is the entire mechanism (Learning Science Framework §3's own
"Retrieval" principle does not require correctness-scoring to produce its benefit). This is a genuine
functional difference from `ComprehensionQuizExperience.tsx`, not a relabeling of the same mechanism.

**Why this is best for long-term scalability.** A hook with no correctness model can never accidentally
grow into a graded quiz through incremental feature requests — there is no score field for a future
request to "just surface."

**Why this aligns with "Upload Once. Learn Everywhere.™"** The same uploaded document supports genuine
retrieval practice everywhere it's read, without ever needing an answer key authored for it.

---

# 12. Reading Analytics and the Legacy Migration Path — Final

**Final decision, resolving the review's "does this feed the existing engine or stand apart" question.**

Reading Analytics for this engine is built as its **own canonical surface** from the start — not force-fit
into the legacy `adaptive-intelligence/` engine's `ReadingSessionRecord` shape (which assumes WPM/accuracy/
comprehension fields this engine deliberately does not produce in that form, per §9/§11). The existing
legacy analytics surface (`readingProfileEngine.ts`, `personalBestsEngine.ts`, the `/labs/quantum-speed-reading/intelligence`
hub) is explicitly labeled **Legacy Reading Analytics** as of this lock — a documentation/communication
action taken now, not a code change — until the migration sprint named in §1 retires it. During that window,
both surfaces may exist, but never as two equally-valid permanent systems: one is current, one is explicitly
sunsetting. This is the same "never two Reading Systems" principle (§1) applied to analytics specifically.

**Why this is best for long-term scalability.** Building the new analytics surface against this engine's own
real, honest data shapes (§16) avoids a second reshaping project later; labeling the legacy surface now
prevents it from quietly becoming a second permanent source of truth by default.

**Why this aligns with "Upload Once. Learn Everywhere.™"** One analytics story, eventually, for one Reading
System — a learner's progress history means the same thing everywhere they look at it.

---

# 13. Deferred Items — Bounded, Not Open-Ended

Two items from the review are deliberately deferred rather than resolved today. Deferred is a final
decision in itself, made with an explicit revisit trigger — not an unresolved gap:

- **Per-layer event types** (`SessionEvent` / `RuntimeEvent` / `ReadingRuntimeEvent`, each independently
  defined). **Locked as designed.** Revisit only if a third or fourth Learning Mode™'s own event type
  starts showing genuine *logic* duplication, not merely structural similarity — the current shape-level
  repetition is an accepted, intentional cost of the decoupling that let LSE-2 be built without touching a
  single LSE-1 file.
- **`jumpToChunk`** (arbitrary non-sequential navigation, e.g., exam-prep skimming to a specific section).
  **Not added.** LSE-2 is complete and locked; this is not reopened speculatively. Revisit trigger: real
  usage evidence that `adaptive-queue` strategy + `revisit-later` is insufficient for exam-prep/research
  learners in practice — not added ahead of that evidence, and never approximated via repeated `skip-chunk`
  calls (which would corrupt the real meaning of `skippedChunkIds`).

---

# 14. Component Hierarchy — Final

```
src/core/learning-modes/quantum-speed-reading/
  types/
    ReadingPresentationState.ts
    ReadingSpeedModel.ts            (§9 — exposure-duration-driven, WPM as observation only)
    ReadingAttentionModel.ts        (§10 — passive-only, batched)
    ReadingFocusModel.ts            (§10)
    ReadingRecallHook.ts            (§11 — non-scored, reserved)
    ReadingCompletionSummary.ts     (§16)
    ReadingSessionSummary.ts        (§5 — the persisted, derived shape; NEW vs. the original design)
    ReadingRuntimeEvent.ts
    ReadingRuntimeState.ts
    ReadingActionResult.ts
    ReadingPresentationMode.ts      (§ Configurability, reserved)
    index.ts
  internal/
    computeExposureDuration.ts      (§9 — replaces the original design's computeReadingSpeedTarget.ts)
    computeChunkPace.ts             (derives real, internal-only WPM observation)
    evaluateFocusTrend.ts
    resolveRecallHookTrigger.ts
    buildReadingCompletionSummary.ts
    buildReadingSessionSummary.ts   (§5 — the persistable projection)
  decisions/
    startReading.ts / continueReading.ts / pauseReading.ts / resumeReading.ts /
    repeatReadingChunk.ts / skipReadingChunk.ts / markForRevisitLater.ts /
    acknowledgeCheckpoint.ts / completeReading.ts
    (each: Server Action per §6, delegates to the matching LSE-2 decision, persists via
    buildReadingSessionSummary on every call)
  testFixtures.ts
  index.ts
```

The only structural change from the original design: `ReadingSessionSummary` (§5) and
`buildReadingSessionSummary.ts` are new, and `computeReadingSpeedTarget.ts` is renamed/reworked into
`computeExposureDuration.ts` to reflect §9's final pacing mechanism. Everything else stands as originally
designed.

---

# 15. Event Flow — Final

Unchanged from the original design's §20, with one addition: every `ReadingRuntimeEvent` that represents a
Reading Decision (not a presentation tick) now also triggers a `ReadingSessionSummary` write (§5, §6) in
the same Server Action call — persistence is not a separate event, it is a side effect of the same
decision call that already exists.

---

# 16. State Model — Final

Unchanged from the original design's §21 (two-tier: Tier 1 reused lifecycle status, Tier 2 new
presentation state), with `ReadingSpeedModel.level` (§9) now understood as a **third, slower-moving tier**
— persisted (§5), spanning many sessions, orthogonal to both Tier 1 (per-session lifecycle) and Tier 2
(per-chunk presentation):

```
Tier 1 (LSE-1/LSE-2, per session):        not-started → active ⇄ paused → completed / cancelled
Tier 2 (this layer, per chunk):           idle → countdown → presenting → [checkpoint] → [recall] → between-chunks
Tier 3 (this layer, cross-session):       orientation → consistency → automaticity → mastery
```

---

# 17. Confirmation Checklist

| Requirement | Status | Reference |
|---|---|---|
| There will never be multiple Reading Systems | **CONFIRMED** | §1 |
| Universal Learning Object™ remains the single source of truth | **CONFIRMED** | §3 |
| Reading Runtime consumes ULO only | **CONFIRMED** | §4 |
| No Learning Mode™ performs duplicate AI processing | **CONFIRMED** | §8 |
| Cold-start users are fully supported | **CONFIRMED** | §2 |
| Reading psychology, pacing, focus, and attention model are finalized | **CONFIRMED** | §9, §10 |
| Client/Server boundaries are explicit | **CONFIRMED** | §6 |
| AI processing occurs only during document ingestion unless a feature explicitly requires live reasoning | **CONFIRMED** — one named, bounded exception | §8 |
| Future Learning Modes™ can plug into the same architecture without changing existing systems | **CONFIRMED** | §4, §7 |

---

# 18. Chief Architect Review

Reviewing this lock as if encountering it for the first time, adversarially, before signing off on
production implementation:

**Every open architectural decision from the prior review round now has a final, written resolution.**
Nothing in §1–§13 is a placeholder or a "TBD" — each is a decision, a scalability rationale, and a vision
alignment, as required.

**Residual dependencies — execution work, not unresolved architecture:**

- The legacy-system migration sprint (§1) is named and its destination is locked, but its own scope,
  sequencing, and cut-over plan are a separate future sprint's responsibility, not designed here. Until
  that sprint runs, "one Reading System" is the enforced rule for everything *new*, while the legacy system
  still exists in production, clearly labeled as sunsetting (§1, §12) rather than hidden or pretended away.
- Starter Documents™ (§2) require real content curation — an operational dependency this architecture
  depends on but does not own.
- The persisted `ReadingSessionSummary` table (§5) needs an actual migration written, following the ADR
  0001 pattern this lock references — the shape is locked, the SQL is not yet written.
- `exposureDurationSeconds` thresholds per `level` (§9) and the exact `sessionFocusTrend` classification
  thresholds (§10) require real calibration against real learner data once implemented — the mechanism is
  locked, the numbers are a future tuning task, deliberately not invented here.

None of these are open architectural questions — each has a decided shape, a decided owner, and a decided
boundary. They are the normal, expected pre-implementation work that follows an architecture lock, not
evidence the lock is incomplete.

**No unresolved architectural risk remains.**

---

**Quantum Speed Reading™ Architecture is LOCKED and ready for production implementation.**

Per the brief: no runtime, UI, or feature code follows this document. Implementation begins only when
explicitly authorized, against this lock, in a future sprint.
