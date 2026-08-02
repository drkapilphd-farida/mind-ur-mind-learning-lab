# Real AI Integration™ — Production Handoff (Sprints 35–44)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue Production Sprint 45 (Streaming Runtime
Engine) onward with zero context loss.
**Scope of this document:** Everything built in Sprints 35 through 44. Sprint 45 itself has **not**
been started — see §14 for exact resume instructions.

---

## 1. Overall Project Architecture

This repository (`mind-ur-mind-learning-lab`) is an Enterprise SaaS EdTech platform (Next.js App
Router, TypeScript strict mode, Supabase, Stripe). Full stack conventions are documented in
`CLAUDE.md` and `ENGINEERING_CONSTITUTION.md` at the repo root — read those first for anything not
covered here.

Since Sprint 23, a long-running sub-arc called **"Real AI Integration™"** has been building a fully
**deterministic, provider-agnostic AI execution architecture** under `src/features/`, one sprint at a
time. The defining constraint across the *entire* arc (Sprints 23–44): **no SDKs, no real network
calls, no LLM inference, no real timers/waiting anywhere.** Every "engine" in this arc reacts to
**caller-supplied, deterministic facts** (an outcome, a signal, an elapsed-time number) rather than
measuring or producing them itself. This is the single most important invariant to preserve — see §7.

### High-level pipeline shape (conceptual, not all wired together yet)

```
Personalization + Recommendation + AI Memory   (Sprints 23–30, pre-existing, real, NOT part of 35-44)
        │
        ▼  (ai-mentor-personalization-bridge → ai-mentor-response-composer → ai-mentor-prompt-assembler)
AI Mentor Prompt (MentorPromptPayload)
        │
        ▼
Provider Selection (37)  ──▶  Model Selection (38)
        │
        ▼
Request Execution Pipeline (39)  ──▶  Provider Adapter Layer (36, "Mock Provider Adapter")
        │
        ▼
Response Processing Pipeline (40)
        │
        ▼
Unified Runtime Result
```

`ai-runtime-orchestrator` (Sprint 41) is the **only** feature so far that actually wires the real
upstream Mentor stack together with the Sprint 37–40 chain end-to-end (see §3, Sprint 41).
`ai-execution-session` (42), `execution-policy` (43), and `recovery-engine` (44) are **adjacent,
still-self-contained** pieces that a *future* sprint will presumably wire into that same
orchestrator — they are not wired in yet, and should not be assumed to be.

### The "sprint brief" development loop (how every sprint in this arc has proceeded)

Each sprint arrives as a short, numbered production brief (Context → Do NOT modify existing files →
Objective → Create `src/features/<new-feature>/` → Implement `<10 named responsibilities>` →
Responsibilities → [domain-specific sections] → Validation → Testing → Out of Scope → Verification
Required → "STOP after verification and wait for approval before Sprint N+1"). For each one, the
working method has been:

1. **Research collisions first** — repo-wide `grep` for every exact brief-named type/interface/class
   before writing anything, e.g.:
   ```bash
   grep -rn "export \(type\|interface\|class\|const\) <Name>\b" src --include="*.ts"
   ```
2. **Decide self-contained vs. bridging** — only import another feature's real types/functions if the
   brief *explicitly* says so (e.g. "using the already-approved production features," a named
   Execution Flow list). Otherwise stay 100% self-contained (see §8).
3. **Design in Plan Mode** (`EnterPlanMode` → write a plan file → `ExitPlanMode` for user approval)
   before writing any code — every sprint from 35 onward followed this.
4. **Implement** the new feature folder, strictly matching the established internal file/folder
   conventions (see §5).
5. **Verify**: `npx tsc --noEmit` (zero errors) → feature test suite → full repo test suite (zero
   regressions) → `npm run build` (retry once if the known flaky `reading-discovery` prerender trips)
   → confirm via `git status`/`grep` that only the new feature directory was touched and no
   disallowed cross-feature imports exist.
6. **Report and stop** — never start the next sprint's scope without a new user message.

**Continue this exact loop for Sprint 45 and beyond.**

---

## 2. Current Production Status

- **Sprints 23–34**: pre-existing, approved, locked (built before this handoff's authoring context;
  not modified by Sprints 35–44).
- **Sprints 35–44**: all approved and locked, in order. This document is being generated *mid-arc*,
  immediately after Sprint 44's approval and before any Sprint 45 work has begun.
- **Sprint 45 (Streaming Runtime Engine)**: brief has been received (see the live conversation) but
  **zero files have been created for it**. No research, no plan, no code. Full stop — nothing to
  resume mid-way; Sprint 45 starts fresh.
- **All verification for Sprints 35–44 passed** as of the last check (end of Sprint 44): `npx tsc
  --noEmit` clean, full repo test suite green, `npm run build` green. See §12 for exact numbers per
  sprint and §13 for the very latest full-repo numbers.

---

## 3. Completed Production Sprints (35–44) — One Paragraph Each

