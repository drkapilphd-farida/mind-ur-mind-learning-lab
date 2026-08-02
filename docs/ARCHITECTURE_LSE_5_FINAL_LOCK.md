# Architecture — Learning Mode Runtime Contract™ — FINAL LOCK (LSE-5)

## Status: LOCKED. Architecture only — no Learning Mode, Dashboard, or UI code has been implemented.

**Contract version: 1.0.** This document is the one production contract every current and future Learning
Mode™ (Quantum Speed Reading™, Memory Mode™, Smart Notes™, Mind Maps™, Flashcards™, MCQs™, Revision™,
Research™, AI Mentor™) must satisfy to plug into the runtime. It formalizes and generalizes rules already
established piecemeal across four completed layers (`docs/PRODUCTION_HANDOFF_LSE_1.md` through `_LSE_4.md`)
and the Quantum Speed Reading™ architecture round (`docs/ARCHITECTURE_QSR_FINAL_LOCK.md`) into one governing
document every future sprint traces back to — the same relationship `LEARNING_SCIENCE_FRAMEWORK.md` has to
every curriculum document.

---

# 0. What This Contract Governs, and a Refinement It Makes Final

The runtime foundation is complete:

```
Universal Learning Object™ (UCE-1…6)
        ↓
Learning Session Engine™ (LSE-1)
        ↓
Adaptive Learning Runtime™ (LSE-2)
        ↓
Learning Session Runtime™ (LSE-3)
        ↓
Learning Mode Runtime Integration™ (LSE-4)
        ↓
Learning Mode Runtime Contract™ (LSE-5, this document) — governs everything below this line
        ↓
Future Learning Modes™ (unimplemented)
```

**One refinement this document makes final, superseding an earlier, correct-at-the-time statement.** The
Quantum Speed Reading™ architecture round (written before LSE-3/LSE-4 existed) stated a Learning Mode
"consumes ULO + LSE-1 + LSE-2." Now that LSE-3 and LSE-4 exist and were themselves verified to need only
`@/core/universal-learning-engine/universal-learning-object`, `@/core/adaptive-learning-runtime`, and
`@/core/learning-session-runtime` — never LSE-1's own barrel directly — the same must hold one layer
higher. **A Learning Mode's primary integration surface is LSE-4.** It may additionally consume LSE-2's and
LSE-3's public barrels directly for types LSE-4 doesn't re-export, and the ULO barrel for content. **It
never needs, and must never import, LSE-1's barrel directly** — everything LSE-1 provides is already
reachable through LSE-2's `AdaptiveRuntimeState.session` and LSE-3's derived summaries. This is a
tightening, not a contradiction, of the earlier QSR document.

---

# 1. Required Interfaces

Exactly two fields are required for any value to be a valid, registrable Learning Mode — deliberately
minimal:

```
LearningMode.type: LearningModeType          // one of the 9 reserved values (LSE-1)
LearningMode.capabilities: LearningModeCapabilities   // sessionType, supportedChunkStrategies, supportsCheckpoints (LSE-4)
```

Nothing else is required. A Learning Mode with no adapter, no persistence, and no mode-specific state is
still a fully legitimate, registrable plug-in — the same "adapter is optional" design LSE-4 already locked.

---

# 2. Optional Interfaces

- `LearningMode.adapter?: RuntimeModeAdapter` (LSE-2) — all 8 lifecycle hooks within it are themselves
  individually optional. A mode implements only what it genuinely needs.
- `LearningModeConfig.modeOptions?: Readonly<Record<string, unknown>>` (LSE-4) — an opaque bag LSE-4 never
  reads; the mode's own config (e.g. a chosen `ReadingSpeedProfile`) travels here.
- A concrete implementation of LSE-3's `SessionPersistenceAdapter` — optional per mode, but the only
  sanctioned path to cross-session continuity ("Learn Everywhere™"); a mode that skips this is choosing
  session-scoped-only operation, a real and legitimate (if lesser) choice.
