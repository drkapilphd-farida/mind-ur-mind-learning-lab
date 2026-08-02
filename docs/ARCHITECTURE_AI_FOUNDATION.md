# Architecture — AI Foundation Layer™ (AIF-1)

## Summary

The locked pipeline adds a new stage between UCE-3A and UCE-3B: the **AI Foundation Layer™**, the only code
in the platform allowed to call an AI provider SDK. Every future engine calls
`AIFoundation.execute(task, payload)` and never knows which provider answered.

**A premise correction preceded this sprint**, the same class of correction as UCE-3's own handoff doc. The
brief's own interface list (`AIProvider`, `AIProviderFactory`, `AIRequest`, `AIResponse`, `AIUsage`,
`AIError`, `TokenUsage`, `RetryPolicy`, `ProviderHealth`, a real `ClaudeProvider`) overlaps almost 1:1 with a
large, already-existing, uncommitted AI provider abstraction: `src/features/ai-provider/` (~50 files —
`AIProvider`/`ProviderFactory`/`ProviderRegistry` contracts, every type the brief lists, 8 mock providers),
`src/features/real-ai-providers/` (~25 files — a **real** `@anthropic-ai/sdk`-backed Claude adapter, gated on
`ANTHROPIC_API_KEY`, plus a real OpenAI adapter, credential/health checking, env-driven runtime switching),
and `src/features/ai-provider-configuration/` (the provider catalog and runtime resolver). This was surfaced
to the user directly before any code was written; **confirmed direction: wrap and reuse, never rebuild.**
AIF-1 does not redefine `AIProvider`, does not implement a second `ClaudeProvider`, and does not touch any
file under those three directories — every file changed or added by this sprint lives under the new
`src/core/ai-foundation/`, plus one additive `.env.example` entry.

## What's Reused, Named Explicitly

Confirmed by reading the real source before designing against it (not assumed):

| Reused as-is | Source |
|---|---|
| `AIProvider` (`generate`/`checkHealth`/`estimateCost`), `ProviderFactory`, `ProviderRegistry` | `src/features/ai-provider/contracts/` |
| `AIRequest`, `AIResponse`, `AIUsage`, `TokenUsage`, `CostEstimation`, `AIError`, `RetryPolicy`, `RateLimitPolicy`, `ProviderHealthStatus`, `AIProviderConfiguration` | `src/features/ai-provider/types/` |
| The real Claude provider (`createClaudeProviderAdapter()` — a real `@anthropic-ai/sdk` call via `RealClaudeMessagesClient`, gated on `ANTHROPIC_API_KEY`) | `src/features/real-ai-providers/claudeAdapter/` |
| The real, env-driven provider switch (`createDefaultRuntimeProviderSwitcher().getActiveProvider()` — reads `AI_ACTIVE_PROVIDER_ID`/`AI_PROVIDER_CLAUDE_ENABLED`, checks real credentials/health, falls back to `mock` unless every gate passes) | `src/features/real-ai-providers/switching/` |
| `estimateTokens(text)` — a real, already-used ~4-chars-per-token heuristic | `src/features/ai-provider/adapters/estimateTokens.ts` |
| `logger` — the existing structured logger (`logger.info/warn/error/debug`) | `src/lib/logger.ts` |

`AIF-1`'s `types/index.ts` re-exports all of these under one barrel — `ProviderHealth`/`AIConfiguration` are
plain type aliases of `ProviderHealthStatus`/`AIProviderConfiguration`, renamed only to match this sprint's
brief; the underlying shape is untouched. A future engine that imports only from `@/core/ai-foundation` never
has a reason to know `@/features/ai-provider` or `@/features/real-ai-providers` exist.

## What's Genuinely New

Two facts, confirmed by reading `BaseProviderAdapter.generate()` directly, drove what this sprint actually
had to build:

1. **`AIProvider.generate()` always *throws*** a `ProviderAdapterError` (`.aiError: AIError`) on any failure
   — it never returns an error variant. AIF-1's retry/result wrapper (`internal/executeWithRetry.ts`) is the
   piece that catches this and turns it into `AIFoundation`'s own Result-type response.
2. **`RetryPolicy` is declared but never consulted anywhere in the existing system.** `BaseProviderAdapter.
   generate()` calls the provider exactly once — no loop, no backoff. `executeWithRetry` is the real gap
   this sprint fills: retries only while `AIError.retryable` is true (the existing `ErrorTranslator` already
   marks rate-limit/timeout/provider-unavailable as retryable, auth/invalid-request as not), honoring
   `RetryPolicy.backoffStrategy` (`fixed`/`exponential`) and `maxAttempts`, with an injectable delay function
   so tests never actually wait.