### Sprint 35 — Provider Execution Engine (`src/features/provider-execution-engine/`)
Deterministic execution-runtime state machine (session lifecycle, retry/timeout/cancellation
*decision logic*) sitting downstream of Provider Translation (Sprint 31). 9 `ExecutionState` values
(`pending→preparing→ready→executing→completed/cancelled/failed/timeout/retrying`); every non-terminal
state can transition to `cancelled`. Consumes a caller-supplied, ordered `attemptOutcomes:
('success'|'failure'|'timeout')[]` — one outcome per attempt — rather than measuring anything itself.
One real integration point: `integration/buildExecutionRequest.ts` reduces `ProviderRequest` (from
`provider-translation-engine`) into this feature's own self-contained `ExecutionRequest`. Two renamed
collision families: `RetryPolicy`/`TimeoutPolicy`/`CancellationPolicy` → `ExecutionRetryPolicy`/
`ExecutionTimeoutPolicy`/`ExecutionCancellationPolicy` (collision: `ai-provider`); `ExecutionDiagnostics`
→ `ExecutionRuntimeDiagnostics` (collision: `personalization-engine`, and `ProviderExecutionDiagnostics`
was *also* already taken by Sprint 32). **Lesson learned here and repeated as a checklist item ever
since**: a `Clock`/`IdGenerator` pair was scaffolded then found to be dead code (no timestamp field
anywhere in this sprint's domain) and deleted — always check whether `Clock`/`IdGenerator` are
*actually* referenced before keeping them.

### Sprint 36 — Provider Adapter Layer (`src/features/provider-adapter-layer/`)
Deterministic adapter abstraction bridging the Execution Engine to *future* external providers — no
SDKs, no network calls. `DeterministicProviderAdapter` (interface, renamed from brief's
`ProviderAdapter` — collided *twice*, with `ai-provider` and `ai-mentor`) has 6 methods:
`validateRequest → transformExecutionRequest → buildProviderPayload → normalizeProviderResponse →
validateProviderResponse → buildExecutionResult`. One generic `DefaultProviderAdapter` class
(brief-exact name, no collision) driven entirely by injected `ProviderAdapterMetadata` — not 6
near-duplicate classes. `PROVIDER_ADAPTER_DEFINITIONS` catalog covers exactly 6 providers:
`openai | anthropic | gemini | grok | deepseek | local-llm` — **this is the canonical 6-provider
vocabulary every later sprint re-declares independently** (never imported, always re-typed). Registry
duplicate-registration is a validation result, never a throw; Factory throws `ProviderAdapterException`
for an unknown provider id (the one place in this whole arc that throws for a "no such thing exists"
case, matching real `ai-provider` precedent).

### Sprint 37 — Provider Registry & Selection Engine (`src/features/provider-selection-engine/`)
Fully self-contained (brief named no upstream feature to bridge from — first sprint to establish that
"only bridge if explicitly told to" rule). Catalog (`PROVIDER_SELECTION_CATALOG`, deterministic seed
data) + in-memory `ProviderSelectionRegistry` (renamed from brief's `ProviderRegistry`, collided with
`ai-provider`) + two-tier resolution: `DefaultProviderSelectionResolver` (renamed from
`DefaultProviderResolver`, collided with `ai-provider`; strict — capability + model + preferred-id
match) then `FallbackProviderResolver` (brief-exact; relaxed — "give me anything usable"). Its own
`ProviderSelectionRequest` type was deliberately **not** named "ProviderSelectionCriteria" specifically
to dodge a third, non-brief-mandated collision with `ai-provider`. `ProviderSelectionEngine.select()`
never throws — an unresolvable request is `resolutionPath: 'none'` data.

### Sprint 38 — Model Registry & Model Selection Engine (`src/features/model-selection-engine/`)
Structural sibling of Sprint 37, one level down (model instead of provider). **Zero naming
collisions** this time. `ModelMetadata` (descriptive model facts) nested inside registry-level
`ModelCatalogEntry` (priority/availability/configuration) — mirrors Sprint 36's "Adapter Metadata"
precedent rather than Sprint 37's flatter shape. `DefaultModelResolver`/`FallbackModelResolver` both
scope candidates to the request's own `providerId` first — this sprint picks a model *for* an
already-chosen provider, it never switches providers. 6 validation concerns map 1:1 to the brief's own
6 bullets (more granular than Sprint 37's 2, because the brief itself enumerated 6 distinct concerns).

### Sprint 39 — Request Execution Pipeline (`src/features/request-execution-pipeline/`)
Self-contained (no explicit bridge requested). Assembles/validates/normalizes the outbound AI request:
`ExecutionRequestBuilder` (pure, non-validating assembler) → `RequestValidator` (single validator,
checks the *fully-assembled* `RequestEnvelope`, 7 issue types) → `RequestNormalizer` (only runs when
valid — trims prompt whitespace). **First sprint since 35 with a genuine, load-bearing need for
`Clock`/`IdGenerator`** (envelope `id`, metadata `generatedAt`) — own `contracts/`/`adapters/`, careful
this time not to store unused dependencies on the pipeline class itself (the lesson from Sprint 35 was
applied proactively).

### Sprint 40 — Response Processing Pipeline (`src/features/response-processing-pipeline/`)
Mirror-image inbound counterpart to Sprint 39. **Key design deviation, explicitly justified**: unlike
Sprint 39 (validates the assembled envelope), `ResponseValidator` here validates the **raw** payload
*before* extraction — because several checks (`missing-usage`, `provider-error-payload`,
`unsupported-finish-reason`) become ambiguous once extractors backfill defaults (a defaulted
`{0,0,0}` usage would be indistinguishable from a real zero-token response). `FinishReasonResolver` is
injected into `ResponseValidator` so "is this raw value supported" isn't duplicated logic. 4 renames
to dodge collisions: `PipelineResult`→`ResponseProcessingResult` (collided with **this arc's own**
Sprint 39 type — the first intra-arc collision); `RawProviderResponse`/`ResponseValidationIssue`/
`ResponseValidationResult` → `RawResponsePayload`/`ResponseProcessingValidationIssue`/
`ResponseProcessingValidation` (collided with the *pre-existing*, unrelated `provider-response-pipeline`,
Sprint 33).

### Sprint 41 — End-to-End AI Runtime Orchestrator (`src/features/ai-runtime-orchestrator/`)
**The one sprint since 36 that genuinely coordinates multiple already-existing features** — the brief
explicitly said "using the already-approved production features" and gave a 9-step numbered Execution
Flow (Personalization → Recommendation → AI Mentor → Provider Selection → Model Selection → Request
Execution Pipeline → Mock Provider Adapter → Response Processing Pipeline → Unified Runtime Result).
Researched and replicated the **exact** 3-call sequence `ai-orchestration-pipeline` (Sprint 34) already
uses for Personalization/Recommendation/AI Mentor (`createMentorContextOrchestrationService()` →
`createMentorResponseOrchestrationService()` → `createMentorPromptOrchestrationService()`), then
branched into the *new* Sprint 37–40 chain instead of Sprint 34's own old Sprint 31–33 chain.
**User was explicitly asked and confirmed**: "Mock Provider Adapter" = Sprint 36's
`provider-adapter-layer` (`DefaultProviderAdapter`), **not** the real, pre-existing
`ai-provider/adapter/MockProviderAdapter.ts` (Sprint 5, async, tied to the real `AIProvider`
ecosystem). **Two-exception import discipline established here, directly inherited from Sprint 34's
own documented precedent**:
- `integration/RuntimeOrchestrationInputs.ts` (+ `testFixtures.ts`) — the *only* place importing real
  cross-feature **types** (`PersonalizationProfile`/`PersonalizationExecutionPlan`/
  `PersonalizationRecommendationSet`/`PersonalizationAdaptation` from `personalization-engine`,
  `MemoryContext` from `ai-memory-engine`).
- `coordination/DefaultRuntimeCoordinator.ts` — the *only* file permitted to import other features'
  factory **functions** directly (8 of them — see §7 for the full list). This is "business logic, not
  a violation of the integration-confinement rule," per Sprint 34's own header comment, quoted
  verbatim in this feature's own `index.ts`.

One collision: brief's `RuntimeResult` → `AIRuntimeResult` (collided with an unrelated
`src/hooks/exercise-engine/useUniversalExerciseRuntime.ts` hook — nothing to do with this arc). Both
provider/model registries are seeded **once**, at coordinator construction, from the real
`ALL_CATALOG_ENTRIES`/`ALL_MODEL_CATALOG_ENTRIES` — never rebuilt per run.

### Sprint 42 — AI Execution Session Engine (`src/features/ai-execution-session/`)
Self-contained (brief never said "using the already-approved production features" — only a regression
clause about not modifying existing session code). Manages one session's lifecycle as its own entity,
independent of whatever performs the execution: `SessionExecutionOutcome` (caller-supplied,
deterministic) plays the same "the caller supplies the outcome" role as Sprint 35's
`attemptOutcomes`. 7 `SessionState` values (`created→initialized→running→waiting-for-response→
completed/failed/cancelled`); cancellation reachable from any non-terminal state; a
`cancellationRequested` flag is checked *early* and short-circuits, never a mid-run pause. One
collision: brief's `SessionContext` → `AIExecutionSessionContext` (collided with unrelated
`memory-session-context/domain/SessionContext.ts`). **A design correction made mid-implementation**:
the in-memory `AIExecutionSessionManager` only ever stored the session's initial `'created'` snapshot
(since registration happens before any state advances) — added a minimal `update()` method so the
registry actually reflects the session's true final state. `SessionFailureHandler` is reserved
strictly for genuine *validation* rejections; a legitimate business failure or cancellation the caller
reports is built inline instead (not routed through the failure handler), since nothing about a real
failure/cancellation is actually invalid.