- Any mode-owned state/event/type the mode needs for its own presentation layer (precedent: Quantum Speed
  Reading's own `ReadingRuntimeState`, `ReadingSpeedModel`, `ReadingRuntimeEvent`) — entirely invisible to
  LSE-1…4, never registered, never validated by this contract.

---

# 3. Runtime Lifecycle

Closed and final: exactly the 9 real decisions LSE-2 already implements (`start`, `continue`, `pause`,
`resume`, `repeat-chunk`, `skip-chunk`, `revisit-later`, `checkpoint`, `complete`), reached exclusively
through LSE-4's `startModeRuntime` (for `start`) and `dispatchAfterDecision` wrapping any of the other 8. A
Learning Mode **never** defines a 10th lifecycle transition, never introduces a parallel status enum
alongside LSE-1's closed 5-value `SessionStatus`, and never calls an LSE-1 or LSE-2 action/decision by any
path other than LSE-4's integration functions.

---

# 4. Session Ownership

`LearningSession` (LSE-1) is owned exclusively by LSE-1's own 7 actions. Per §0's refinement, a Learning
Mode never imports or constructs one directly — it is reached only as `runtime.session`, embedded inside
the `AdaptiveRuntimeState` LSE-2 hands back through LSE-4.

---

# 5. Progress Ownership

`RuntimeProgress` (LSE-2, numeric completion/remaining data) and `RuntimeMetrics`/`SessionSnapshot`/
`SessionHistory` (LSE-3, derived summaries) are owned exclusively by those layers. LSE-4's
`synchronizeModeProgress` is the **sole** sanctioned way a Learning Mode reads a combined progress view. A
Learning Mode may build its own further-derived, mode-specific summary on top (precedent: QSR's
`ReadingCompletionSummary`) but must never independently recompute a completion percentage, a chunk count,
or a duration — every one of those numbers already exists, real, one layer down.

---

# 6. Event Ownership

`SessionEvent` (LSE-1) and `RuntimeEvent` (LSE-2) are closed unions, exclusively emitted by their own
layers' own actions/decisions. A Learning Mode may define its own, separate, mode-scoped event type for
mode-internal presentation concerns (precedent: QSR's `ReadingRuntimeEvent`, deliberately not reusing
`RuntimeEvent` — the same reasoning LSE-2 itself used relative to `SessionEvent`) — but must receive every
runtime-level event exclusively through LSE-4's `dispatchRuntimeEvents`/`dispatchAfterDecision`. A Learning
Mode never independently diffs or polls `AdaptiveRuntimeState` to infer what happened; if a hook doesn't
exist for something it needs to know, that is a real gap to raise against LSE-2, not a reason to start
inferring state changes independently.

---

# 7. State Ownership

`AdaptiveRuntimeState` (LSE-2) is canonical. A Learning Mode never mutates a field on it directly — every
change happens only through LSE-2's own decisions. A mode **may** wrap it in its own state object
(precedent: `ReadingRuntimeState { runtime: AdaptiveRuntimeState; ... }`) — this is not merely permitted,
it is the **required** pattern for any mode carrying its own additional state: **embed the real object by
reference, never copy or reshape its fields into a parallel structure.** A mode that copies
`completedChunkIds`/`position`/etc. into its own differently-shaped fields has silently created a second,
divergence-prone source of truth — exactly what LSE-2's own design over LSE-1 was built to avoid, and
exactly what this contract forbids one layer further out.

---

# 8. Rendering Responsibilities

100% owned by the Learning Mode. Confirmed by re-verification this sprint: zero React/Next.js/UI imports
exist anywhere across UCE-1…6, LSE-1, LSE-2, LSE-3, or LSE-4. All presentation, animation, layout,
accessibility implementation, and visual design is the Learning Mode's exclusive responsibility — the
runtime foundation renders nothing and has no opinion on how anything looks.

---

# 9. Interaction Responsibilities

100% owned by the Learning Mode. All user input — clicks, taps, keyboard, gestures, timers — is the mode's
responsibility to capture and translate into calls on LSE-4's integration functions or (via them) LSE-2's
decisions. No layer below the Learning Mode reads input directly or has any concept of a pointer, a key, or
a screen.

---

# 10. Analytics Responsibilities

Split, and this split is final. LSE-3 owns generic, mode-agnostic derived analytics
(`RuntimeMetrics`/`SessionSnapshot`/`SessionHistory`) — every Learning Mode reuses these verbatim, never
recomputing an equivalent. A Learning Mode may build further, genuinely mode-specific analytics on top
(precedent: QSR's own Reading Analytics, `docs/ARCHITECTURE_QSR_FINAL_LOCK.md` §12) — but every such
surface must be **distinctly named** and must never silently duplicate another mode's or the platform
dashboard's own analytics vocabulary. This rule exists because `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md`
already documents six real, historical instances of exactly this failure in the pre-existing product
(streak computation tripled, `computeJourneyProgress` and `TodaysMissionCard` each duplicated, two
unreconciled reward vocabularies) — this contract is written so a seventh instance cannot originate from
any Learning Mode built against it.

---

# 11. Extension Strategy

A new Learning Mode requires exactly one thing: a real `LearningMode` value passed to
`registry.register()`. Zero changes to LSE-1…4 are required for the 9 already-reserved
`LearningModeType` values. The one described exception: a genuinely novel 10th+ mode not among the 9
reserved names requires a minimal, additive-only edit to LSE-1's closed `LearningModeType` union (§14) —
the single sanctioned case where a locked layer is reopened, and only ever to add one string, never to
change existing behavior.

---

# 12. Plugin Strategy

LSE-4's `createLearningModeRegistry()` is a **factory**, not a shipped singleton — this document locks how
it is used in practice, since LSE-4 itself deliberately left this open: **a registry instance is
constructed fresh, cheaply, at each composition root** (e.g. the top of a Server Action, or once per
request) rather than assumed to be a persistent, process-wide singleton. Two reasons, both real: (1) a
`Map`-backed registry holding a handful of plain `LearningMode` values is trivially cheap to reconstruct —
there is no meaningful cost to avoid by caching it, and (2) a serverless/edge execution environment
provides no guarantee that module-level state survives between invocations anyway, so designing around a
persistent singleton would be relying on an assumption this platform's own deployment model doesn't honor.
Each composition root registers the small, currently-implemented set of modes at the top, then calls
`startModeRuntime`/`dispatchAfterDecision` as needed within that same request.

---

# 13. Versioning Strategy

**This contract itself is versioned** — Contract version 1.0, as declared at the top of this document. A
**breaking** change to `LearningMode`/`RuntimeModeAdapter`/`LearningModeCapabilities`/`LearningModeConfig`
(removing a field, changing a field's meaning, removing a hook) requires a new major contract version and a
written migration note in a future `ARCHITECTURE_LSE_5_FINAL_LOCK_V2.md`-equivalent document — never a
silent edit to this one. An **additive** change (a new optional hook, a new optional capability field) does
not require a new contract version, the same discipline every `*Version` envelope in this arc already
applies at the object level (`SessionVersion`, `RuntimeVersion`, `ULOVersion`, ...) — this document extends
that same discipline to the contract as a whole, one level up.

---

# 14. Future Compatibility Rules

- **A new Learning Mode** is a new `registry.register()` call. Zero changes to LSE-1…4.
- **A new chunk-ordering need** a mode discovers it wants must be proposed as a 6th `ChunkStrategy` value
  on LSE-2 (a described, deliberate reopening of a locked layer) — **never** reimplemented locally inside a
  mode by hand-sorting a queue. A mode that reorders content itself has silently built a second chunk-
  scheduling engine, exactly the "duplicate runtime logic" this contract forbids.
- **A new mode-scoped event** a mode needs is the mode's own event type (§6) — never a modification to
  `RuntimeEvent`/`SessionEvent`.
- **A new, 10th+ named Learning Mode** requires the one sanctioned additive edit to LSE-1's
  `LearningModeType` union (§11).
- **A new persistence need** beyond what `SessionSnapshot` carries is a mode's own additional summary
  fields, referencing the snapshot by `sessionId` — never a modification to `SessionSnapshot` itself to add
  mode-specific fields into a supposedly generic shape.

---

# 15. Performance Rules

- **No I/O below the Learning Mode.** Confirmed: UCE-1…6, LSE-1, LSE-2, LSE-3, and LSE-4 remain 100% pure,
  synchronous-or-Promise-only computation with zero network/database calls anywhere except the ULO's own
  one-time AI-foundation calls at ingestion (out of this contract's runtime scope entirely).
- **Presentation-tick-level state must stay entirely mode-local.** A rapid-pacing concern (e.g. an RSVP
  word flash) must never trigger a runtime decision call per tick — only real, user-facing state
  transitions (chunk complete, chunk skipped, ...) call into LSE-4. This was already locked specifically
  for Quantum Speed Reading (`ARCHITECTURE_QSR_FINAL_LOCK.md` §6) and is now the general rule for every
  mode.
- **Registry operations are O(1)**; event dispatch is O(events-in-this-call), always small and bounded
  (LSE-2's own decisions each produce a handful of events, never an unbounded stream).
- **A Learning Mode must not call a runtime decision more often than real user-facing transitions
  warrant** — no polling loops calling `continueRuntime` speculatively, no decision calls made "just in
  case."

---

# 16. Error Handling Rules

- **Universal Result-type discipline, extended to every Learning Mode.** Every function in UCE-1…6, LSE-1,
  LSE-2, LSE-3, and LSE-4 returns `{ success: true; ... } | { success: false; error }` for every expected,
  foreseeable failure and never throws for one. Any function a Learning Mode writes that wraps or composes
  these must preserve this discipline — never converting a real, expected failure into a thrown exception
  partway up the mode's own stack.
- **Errors must be propagated, never swallowed or reinterpreted.** A Learning Mode that catches a
  `RuntimeActionError` (e.g. `invalid-transition`) and proceeds as though the call had succeeded has broken
  the one guarantee every layer beneath it was built to provide.
- **Runtime validity checks reuse LSE-3's `diagnoseRuntimeHealth`/`recoverRuntime` verbatim.** A Learning
  Mode never invents its own "is this runtime still consistent with the ULO" check — that logic already
  exists, real, one layer down.

---

# 17. Confirmation Checklist

| Requirement | Status | Reference |
|---|---|---|
| Universal Learning Object™ remains the only content source | **CONFIRMED** | §4, §5, §6 — every layer references content by id, never copies it |
| Learning Session Runtime remains the only runtime | **CONFIRMED** | §0, §3 — no parallel lifecycle/state machine permitted anywhere in this contract |
| Learning Modes never duplicate runtime logic | **CONFIRMED** | §7, §14 — chunk scheduling, progress, and state mutation stay exclusively in LSE-1…3 |
| Learning Modes never perform document parsing | **CONFIRMED** | §0 — no Learning Mode import path reaches `extraction/`, `learning-chunk/`, `knowledge-graph/`, or `learning-analysis/` |
| Learning Modes never perform AI processing | **CONFIRMED** | §15 — zero I/O below the Learning Mode; all AI processing happens once, at ULO ingestion, entirely outside this contract's runtime scope |
| Every future Learning Mode becomes only a plug-in | **CONFIRMED** | §1, §11, §12 — two required fields plus `register()`, nothing else |

---

# 18. Repository Search — Duplicate Runtime Responsibilities

Performed fresh this sprint, not assumed from prior sessions:

- **`git status --short src/core`** — every file under `src/core/` remains exactly as LSE-1…4 left it;
  zero drift since LSE-4.
- **Grepped the whole repo for session-state-machine-shaped code** (`SessionStatus`-like 5-value unions,
  `validateTransition`, `computeSessionProgress`/`computeRuntimeProgress`-named functions) **outside
  `src/core/`** — zero matches. No parallel runtime has been built anywhere else in the codebase.
- **Grepped for anything outside `src/core/` already importing from LSE-1…4** — zero matches. No premature
  or incorrect integration exists; every future Learning Mode genuinely starts from zero wiring.
- **Two pre-existing, already-disclosed duplication sources were re-checked, not newly discovered, and
  neither is a violation of this contract:**
  1. `src/lib/intelligence/`, `src/hooks/intelligence/`, `src/components/intelligence/` (`JourneyState`/
     `calculateJourneyState`) — real, dead, unwired scaffolding, first documented in
     `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` §2.5. It predates this entire runtime arc, has zero live
     callers, and was never built against — or in violation of — this contract, since this contract did
     not exist when it was written. It remains a real cleanup opportunity for a future, separately-scoped
     sprint (§19), not a contract violation today.
  2. The legacy, production `src/features/quantum-speed-reading/` system and its own
     `useUniversalExerciseRuntime`/`UniversalExercisePlayer` runtime — confirmed, again, to have zero
     imports from `src/core/` in either direction. This is the same disclosed, intentional boundary
     `docs/ARCHITECTURE_QUANTUM_SPEED_READING.md` §1 and `docs/ARCHITECTURE_QSR_FINAL_LOCK.md` §1 already
     established: a pre-existing, separate system, not built against this contract, scheduled for a future
     migration rather than silently duplicated against today.

No new duplicate runtime responsibility was found anywhere in the repository.

---

# 19. Chief Software Architect Review

Reviewing this contract adversarially, as the person who will be blamed if the first real Learning Mode
built against it turns out to need something this document didn't anticipate:

**Every section required by the brief has a definitive, final answer.** Nothing above is a placeholder.

**Real, disclosed residual items — none of them a gap in the contract itself:**

1. **This contract is unproven against a real implementation.** By this sprint's own explicit instruction,
   no concrete Learning Mode exists yet. Every rule above is well-reasoned and grounded in the four real,
   tested layers beneath it, but a design is only fully validated once something real is built against it.
   Recommendation: treat the first Learning Mode's implementation (whichever is authorized next) as this
   contract's real-world test; a small, disclosed amendment to this document after that first real build is
   expected and healthy, not a sign this lock was premature.
2. **The registry-lifecycle decision in §12 (fresh-per-composition-root, no singleton) is a new
   recommendation made in this document, not something LSE-4 itself validated with a real Server Action.**
   It is the architecturally correct default for this platform's serverless deployment model, but should be
   revisited if the first real integration reveals a genuine need for cross-request registry state.
3. **The dead `src/lib/intelligence/` scaffolding (§18) remains in the repository, unreferenced.** It poses
   a real, if low-severity, risk: a future engineer could reasonably mistake it for the intended mode-
   integration layer instead of LSE-4, since nothing marks it as superseded. Recommended for a future,
   separately-scoped cleanup sprint — deletion or an explicit deprecation header — not blocking this lock.
4. **The 9-value closed `LearningModeType` union means a genuinely novel 10th mode requires touching a
   locked file (LSE-1).** This is an accepted, described, additive-only exception (§11, §14), not an
   oversight — named here so it is never mistaken for one.

None of the four items above is an unresolved question this contract fails to answer — each has a clear,
written position. They are the normal, expected residue of locking an architecture before anything has been
built against it, the same category of item the LSE-3 and QSR Final Lock reviews both already disclosed
rather than hid.

**No unresolved architectural risk remains.**

---

**Learning Mode Runtime Contract™ is LOCKED.**

Per the brief: no Quantum Speed Reading™, Memory Mode™, Smart Notes™, Mind Maps™, Flashcards™, MCQs™,
Revision™, Research™, AI Mentor™, Dashboard, or UI implementation follows this document. The next sprint
that builds a real Learning Mode does so against this contract, in full, as the first real test of it.