Everything else new is infrastructure the existing system never had at all:

- **`AITask`** (`types/AITask.ts`) — the 13 brief-listed task labels. No behavior branches on it anywhere in
  `aiFoundation.ts`; it only namespaces the cache key (so the same content processed for two different tasks
  never collides) and tags cost/observability records. This is what "Do NOT implement business logic. Only
  define supported tasks" means in practice — the caller (a future UCE-3B/UCE-5/mentor/flashcard/MCQ engine)
  builds the real prompt in `AIFoundationPayload.messages`; AIF-1 never constructs one.
- **`AIResultCache`** (`internal/InMemoryAIResultCache.ts`) — real, TTL-aware, in-process, keyed by a
  deterministic sha256 of `(task, normalized payload)` (`internal/computeCacheKey.ts`). "AI must process
  uploaded content only once" holds within one running process.
- **`CostTracker`** (`internal/InMemoryCostTracker.ts`) — records every brief-listed field
  (`CostTrackingEntry`: requestId, task, providerId, modelId, tokens, estimatedCost, actualCost,
  processingTimeMs, cacheHit, occurredAt) for every call, including cache hits (recorded with zero cost —
  see "Cost Tracking" below) and failures (zero cost, since no successful response means no real usage data
  to report).
- **`RateLimiter`** (`internal/InMemoryRateLimiter.ts`) — real sliding-window enforcement of the existing
  `RateLimitPolicy`, which — like `RetryPolicy` — was declared as configuration data but never enforced
  anywhere before this sprint.
- **`AIProviderFactory`** (`types/AIProviderFactory.ts` + `internal/RuntimeAIProviderFactory.ts`) — a new,
  thin interface (`resolveProvider(): Promise<AIProvider>`). Its default implementation delegates 100% to
  `createDefaultRuntimeProviderSwitcher().getActiveProvider()` and nothing else — this is the *one* file in
  AIF-1 that imports from `@/features/real-ai-providers`. Never references `'claude'`/`'openai'` by name;
  which real provider is active is decided entirely by the existing env-driven switcher.

## Cost Tracking Doesn't Reuse `provider.estimateCost()`

`BaseProviderAdapter.estimateCost()` (the method every existing `AIProvider`, including the real Claude
adapter, inherits) uses hardcoded rates its own source comments label *"Placeholder, illustrative rates
only — not real provider pricing."* `ClaudeProviderAdapter` never overrides it. Building `CostTracker` on
top of those numbers would produce cost figures that look real without being real — the opposite of this
codebase's established "real vs. disclosed-reserved" discipline.

Instead, `types/ModelPricing.ts` defines AIF-1's own small, real, disclosed pricing table
(`DEFAULT_MODEL_PRICING`), seeded with Claude 3.5 Sonnet's actual published rate ($3.00 / million input
tokens, $15.00 / million output tokens as of this sprint). `internal/computeCost.ts` computes real cost from
real token counts against this table; a `modelId` with no entry returns an honest `$0`, not a guessed number.
**This table needs periodic manual updates as providers change pricing** — a genuine, disclosed maintenance
obligation, not hidden behind a false sense of automation.