### Sprint 43 — Execution Policy Engine (`src/features/execution-policy/`)
Self-contained. Decides Execute/Retry/Cancel/Reject/Fallback given eligibility facts — deliberately a
different, *flatter* concept from Sprint 44's own richer strategy set (no shared types between the
two). Two collision groups, both closely related in *concept*, not just name: brief's `ExecutionPolicy`
(a behavioral interface, paired with `DefaultExecutionPolicy`) → `ExecutionPolicyEngine`/
`DefaultExecutionPolicyEngine` (collided with `provider-execution-engine`'s own **plain-data**
`ExecutionPolicy` bundle, Sprint 35 — a different kind of thing with the same name); brief's
`RetryPolicy`/`TimeoutPolicy`/`CancellationPolicy`/`FallbackPolicy` → `RetryEligibilityPolicy`/
`TimeoutResolutionPolicy`/`CancellationEligibilityPolicy`/`FallbackEligibilityPolicy` (the *first*
rename, `ExecutionRetryPolicy`, was already taken by **Sprint 35 itself** — had to find a *second*
disambiguator, pulled from the brief's own "eligibility"/"resolution" language). `ExecutionPolicyResolver`
validates a raw `ExecutionPolicyConfig` and only constructs the engine if valid (mirrors Sprint 36's
factory precedent). "Provider eligibility"/"execution limits"/"safety constraints" fold into one plain
`ExecutionConstraints` bundle rather than 3 more named types (the brief lists them only as decision
*inputs*, no dedicated type names given).

### Sprint 44 — Recovery & Retry Engine (`src/features/recovery-engine/`)
Self-contained (the brief's "do not modify existing orchestration/.../execution-session code" is a
regression clause, **not** an integration mandate — explicitly reasoned through and documented in this
feature's own header, contrasting Sprint 41's genuinely different, explicit bridging language). **Zero
naming collisions anywhere** — first sprint since 37 with a completely clean grep. A richer, more
specialized cousin of Sprint 43: `FailureClassifier` maps a caller-supplied `FailureSignal` to one of 6
`FailureCategory` values (`timeout|transient-provider-failure|rate-limit|provider-unavailable|
retry-exhaustion|unknown`); `RetryDecisionResolver` maps `(category, RecoveryContext)` to one of 5
named `RecoveryStrategy` values with **genuinely different logic per category** (rate-limit/
provider-unavailable skip straight to an alternate provider — retrying the same one is pointless;
timeout/transient prefer same-provider retry first). `computeBackoffDelay` supports 4 strategies
(immediate/fixed/linear/exponential, capped at `maxDelayMs`) — returns *what delay would apply*, never
waits. `RetryExecutor` never performs a real retry — reports a caller-supplied `RetryOutcome`; an
`abort-execution` plan is never "executed."

---

## 4. Every Important Implementation Decision (Cross-Cutting, Not Sprint-Specific)

1. **Plan Mode is mandatory for every new sprint** — `EnterPlanMode`, write/overwrite the single plan
   file at `/Users/drkapildevsharma/.claude/plans/functional-sleeping-lovelace.md`, then
   `ExitPlanMode` for explicit user approval, *before* any file is written. This plan file gets
   **overwritten** each sprint (it is not a running log — this handoff document is the running log).
2. **Naming-collision resolution is always repo-wide-grep-first, design-second.** Never assume a
   brief-named type is free; never assume it collides either — check.
3. **Rename only what actually collides**, with one nuance: if a brief-named type is one of several
   *tightly-nested sibling fields under one parent bundle* (e.g. Sprint 35's `RetryPolicy`/
   `TimeoutPolicy`/`CancellationPolicy` all living inside one `ExecutionPolicy`), and one sibling
   collides, rename **all** siblings together for family consistency — even the ones that didn't
   individually collide. If siblings are only *loosely* related (e.g. Sprint 36's `ProviderAdapter`
   family), rename only the one that actually collides.
4. **Prefer pulling the disambiguating rename from the brief's own prose language** over inventing an
   arbitrary prefix — e.g. `ExecutionRuntimeDiagnostics` from "complete the Execution Runtime of your
   AI architecture"; `RetryEligibilityPolicy`/`TimeoutResolutionPolicy` from "retry eligibility"/
   "timeout resolution."
5. **Self-contained by default; bridge only when the brief is explicit.** The bar for "explicit" is
   high: either the literal phrase "using the already-approved production features" (Sprint 41), or a
   named, numbered Execution Flow listing specific existing features to call. A brief merely
   *thematically overlapping* with a previous sprint (Sprint 43 vs. 35; Sprint 44 vs. 43) is **not**
   sufficient grounds to bridge — build fresh, self-contained types every time unless told otherwise.
6. **"The caller supplies the outcome, this engine only reacts."** No sprint in this arc ever measures
   real elapsed time, waits on a real timer, or calls a real network endpoint. Every "did it succeed,"
   "how long did it take," "was it cancelled" fact is a plain, deterministic field on some caller-built
   input object.
7. **Registries store data; resolvers/engines decide.** Whenever a sprint has both a "registry" concept
   and a "selection/decision" concept (Sprints 37, 38, 42), the registry only ever does
   register/get/list/duplicate-check — all actual decision logic (which one to pick, is this
   transition legal) lives in a separate resolver/engine class.
8. **Validation results over exceptions, for recoverable rejections; exceptions only for "this
   literally doesn't exist."** A duplicate registration, an invalid config, a malformed request — all
   return a `{valid: false, issues: [...]}`-shaped result, never throw. The one recurring exception
   pattern is a Factory told to construct something for an unrecognized id (Sprint 36's
   `ProviderAdapterException`) — genuinely "no such thing exists," not a recoverable business outcome.
9. **Engines/orchestrators never throw at their own top-level public entrypoint** (`.select()`,
   `.decide()`, `.run()`, `.process()`, `.planRecovery()`, etc.) — a malformed/unresolvable input is
   always representable as failure *data* in the return type, never an unhandled exception bubbling to
   the caller. Internal helper functions may still throw (e.g. `IllegalXTransitionError` from a state
   machine's `.transition()` method) — those get caught defensively one layer up, inside the
   orchestrating class, and converted into the same failure-data shape.
10. **`Clock`/`IdGenerator` only when genuinely load-bearing** — check every domain type for an actual
    timestamp/generated-id field before scaffolding `contracts/`/`adapters/`. Sprint 35 scaffolded then
    deleted them (a caught mistake mid-sprint); every sprint since has checked this proactively before
    ever creating the files.
11. **Every feature is a complete, standalone vertical slice** — its own `types/`, its own
    `testFixtures.ts` (never importing another feature's fixtures, even when re-fixturing the exact
    same external shape — see Sprint 41's replication of `ai-orchestration-pipeline`'s own
    `makePersonalizationProfile`-style builders verbatim, independently, inside its own
    `testFixtures.ts`), its own barrel `index.ts` with a substantial header comment documenting every
    rename/collision/design decision for that sprint.
12. **6-provider vocabulary is now canonical across the arc**: `'openai' | 'anthropic' | 'gemini' |
    'grok' | 'deepseek' | 'local-llm'` — established in Sprint 36, independently re-declared (never
    imported) in Sprints 37, 38, 39 (as plain `string`), 40, 41 (via the real, existing
    `provider-selection-engine`/`model-selection-engine` calls). Any new sprint dealing with "a
    provider" should use this same 6-value set unless the brief says otherwise.
13. **A "co-occurring but distinct validation checks" pattern** used repeatedly: e.g. Sprint 39's
    `invalid-prompt` (user prompt blank) vs. `empty-payload` (both prompts blank) — the stronger
    condition is allowed to also trigger the weaker one; this is treated as correct, not redundant.

---

## 5. All New Directories and Files Created (Sprints 35–44)

All ten features live directly under `src/features/`, no nesting. Every one of them follows this same
internal skeleton (folder names vary by sprint's own domain vocabulary, but the *shape* is identical):

```
src/features/<feature-name>/
  types/                    — self-contained domain types + index.ts (barrel)
  <domain-folder-1>/        — e.g. lifecycle/, stateMachine/, retryEligibility/, failureClassification/
    <PureFunctionOrClass>.ts
    <PureFunctionOrClass>.test.ts   (co-located, same folder)
    index.ts
  <domain-folder-2>/ ... (repeat per responsibility)
  validation/                — one pure validator function per brief-named validation concern
  diagnostics/                — one pure generateXDiagnostics() function
  [engine|orchestration|coordination|resolver]/ — the top-level interface + Default<X> class + factory
  [contracts/ + adapters/]   — ONLY when Clock/IdGenerator are genuinely used (see §4.10)
  [integration/]             — ONLY when a real cross-feature type import is explicitly required
  testFixtures.ts             — root-level, NOT inside types/
  index.ts                    — root barrel + substantial header comment
```

### Full directory list (10 features, ~490 files total)

| # | Sprint | Directory | File count |
|---|--------|-----------|------------|
| 35 | Provider Execution Engine | `src/features/provider-execution-engine/` | 55 |
| 36 | Provider Adapter Layer | `src/features/provider-adapter-layer/` | 50 |
| 37 | Provider Registry & Selection Engine | `src/features/provider-selection-engine/` | 44 |
| 38 | Model Registry & Model Selection Engine | `src/features/model-selection-engine/` | 48 |
| 39 | Request Execution Pipeline | `src/features/request-execution-pipeline/` | 47 |
| 40 | Response Processing Pipeline | `src/features/response-processing-pipeline/` | 47 |
| 41 | End-to-End AI Runtime Orchestrator | `src/features/ai-runtime-orchestrator/` | 45 |
| 42 | AI Execution Session Engine | `src/features/ai-execution-session/` | 49 |
| 43 | Execution Policy Engine | `src/features/execution-policy/` | 53 |
| 44 | Recovery & Retry Engine | `src/features/recovery-engine/` | 50 |

**None of these directories exist in git history yet** — they are all untracked (`??` in `git
status`), exactly like every other pre-existing feature folder in this repo (nothing in this whole
arc, or in the rest of `src/features/`, has ever been committed during this session — see §13). This
is expected and matches the state of the rest of the repo.

For the exact file tree of any one feature, run:
```bash
find src/features/<feature-name> -type f | sort
```

---

## 6. All Contracts / Interfaces (the "public API surface" of each sprint)

Every interface below lives in its feature's own root `index.ts` barrel (re-exported from a subfolder).
Only the **behavioral** interfaces are listed (plain data types are covered by §3's per-sprint
summaries and are fully enumerated inside each feature's own `types/index.ts`).

**Sprint 35 — `provider-execution-engine`**: `ProviderExecutionEngineService { generate(inputs): ExecutionEngineResult }`, impl `DefaultProviderExecutionEngine`, factory `createProviderExecutionEngine(overrides?)`.

**Sprint 36 — `provider-adapter-layer`**: `DeterministicProviderAdapter { validateRequest, transformExecutionRequest, buildProviderPayload, normalizeProviderResponse, validateProviderResponse, buildExecutionResult }`, impl `DefaultProviderAdapter`; `ProviderAdapterFactory { create(providerId: string) }`, impl `DefaultProviderAdapterFactory`, factory `createProviderAdapterFactory()`; `ProviderAdapterRegistry { register, get, list }`; `ProviderAdapterResolver { resolve, resolveByCapability }`.

**Sprint 37 — `provider-selection-engine`**: `ProviderSelectionRegistry { register, get, list }`; `ProviderPriorityResolver { order }`; `ProviderCapabilityResolver { filterByCapability }`; `ProviderSelectionResolver { resolve(candidates, request) }` — implemented by both `DefaultProviderSelectionResolver` (strict) and `FallbackProviderResolver` (relaxed); `ProviderSelectionEngine { select(request): ProviderSelectionOutcome }`, impl `DefaultProviderSelectionEngine`, factory `createProviderSelectionEngine(registry, defaultResolver, fallbackResolver)`.

**Sprint 38 — `model-selection-engine`**: mirrors Sprint 37 exactly, with `ModelRegistry` (adds `listByProvider`), `ModelPriorityResolver`, `ModelCapabilityResolver`, `ModelSelectionResolver` (implemented by `DefaultModelResolver`/`FallbackModelResolver`), `ModelSelectionEngine { select(request): ModelSelectionOutcome }`.

**Sprint 39 — `request-execution-pipeline`**: `ExecutionContextResolver { resolve(inputs): RequestContext }`; `RequestMetadataAssembler { assemble(context): RequestMetadata }`; `RequestValidator { validate(envelope): RequestValidationResult }`; `RequestNormalizer { normalize(envelope): RequestEnvelope }`; `ExecutionRequestBuilder { build(inputs): RequestEnvelope }`; `RequestExecutionPipeline { execute(inputs): PipelineResult }`, impl `DefaultRequestExecutionPipeline`, factory `createRequestExecutionPipeline(overrides?)`.

**Sprint 40 — `response-processing-pipeline`**: `FinishReasonResolver { resolve(raw): FinishReason }`; `ResponseMetadataExtractor { extract(raw): ResponseMetadata }`; `UsageExtractor { extract(raw): ResponseUsage }`; `ErrorResponseMapper { map(raw): MappedError | null }`; `ResponseValidator { validate(raw: RawResponsePayload): ResponseProcessingValidation }`; `ResponseNormalizer { normalize(envelope): ResponseEnvelope }`; `ResponseProcessingPipeline { process(raw): ResponseProcessingResult }`, impl `DefaultResponseProcessingPipeline`, factory `createResponseProcessingPipeline(overrides?)`.

**Sprint 41 — `ai-runtime-orchestrator`**: `RuntimeLifecycleManager { transition(from, to): RuntimeState }`; `RuntimeFailureHandler { handle(inputs): AIRuntimeResult }`; `RuntimeCoordinator { coordinate(inputs: RuntimeOrchestrationInputs): AIRuntimeResult }`, impl `DefaultRuntimeCoordinator` (the one file with the 8-factory import exception, see §7); `AIRuntimeOrchestrator { run(inputs): AIRuntimeResult }`, impl `DefaultAIRuntimeOrchestrator`, factory `createAIRuntimeOrchestrator(overrides?)`.

**Sprint 42 — `ai-execution-session`**: `SessionStateMachine { transition(from, to): SessionState }`; `AIExecutionSessionManager { register, update, get, list }`; `SessionFailureHandler { handle(inputs): SessionRunResult }`; `SessionLifecycleCoordinator { run(inputs: SessionRunInputs): SessionRunResult }`, impl `DefaultSessionLifecycleCoordinator`, factory `createSessionLifecycleCoordinator(overrides?)`.

**Sprint 43 — `execution-policy`**: `ExecutionPolicyEngine { decide(request): ExecutionDecision }` (renamed from brief's "ExecutionPolicy"), impl `DefaultExecutionPolicyEngine`, factory `createExecutionPolicyEngine(config)`; `ExecutionPolicyResolver { resolve(config): ExecutionPolicyResolution }`, impl `DefaultExecutionPolicyResolver`, factory `createExecutionPolicyResolver()`.

**Sprint 44 — `recovery-engine`**: `FailureClassifier { classify(signal): FailureCategory }`; `RetryDecisionResolver { resolve(category, context): RecoveryStrategyType }`; `RecoveryEngine { planRecovery(signal, context): RecoveryPlan }`, impl `DefaultRecoveryEngine`, factory `createRecoveryEngine(backoffPolicy, overrides?)`; `RetryExecutor { execute(plan, outcome): RetryExecutionResult }`, impl `DefaultRetryExecutor`, factory `createRetryExecutor()`.

**Every `create*` factory follows the same shape**: zero-or-one required config args, then an optional
`overrides: Partial<Dependencies> = {}` object that gets spread over `createDefaultDependencies()` —
this is how every test suite substitutes stub collaborators (see §10).

---

## 7. All Production Rules That Must Never Be Violated

1. **Never modify any file outside the new sprint's own feature folder.** Every sprint brief says this
   explicitly; it has been honored with zero exceptions across Sprints 35–44 (verified via `git
   status` after every sprint — only the new `src/features/<name>/` directory ever shows as new).
2. **No SDKs, no real API calls, no network requests, no streaming, no token counting, no billing, no
   embeddings, no vector database, no UI, no background jobs/workers, no conversation/session
   persistence to a real datastore** — anywhere in this whole arc, not just per-sprint "Out of Scope"
   lists. These have been consistent across every single brief from 35–44 and should be assumed to
   continue.
3. **No real timers, no real waiting, no real measurement of elapsed time.** Every "did this time out,"
   "how long did it take," "what's the backoff delay" fact is either a caller-supplied deterministic
   input or a pure computation of *what would happen*, never something actually measured or awaited.
4. **`console.log` is banned in production code** (per root `CLAUDE.md`) — use a structured logger if
   logging is ever needed (it hasn't been, in this arc).
5. **No `any` in TypeScript** anywhere (strict mode, all flags enabled) — every file in Sprints 35–44
   passes `npx tsc --noEmit` with zero errors and zero `any`.
6. **Every mutation-style operation returns a new value; nothing is mutated in place.** All domain
   types are `readonly` on every field. State machines, event logs, registries — every "advance" or
   "append" operation produces a brand-new object.
7. **Cross-feature imports are always confined to the smallest possible surface** (see §8) — never
   scattered across a feature's `types/`, `validation/`, `diagnostics/`, or any pure-decision folder.
8. **Never start the next sprint's scope without an explicit new user instruction.** Every sprint in
   this arc has ended with "stop for approval before Sprint N+1" — respected literally every time.
9. **Plan Mode before code, every sprint** — even when a sprint looks like a near-duplicate of a
   previous one (Sprints 43 vs. 44), a fresh Plan Mode pass with fresh collision research is required;
   never reuse a prior sprint's plan verbatim.
10. **When genuinely unsure about a brief's intent on something consequential** (not a matter of
    convention, but a real fork in what gets built), **ask the user** via `AskUserQuestion` rather than
    guessing — this happened exactly once, in Sprint 41, over the "Mock Provider Adapter" ambiguity
    (two real, architecturally-different candidates existed in the codebase).

---

## 8. Import Restrictions (Exact, Per-Sprint)

**Default rule for every sprint in this arc: zero cross-feature imports.** The only two sprints with
any cross-feature import at all are 35, 36, and 41 (as *real* production-code imports) plus one
type-only import each in 35/36:

| Sprint | Imports from | Confined to | Reason |
|---|---|---|---|
| 35 | `@/features/provider-translation-engine` (`ProviderRequest` type only) | `integration/buildExecutionRequest.ts` | Brief's own Execution Flow diagram named this upstream feature explicitly. |
| 36 | *(none — fully self-contained; brief never named an upstream feature)* | — | — |
| 37 | *(none)* | — | Brief named no upstream feature. |
| 38 | *(none)* | — | Brief named no upstream feature. |
| 39 | *(none)* | — | Brief named no upstream feature. |
| 40 | *(none)* | — | Brief named no upstream feature. |
| 41 | **(a)** `@/features/personalization-engine` (types only: `PersonalizationProfile`, `PersonalizationExecutionPlan`, `PersonalizationRecommendationSet`, `PersonalizationAdaptation`), `@/features/ai-memory-engine` (type only: `MemoryContext`) | `integration/RuntimeOrchestrationInputs.ts` + `testFixtures.ts` | Brief explicitly said "using the already-approved production features" with a named Execution Flow. |
| 41 | **(b)** `@/features/ai-mentor-personalization-bridge`, `@/features/ai-mentor-response-composer`, `@/features/ai-mentor-prompt-assembler`, `@/features/provider-selection-engine`, `@/features/model-selection-engine`, `@/features/request-execution-pipeline`, `@/features/provider-adapter-layer`, `@/features/response-processing-pipeline` — **8 factory functions imported directly** | `coordination/DefaultRuntimeCoordinator.ts` **only** | The one file in the whole arc permitted to import other features' *factory functions* directly — "coordinating existing components is this sprint's entire purpose," per Sprint 34's own documented precedent, quoted in this feature's `index.ts`. |
| 42 | *(none)* | — | Brief never said "using the already-approved production features." |
| 43 | *(none)* | — | Same reasoning as 42. |
| 44 | *(none)* | — | Brief's "do not modify existing ... code" is a regression clause, not a bridging instruction — reasoned through explicitly. |

**The rule to apply going forward (Sprint 45+)**: default to zero cross-feature imports. Only import
from another feature if the new brief contains language equivalent to Sprint 41's ("using the
already-approved production features," a named/numbered Execution Flow of existing features to call).
A brief that merely *overlaps thematically* with a previous sprint, or says "do not modify existing
X/Y/Z code," is **not** sufficient grounds — that is a regression-safety clause, not a bridging
instruction; treat it as such.

**Verification command used every sprint** (adapt the feature-name list per sprint):
```bash
grep -rEn "^import .* from ['\"]@/features/" src/features/<new-feature> \
  | grep -v "/integration/" | grep -v "testFixtures.ts"
```
Should return nothing for any self-contained sprint (37, 38, 39, 40, 42, 43, 44). For 35/36/41, only
the specific documented exceptions above should appear.

---

## 9. Validation Strategy

**Universal shape, used in every single sprint without exception:**

```ts
type XValidationIssueType = 'specific-kebab-case-concern' | ...  // one literal per brief-named concern
type XValidationIssue = { readonly type: XValidationIssueType; readonly detail: string }
type XValidation = { readonly valid: boolean; readonly issues: readonly XValidationIssue[] }
```

- **One pure validator function per brief-named validation bullet, in most sprints** (e.g. Sprint 38
  had 6 separate `validate*` functions for 6 brief bullets; Sprint 43/44 had 7-8 separate functions).
  A few sprints **consolidated multiple concerns into one function operating on one object** when that
  was more natural (e.g. Sprint 39's single `validateRequestEnvelope` checking all 7 concerns against
  one assembled object) — the deciding factor is whether the brief's bullets naturally cluster around
  one object (consolidate) or are genuinely independent facts (separate functions).
- **Multiple issues can and do co-occur in one validation pass** — a validator never short-circuits
  after finding the first issue; it collects every applicable issue into the `issues` array. This is
  deliberate (see §4.13) and tested explicitly (e.g. Sprint 39's test asserting both `invalid-prompt`
  and `empty-payload` fire together for a fully-blank payload).
- **Validators are always pure functions**, never classes, never requiring DI — with exactly one
  documented exception: Sprint 40's `DefaultResponseValidator` is a class because it needs an injected
  `FinishReasonResolver` to avoid duplicating the "is this raw value known" logic.
- **Two validation layers exist in sprints with both a "config/policy" object and a "per-request"
  object** (43, 44): config-level validators run once (at resolve/construct time — reject before any
  decision is made), while per-request/per-decision validators run on every call. Sprint 43's
  `ExecutionPolicyResolver` runs 6 of its 8 validators at config-resolution time; the remaining 2 run
  inside the engine's own `decide()`/`planRecovery()` call.
- **A validation failure is always representable as data on the return type**, never a thrown
  exception at the top-level entrypoint (see §4.9).

---

## 10. Testing Strategy

- **Test runner**: Vitest (`npx vitest run <path>`), tests co-located with source
  (`<Name>.test.ts` next to `<Name>.ts`, or one `<domain>.test.ts` per small folder).
- **`testFixtures.ts` lives at the feature's own root** (not inside `types/`), exports one
  `make<TypeName>(overrides: Partial<T> = {}): T` builder per domain type, **with defaults that
  already pass every validator** — so any individual test only needs to override the one field it's
  actually exercising. This file is explicitly excluded from vitest's test-file glob (it has no
  `.test.ts` suffix) but is still importable by every real `.test.ts` file in the feature.
- **`makeFixedClock(fixedNow?)` / `makeSequentialIdGenerator(prefix?)`** are the standard fixture
  builders whenever a feature genuinely has `Clock`/`IdGenerator` (Sprint 39, and previously in the
  pre-existing `provider-translation-engine`) — used to make otherwise-nondeterministic output
  (timestamps, generated ids) fully deterministic in tests.
- **Every brief-named "Testing" bullet gets at least one `describe`/`it` block whose title literally
  names that bullet** (e.g. `it('Duplicate Provider: rejects a second registration ...')`), making
  brief-to-test traceability trivial to audit.
- **Determinism is always explicitly tested** — two independently-constructed instances (two
  `create*()` calls) given the exact same input must produce `toEqual` (not just `toBe`) identical
  output. This appears in every single sprint's top-level engine/orchestrator test file.
- **DI-via-overrides is the standard mechanism for forcing edge cases** — e.g. Sprint 41's coordination
  tests inject a stub `ProviderSelectionEngine` that always returns `resolutionPath: 'none'` to force
  the otherwise-unreachable `missing-provider` failure path (the real, self-seeded catalog always has
  a usable fallback, so that path can't be forced through real data alone). Sprint 42 similarly injects
  a stub `SessionStateMachine` that always throws, to test the defensive `invalid-transition` catch.
  **This is the standard technique — expect to need it again in Sprint 45** for streaming-specific
  edge cases that can't be forced through "normal" chunk sequences alone.
- **Full verification order, every sprint, no exceptions**:
  1. `npx tsc --noEmit` (whole repo)
  2. `npx vitest run src/features/<new-feature>` (new feature only)
  3. `npx vitest run` (whole repo — zero regressions)
  4. `npm run build` (whole repo — retry once if the known `reading-discovery` prerender flake trips;
     see §11)
  5. Grep-based import-confinement check (§8)
  6. `git status` scope check (only the new feature directory should appear as untracked/new)

---

## 11. Build Verification Status

- **`npx tsc --noEmit`**: clean (zero errors) as of the end of Sprint 44, across the *entire* repo, not
  just the new features.
- **`npm run build`** (`next build`): green as of the end of every sprint 35–44. **One known, harmless,
  pre-existing flake, unrelated to this arc**: the `/discover-learning-potential/reading` page
  occasionally fails to prerender with `Error: Reading Discovery sentence dataset returned no usable
  sentence+meaning pair.` This is a pre-existing issue in the unrelated `reading-discovery` feature (not
  part of Sprints 35–44) — it has appeared and been retried successfully (one retry always fixes it)
  in roughly half of the sprints in this arc. **Do not attempt to fix this** — it is explicitly
  out of scope and orthogonal to this arc's work; just retry the build once if it appears.
- **One other build-time issue pattern seen twice** (Sprints 39/41 area): ESLint's
  `@typescript-eslint/no-unused-vars`/`prefer-const`/`explicit-function-return-type` rules occasionally
  flag something `tsc --noEmit` doesn't catch (e.g. a `let` that's never reassigned, or a test helper
  missing an explicit return type). `npm run build` runs ESLint as part of its type-check step and
  will fail on these even though `tsc --noEmit` alone passed — **always run the full `npm run build`,
  don't rely on `tsc --noEmit` alone as a proxy for build health.**

---

## 12. Known Limitations

1. **Sprint 41's `ai-runtime-orchestrator` is the only end-to-end wiring that exists.** It uses Sprint
   35 (via) → 37 → 38 → 39 → 36 → 40. Sprints 42 (session), 43 (execution policy), 44 (recovery) are
   **not** wired into it or into each other. If a future sprint is asked to "wire recovery into the
   runtime orchestrator" or similar, that is new, additive integration work — nothing currently calls
   `recovery-engine`, `execution-policy`, or `ai-execution-session` from anywhere outside their own
   test suites.
2. **Every "outcome"/"signal" in this whole arc is synthetic/caller-supplied.** There is no real
   provider call anywhere in Sprints 35–44 (by design) — meaning none of this has been validated
   against real provider behavior. That is explicitly out of scope for this entire arc, not an
   oversight.
3. **The 6-provider catalog (`openai/anthropic/gemini/grok/deepseek/local-llm`) is duplicated
   independently across at least 4 feature folders** (36, 37, 38, and re-declared as plain strings in
   39/40). This is a deliberate self-containment choice (§4.12), not an accident — but it does mean a
   7th provider added in a future sprint would need to be added to each catalog independently, with no
   single source of truth.
4. **`ai-runtime-orchestrator`'s provider/model registries are rebuilt once per `DefaultRuntimeCoordinator`
   construction, not once globally** — every new `createRuntimeCoordinator()` call reseeds both
   catalogs from scratch. This is fine for the current test-only usage but would be worth revisiting
   if this ever becomes a long-lived server-side singleton.
5. **No real logging/observability wiring anywhere** — `RecoveryDiagnostics`/`SessionDiagnostics`/etc.
   are pure data structures returned to the caller, never written anywhere. Wiring these into the
   platform's actual structured-logger (per root `CLAUDE.md`'s "no console.log, use structured logger"
   rule) has not been attempted in this arc and is not implied to be needed yet.
6. **The plan file at `~/.claude/plans/functional-sleeping-lovelace.md` is overwritten every sprint** —
   it does not contain a history of prior sprints' plans. This handoff document is the only durable
   record of the reasoning behind Sprints 35–44; if it's ever lost, the only recovery path is reading
   each feature's own `index.ts` header comment (which is intentionally thorough) plus this document.

---

## 13. Exact Current State of the Repository

- **Branch**: `main`.
- **Last real commit**: `bc7ae4f "Before switching Claude account"` — **none of Sprints 35–44's work has
  been committed**. Every file created in this arc is untracked (`??` in `git status --porcelain`).
- **Full repo test suite** (as of the end of Sprint 44): **444 test files, 3024 tests, all passing.**
- **`npx tsc --noEmit`**: zero errors, whole repo.
- **`npm run build`**: succeeds (see §11 for the one known flaky retry case).
- **Tracked-but-modified files** (pre-existing changes from *before* this session/arc began — **not**
  touched by Sprints 35–44, do not attribute these to this arc):
  ```
  .env.example, docs/DESIGN_SYSTEM.md, package-lock.json, package.json, src/app/globals.css,
  src/app/labs/quantum-speed-reading/fixation-reduction/page.tsx,
  src/app/labs/quantum-speed-reading/page.tsx, src/app/layout.tsx, src/components/AdminShell.tsx,
  src/components/exercise-engine/{ChoiceGrid,ExerciseCountdown,FlashStimulus,RuntimeResultScreen,
  SessionProgress,UniversalExercisePlayer}.tsx, src/components/exercises/exerciseStyles.ts,
  src/components/ui/button.tsx, src/features/chunk-reading/{chunkDataset.ts,chunkEngine.ts,
  components/ChunkReadingExperience.tsx,definitions/chunkReadingDefinition.ts},
  src/features/quantum-speed-reading/components/{EyeStretchExperience,EyeWarmupExperience,
  FixationReductionExperience}.tsx, src/features/rapid-visual-intelligence/components/
  FlashImagesExperience.tsx, src/hooks/exercise-engine/useUniversalExerciseRuntime.ts,
  src/lib/exercise-engine/{datasetEngine.ts,datasetValidator.ts,randomizationEngine.ts},
  src/lib/exercises/actions/savePracticeSession.ts, src/lib/exercises/queries/{getExerciseAccess.ts,
  getModuleProgress.ts}, src/lib/exercises/types.ts, src/lib/supabase/types.ts, src/middleware.ts,
  src/types/exercise-engine/index.ts, supabase/.temp/cli-latest
  ```
- **Untracked (new) directories relevant to this arc** (everything else untracked in the repo is
  pre-existing scaffolding from before Sprint 23, unrelated to 35–44):
  ```
  src/features/provider-execution-engine/
  src/features/provider-adapter-layer/
  src/features/provider-selection-engine/
  src/features/model-selection-engine/
  src/features/request-execution-pipeline/
  src/features/response-processing-pipeline/
  src/features/ai-runtime-orchestrator/
  src/features/ai-execution-session/
  src/features/execution-policy/
  src/features/recovery-engine/
  ```
  Plus, this document itself: `docs/PRODUCTION_HANDOFF_SPRINT_35-44.md` (new, untracked).
- **Node/npm**: `v24.18.0` / `11.16.0`. Build script: `next build`. No custom `test`/`typecheck` npm
  scripts defined in `package.json` — always invoke `npx tsc --noEmit` and `npx vitest run` directly.

---

## 14. Exact Instructions for Continuing from Sprint 45

**Sprint 45 brief (already received, verbatim, for reference)**: "Production Sprint 45 — Streaming
Runtime Engine." Create `src/features/streaming-runtime/`. Implement `StreamingRuntimeEngine`,
`DefaultStreamingRuntimeEngine`, `StreamingSession`, `StreamingStateMachine`, `StreamChunk`,
`StreamAssembler`, `StreamBuffer`, `StreamCompletionDetector`, `StreamingDiagnostics`,
`StreamingLifecycleManager`. Responsibilities: stream initialization, chunk reception, chunk ordering,
chunk buffering, chunk assembly, partial response generation, completion detection, cancellation,
stream diagnostics. Streaming States: Idle, Starting, Streaming, Paused, Completed, Cancelled, Failed.
Validation: invalid chunk sequence, duplicate chunk, missing chunk, invalid completion, buffer
overflow, invalid stream state, invalid lifecycle transition, missing diagnostics. Testing: streaming
lifecycle, chunk ordering, chunk buffering, response assembly, completion detection, cancellation,
diagnostics, deterministic behavior, validation. Out of Scope: real OpenAI/Anthropic/Gemini SDKs, SSE,
WebSockets, persistence, billing, embeddings, vector database, UI. Standard verification (§10) applies.
"STOP after verification and wait for approval before Production Sprint 46."

**Nothing has been done for Sprint 45 yet.** To resume:

1. **Research collisions first**, before anything else:
   ```bash
   cd /Users/drkapildevsharma/Documents/Projects/MindUrMind/mind-ur-mind-learning-lab
   for name in StreamingRuntimeEngine DefaultStreamingRuntimeEngine StreamingSession \
     StreamingStateMachine StreamChunk StreamAssembler StreamBuffer StreamCompletionDetector \
     StreamingDiagnostics StreamingLifecycleManager; do
     echo "--- $name ---"
     grep -rn "export \(type\|interface\|class\|const\) $name\b" src --include="*.ts"
   done
   ```
   Then repeat for every supporting type the plan ends up inventing (validation issue types, request/
   result wrapper types, etc.) before finalizing names — **do not skip this even though the last two
   sprints (43, 44) both had zero collisions; that is not guaranteed to continue.**
2. **Decide self-contained vs. bridging** using the exact test in §8/§4.5: does the Sprint 45 brief say
   "using the already-approved production features" or give a named Execution Flow? Based on the brief
   already received (verbatim above), it does **not** — it only frames this as "deterministic streaming
   lifecycle management without integrating any real provider SDKs," which is an Out-of-Scope/regression
   framing, not a bridging instruction. **Default assumption: build fully self-contained, zero
   cross-feature imports**, matching Sprints 37/38/39/40/42/43/44 — but re-confirm this reading against
   the brief before committing to it in a plan.
3. **Design considerations specific to this sprint** (to reason through in Plan Mode, not to take as
   given):
   - 7 `StreamingState` values map directly to "## Streaming States" (`Idle|Starting|Streaming|Paused|
     Completed|Cancelled|Failed`) — note this is the **first sprint in the arc with a `Paused` state**,
     which no prior state machine has had; consider what "Paused" legally transitions to/from (probably
     `Streaming ⇄ Paused`, and `Paused → Cancelled/Failed`).
   - `StreamChunk` is almost certainly a caller-supplied, deterministic, ordered sequence (same "the
     caller supplies the fact" discipline as every prior sprint) — likely `{ sequenceNumber: number;
     content: string; isFinal: boolean }` or similar; "chunk ordering"/"duplicate chunk"/"missing chunk"
     validation concerns all operate on `sequenceNumber` continuity.
   - `StreamBuffer` + "buffer overflow" validation implies a bounded buffer with a max-size constraint —
     needs a deterministic capacity field somewhere (likely on a config/policy type this sprint invents).
   - `StreamAssembler` + "chunk assembly" + "partial response generation" suggests two related but
     distinct outputs: an incremental/partial assembled string as chunks arrive, and a final assembled
     string at completion — consider whether these are two methods on one interface or two separate
     pure functions.
   - `StreamCompletionDetector` + "completion detection" is its own named responsibility separate from
     the state machine — likely a pure function inspecting the latest chunk (e.g. `isFinal: true`) or
     the full received sequence, returning a boolean/decision.
   - This is the **first sprint to explicitly rule out SSE/WebSockets** in Out of Scope — reinforces
     that nothing here should attempt any real transport-layer concern; everything is chunk-array-in,
     assembled-result-out.
4. **Enter Plan Mode**, write a fresh plan (overwriting whatever is at
   `~/.claude/plans/functional-sleeping-lovelace.md`), get explicit user approval via `ExitPlanMode`.
5. **Implement**, following the exact skeleton in §5 and the interface conventions in §6.
6. **Verify** using the exact 6-step sequence in §10, including the known-flake handling in §11.
7. **Report results and stop** — do not begin Sprint 46 without a new, explicit user instruction.
8. **Consider updating this handoff document** (or creating a new dated one) once Sprint 45 (and
   subsequent sprints) are complete, so the next handoff remains accurate — this one only covers
   through Sprint 44.

**Nothing else is pending.** There are no partially-completed files, no stale scaffolding, no
in-progress git state to reconcile. The repository is in a fully clean, fully verified state at the
Sprint 44 boundary, ready for Sprint 45 to start from zero.
