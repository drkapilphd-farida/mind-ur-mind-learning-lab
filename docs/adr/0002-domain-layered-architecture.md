# ADR 0002 — Domain-Layered Architecture for AI Learning Studio™ (Sprint 0)

## Status

Accepted (Sprint 0 — Platform Foundation™, Chunk 4). Scaffolding only — no
business logic in any file this ADR describes.

## Context

Sprint 0's routing (`/preview/*`) and shell (`src/components/shell/`) are
already in place. This chunk adds the service/AI-infrastructure
foundation those routes will eventually call into. The explicit
instruction: organize it **by domain, not by feature**, as a permanent
architecture, with AI as its own top-level bounded context.

## Decision

Two organizational philosophies now coexist in `src/`, on purpose, each
scoped to a different side of the product:

| Existing (untouched) | New (this ADR) |
|---|---|
| `src/features/*` — vertical-slice, one folder per feature (`auth`, `billing`, `focus-discovery`, ...), each containing its own actions/components/types together. | `src/{api,services,config,constants,types}/*` — horizontal layers, each sliced into the same six domains. `src/ai/*` — AI's own bounded context, not sliced further by these six domains. |
| Powers Brain Training Studio™ and everything under `(dashboard)`/`(admin)`/`(auth)`/`(marketing)`. | Powers AI Learning Studio™ (`/preview/*`) going forward. |

**Why not migrate the existing code to match:** out of scope for this
sprint (explicitly "do not redesign the product, do not change the
architecture" for existing routes) and out of proportion to the risk —
`src/features/*` is working, tested, in production use; a mechanical
re-layering of it would touch dozens of files for zero functional gain
this sprint. The two philosophies are documented here specifically so a
future engineer doesn't read this as an inconsistency to "fix" — it's a
deliberate boundary between two product surfaces at two different
maturity stages.

### The six domains

`auth`, `documents`, `learning`, `ai`, `subscription`, `analytics` — one
subfolder per domain under each of `api/`, `services/`, `config/`,
`constants/`, `types/`. Mapped from the Chunk 3 domain model (ADR 0001):

| Domain | Chunk 3 tables |
|---|---|
| `auth` | `roles`, `permissions`, `user_roles`, `families`, `family_members` (account/access concerns) |
| `documents` | `documents` |
| `learning` | `learning_projects`, `learning_sessions` |
| `ai` | `ai_events` (the domain-shape types only — the AI *subsystem* itself lives in `src/ai/`, see below) |
| `subscription` | `plans`, `subscriptions`, `entitlements` |
| `analytics` | `audit_logs` |

### Layer responsibilities

- **`types/{domain}/`** — the domain's data shapes, one-to-one with the
  Chunk 3 schema (camelCase mirrors of each table's columns). The one
  layer with real, non-placeholder content this sprint — types cost
  nothing to have "too early" and every other layer depends on them.
- **`api/{domain}/`** — the external contract: typed function signatures
  a Server Action or a future route handler calls. Thin by design; each
  function delegates to `services/{domain}/` and does nothing else.
- **`services/{domain}/`** — where real business logic will live in
  future sprints (validation, orchestration, multi-table transactions).
  Every function in this sprint throws `NotImplementedError` with a
  pointer to which future sprint should fill it in — never silently
  returns fake data.
- **`config/{domain}/`** — runtime-tunable values (feature flags,
  limits) for that domain. Left minimal or empty-with-explanation where
  a domain genuinely has nothing to configure yet.
- **`constants/{domain}/`** — compile-time fixed values (enum-like
  lists, keys) for that domain.

### `src/ai/` — its own bounded context

Not sliced by the six domains above — AI is one coherent subsystem with
its own internal shape, per the sprint's own tree:

```
ai/
  router/        picks a provider/model for a given request type
  providers/      provider adapters (Anthropic today, others later) — interfaces only
  prompts/        prompt template registry
  cache/          future AI response cache
  economics/      future cost/usage aggregation (reads ai_events)
  mentor/         AI Mentor™ orchestration
  learning-dna/   future Learning DNA Engine
  events/         records to the ai_events table (Chunk 3)
  services/       the subsystem's own internal composition layer
  types/          AI-subsystem-internal contracts (AIRequest/AIResponse/...) — distinct from types/ai/ (DB-shape types)
```

`api/ai/` is a thin façade over `src/ai/` for the rest of the app to call
— it does not duplicate the subsystem, it re-exports from it.

**No API keys, no model calls, no real provider wiring** — every
function here throws or returns a typed stub. The existing, working AI
integration (`src/features/ai-tutor/actions/chat.ts`,
`src/features/admin/actions/generateLessonContent.ts`) is untouched;
this scaffolding is where a *future* unified AI layer will live once
built, not a replacement shipped today.

## Consequences

- Every file this ADR describes compiles and is dead code (imported by
  nothing yet) — expected for a foundation sprint, verified via
  `tsc --noEmit` rather than by any runtime check.
- Future sprints implementing a specific domain (e.g. Documents) fill in
  `services/documents/*`, wire `api/documents/*` to it, and only then
  connect a Server Action or page to `api/documents/*` — the layering
  itself doesn't change.