`estimatedCost` and `actualCost` are currently the same real number (both computed post-response from
`response.usage`, since `AIRequest` doesn't carry a pre-call token estimate today) — the two fields exist
as separate, honestly-identical values now so a future pre-call estimator can populate `estimatedCost`
differently without a breaking schema change.

## How `AIFoundation.execute(task, payload)` Works

```
cache lookup (unless payload.cache.enabled === false)
  hit  → record a zero-cost CostTrackingEntry, return cached response, done
  miss ↓
rate-limit check (pre-call token estimate via the reused estimateTokens())
  denied → return a structured 'rate-limited' AIFoundationResult, no provider call made
  allowed ↓
resolve provider (AIProviderFactory → RuntimeAIProviderFactory → real switcher)
  failure → return a structured 'provider-unavailable' AIFoundationResult
  ok ↓
resolve modelId (payload.modelId, or the provider's first registered model)
  none available → return a structured 'invalid-request' AIFoundationResult
  ok ↓
executeWithRetry(() => provider.generate(request), retryPolicy)
  failure (retries exhausted or non-retryable) → record a zero-cost CostTrackingEntry, return structured AIFoundationResult
  success ↓
compute real cost from real response.usage against the real pricing table
record a real CostTrackingEntry
best-effort cache write (a write failure is logged as a warning, never fails the result — "partial failures")
structured logger.info/warn/error call
return a real success AIFoundationResult
```

Every branch returns the same `AIFoundationResult` discriminated union
(`{ success: true, response, usage, cacheHit, processingTimeMs } | { success: false, error, processingTimeMs }`)
— the same Result-type convention as every other engine in this codebase (`ExtractionResult`,
`UniversalUploadError`'s callers, `LearningChunkValidationResult`). No `try/catch` is required by a caller.

## Scoped Limitations, Disclosed

- **The cache and cost tracker are in-process only this sprint.** "Upload once, learn everywhere" ultimately
  wants a persistent, cross-process store (a Supabase table is the natural fit for this codebase). Building
  that now would mean a new migration + RLS policy + Server Action — real infra scope beyond "reusable AI
  infrastructure." Both `AIResultCache` and `CostTracker` are interfaces specifically so a future
  `SupabaseAIResultCache`/persistent `CostTracker` implementation drops in with zero change to
  `aiFoundation.ts`. This mirrors the exact same disclosed gap already left by `src/ai/cache/index.ts`'s
  dormant `AICache` contract ("no backend chosen yet") from an earlier sprint — not silently duplicated.
- **No custom ESLint rule blocks a future engine from importing `@/features/ai-provider` directly.**
  Enforcement is by documentation and by every AIF-1 file's own barrel discipline, matching how every other
  module boundary in this codebase (e.g. "`UniversalLearningDocument` stays internal") has been enforced so
  far — a real lint rule would be a separate, bigger change to shared config.
- **Token-based rate limiting is a pre-call estimate**, not an exact count — a real token count isn't known
  until the provider responds. Request-count limiting is exact (one real acquired slot per call).

## How Future Engines Consume This

A future UCE-3B/UCE-4/UCE-5/mentor/flashcard/MCQ engine imports only `@/core/ai-foundation`:

```ts
import { createAIFoundation } from '@/core/ai-foundation'

const foundation = createAIFoundation()
const result = await foundation.execute('extract-concepts', {
  messages: [{ role: 'user', content: someRealChunkContent }],
})

if (result.success) {
  // result.response.content, result.usage.cost, result.cacheHit
}
```

It never imports `@anthropic-ai/sdk`, `openai`, `@/features/ai-provider`, or `@/features/real-ai-providers`.
**A second real provider lights up with zero AIF-1 changes**: `OpenAIProviderAdapter` already exists in
`real-ai-providers`; setting `AI_ACTIVE_PROVIDER_ID=openai`, `AI_PROVIDER_OPENAI_ENABLED=true`, and
`OPENAI_API_KEY` is enough — the existing switcher (which `RuntimeAIProviderFactory` delegates to) already
supports it.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors on the first attempt.
2. `npx vitest run` — **503 test files / 3381 tests passed** (up from 495/3329 after the Learning Chunk
   sprint — 52 new tests: `computeCacheKey.test.ts` (6), `InMemoryAIResultCache.test.ts` (6),
   `InMemoryCostTracker.test.ts` (6), `InMemoryRateLimiter.test.ts` (5), `computeCost.test.ts` (4),
   `executeWithRetry.test.ts` (8), `RuntimeAIProviderFactory.test.ts` (3, including one against the real,
   unmocked default wiring confirming it resolves to `mock` with no `AI_*` env vars set), `aiFoundation.test.ts`
   (16, covering cache hit/miss, rate-limit-blocked, provider-resolution-failure, no-model-available, retry-
   exhausted-failure, cache-write-failure-doesn't-fail-the-result, and cost-tracking-failure-doesn't-fail-the-
   result)), zero regressions. One real, self-caught bug during implementation: a test assertion compared
   floating-point cents with `toEqual` instead of `toBeCloseTo`, a test-only rounding issue (`0.075` vs.
   `0.07500000000000001`), not a defect in `computeCost.ts` — fixed.
3. `npm run build` — failed once on the pre-existing, unrelated `reading-discovery` prerender flake (a file
   never touched by this or any prior sprint in this arc), succeeded clean on immediate retry — the same
   "retry once and confirm" pattern established for this exact flake in earlier sprints.
4. `npx eslint` on all new files — clean, zero errors, on the first attempt.
5. Scope check — confirmed `src/features/ai-provider/`, `src/features/real-ai-providers/`,
   `src/features/ai-provider-configuration/`, and `src/core/universal-learning-engine/` show zero
   sprint-caused changes; only `src/core/ai-foundation/` (new) and one additive `.env.example` block
   (`AI_FOUNDATION_CACHE_TTL_SECONDS`, commented out, matching the file's existing convention) were touched.

## Stop

Per the brief, no UCE-3B, UCE-4, UCE-5, UCE-6, Learning Session Engine, AI Mentor, flashcards, MCQs,
research assistance, or semantic enrichment work was started. Waiting for review before any further work.
