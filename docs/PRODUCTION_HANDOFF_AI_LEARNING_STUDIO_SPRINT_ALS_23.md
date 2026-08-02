# Production Handoff — AI Learning Studio™ Sprint ALS-23: Critical Backend Pipeline — 400 Bad Request Root Cause & Fix

## Status: FIXED AND VERIFIED. A second critical bug reported during manual QA — `Failed to load resource (400)` / `Server [ERROR] failed to load universal learning object` — was traced to its exact root cause, confirmed live against the hosted database, and fixed. No application code required any change; the fix was applying 9 already-written, already-reviewed migrations to the linked Supabase project.

## Mission

Trace the complete backend pipeline (Upload → Document persistence → Universal Content Engine → Universal
Learning Object generation → Workspace initialization → Learning Modes), find exactly where the reported
HTTP 400 is produced, fix the real root cause (not a workaround), and verify every Learning Mode
successfully receives the generated Universal Learning Object.

## Root cause — two distinct, confirmed issues, not one

The two symptoms in the bug report turned out to be **two separate live errors**, both from the same
underlying category: real migrations, written across this sprint arc, deliberately left unapplied to the
linked hosted Supabase project (standing policy since ALS-10 — "leave migrations unapplied, files only").
ALS-22 fixed the PDF-parsing hang that previously stopped the pipeline before it ever reached these paths;
with that fixed, live QA reached them for the first time and both surfaced.

**1. The server log line (`failed to load universal learning object`) — HTTP 404, not 400.**
`universal_learning_objects` (migration `20260717000001`) did not exist on the live database at all.
Confirmed with a direct, read-only probe against the real PostgREST endpoint:

```
GET /rest/v1/universal_learning_objects?select=data&document_id=eq.<uuid>
→ 404 { "code": "PGRST205", "message": "Could not find the table 'public.universal_learning_objects' in the schema cache" }
```

This is the exact call inside `loadUniversalLearningObject.ts`, and its own `logger.error('failed to load
universal learning object', ...)` call is a verbatim match to the reported server log line. A genuinely
missing table in PostgREST is a `404 PGRST205`, never a `400` — so this explains the log line, but is a
distinct fact from the literal "(400)" in the report.

**2. The literal "(400)" — a real, separate endpoint.** `learning_sessions.session_type` has a `CHECK`
constraint. On the live database it was still the *original* 4-value list
(`'reading', 'memory', 'revision', 'research'`) from its first migration
(`20260711000003_create_learning_sessions.sql`). Three later migrations
(`20260718000001`, `20260722000001`, `20260723000001`) were written to widen it to 7 values — but were
never applied. The real, shipped application code for Smart Notes™, Focus Mode™, and MCQs™
(`smartNotesMode.ts:30`, `focusLearningMode.ts:22`, `mcqsLearningMode.ts:18`) already writes
`session_type: 'smart-notes' | 'focus' | 'mcqs'`. Any session start in one of those three modes hit
Postgres `23514 check_violation`, which PostgREST reports as **`400 Bad Request`** — the exact status code
in the report.

Both root causes are the same shape: application code that was already correct, waiting on a database
schema that hadn't caught up. Confirmed by reading the actual applied-vs-pending migration list
(`supabase migration list`) and the exact constraint definitions live on the database — not assumed.

## The fix

Applied all 9 migrations that had been pending since ALS-10 to the linked, hosted Supabase project via
`supabase db push`, after presenting the confirmed findings to the founder and receiving explicit
authorization (this project's standing policy requires confirmation before any migration touches the live
database — this was not done unilaterally):

- `20260717000001_create_universal_learning_objects.sql`
- `20260718000001_widen_learning_sessions_smart_notes.sql`
- `20260718000002_create_smart_notes.sql`
- `20260718000003_create_mentor_sessions.sql`
- `20260718000004_create_mentor_conversation_turns.sql`
- `20260719000001_create_learning_documents_bucket.sql`
- `20260719000002_create_generated_learning_content.sql`
- `20260722000001_widen_learning_sessions_focus.sql`
- `20260723000001_widen_learning_sessions_mcqs.sql`

No application code was touched. Every one of these migrations was already written, reviewed, and matched
exactly by the existing, shipped application code (`sessionSnapshotRecord.ts`'s own `LearningSessionRecord
['session_type']` union already listed all 7 values; `uloRecord.ts`'s shape already matched the ULO table
exactly) — this was purely a deployment gap, not a design or implementation gap.

## Verification

**Empirical, against the live database, not just re-running `migration list`:**

- `supabase migration list` — all 9 previously-pending migrations now show `Local == Remote`.
- Direct REST probes (read-only `GET`) against every previously-missing table — `universal_learning_objects`,
  `smart_notes`, `mentor_sessions`, `mentor_conversation_turns`, `generated_learning_content` — all now
  return `200` with an (RLS-correct, empty) result set instead of `404 PGRST205`.
- `supabase db query` directly against the live database confirmed:
  - `storage.buckets` has a `learning-documents` row (`public: false`), matching the migration exactly.
  - `learning_sessions_session_type_check`'s live definition is now
    `CHECK (session_type = ANY (ARRAY['reading','memory','revision','research','smart-notes','focus','mcqs']))`
    — the full 7-value list, matching what the application code has been assuming all along.
- **Full endpoint-chain trace**, per the bug report's own explicit checklist: `documents` (insert/update)
  is on an already-applied migration, untouched by this fix. All 9 Learning Mode pages/actions
  (`flashcards`, `focus`, `mcqs`, `memory`, `mind-map`, `notes`, `read`, `revision`, plus Workspace's own
  `resolveLearningWorkspaceState.ts`) route through the one shared `loadUniversalLearningObject` in
  `learning-mode-runtime` — confirmed QSR's own copy is a pure re-export of the same function, not a
  divergent path. The fix applies identically to every mode simultaneously; there is no mode-specific
  ULO-loading code left unverified.

### Full verification suite

- `npx tsc --noEmit` — clean, whole repository.
- `npx eslint .` — clean, whole repository.
- `npx vitest run` — **645 test files, 3,935 tests, 100% passing** — identical count to ALS-22, confirming
  zero regressions from a change that touched no test-covered code.
- `npm run build` — completed with the full route table printed and zero errors (a Next.js build aborts
  before printing the route table on any compile failure).

## Files modified

None. This sprint's entire fix is 9 migration files (already existing in `supabase/migrations/`, unchanged)
being applied to the live database. `docs/AI_LEARNING_STUDIO_VERSION_1_KNOWN_ISSUES.md` was updated to
move the "8/9 migrations unapplied" item from Known Issues into Resolved.

## What was deliberately NOT touched

No new feature, no architecture change, no workaround. The bug report explicitly asked for the real root
cause, not a client-side retry or a defensive code path around a missing table/constraint — that would have
masked a real deployment gap instead of closing it. No OpenAI integration, no payment system, no School/
Parent Dashboard, no Version-2 functionality.

## Known Issues (updated)

See `AI_LEARNING_STUDIO_VERSION_1_KNOWN_ISSUES.md`. The migration-deployment item is now resolved and moved
to "Resolved, no longer an issue." One deployment prerequisite remains: no live, authenticated browser
walkthrough has been run in this development environment (no seeded test user, no live Storage bucket
access from here) — a real, credentialed click-through QA pass is still the recommended next step before
declaring this fully closed in production use, though every reachable layer below the browser has now been
verified directly against the live database.

## Stop

This critical fix is complete and verified. Do not begin any further sprint, OpenAI API Integration,
Payment System, Discover Your Learning Potential™, School Dashboard, Parent Dashboard, or Version-2 work
without approval.
