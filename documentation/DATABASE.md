# Database

[← Back to index](./PROJECT_BLUEPRINT.md)

**Both tables documented here pre-date this project.** Quantum Speed Reading™ V2 has never created a migration of its own — it reuses this existing persistence infrastructure exactly as-is, by design (see [ARCHITECTURE.md](./ARCHITECTURE.md), Rule 10).

## `practice_sessions`

**Migration:** `supabase/migrations/20260629000002_create_practice_sessions.sql`
**Purpose:** an append-only history log of every practice attempt, across every exercise in every lab (not specific to Quantum Speed Reading).

```sql
CREATE TABLE public.practice_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  lab_id      text        NOT NULL,
  exercise_id text        NOT NULL,
  duration_ms integer     NOT NULL CHECK (duration_ms >= 0),
  completed   boolean     NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX practice_sessions_user_lab_occurred_idx
  ON public.practice_sessions (user_id, lab_id, occurred_at DESC);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
```

**RLS:** enabled. Policies exist for **SELECT and INSERT only**, both scoped to `auth.uid() = user_id`. There is deliberately no UPDATE or DELETE policy — this enforces "append-only" at the database level, not just by convention.

**Columns, for every V2 Reading Mode:**

| Column | Meaning for a Reading Mode session |
|---|---|
| `lab_id` | always `'quantum-speed-reading'` |
| `exercise_id` | one of `vertical-word-reading`, `phrase-reading-mode`, `sentence-reading-mode`, `paragraph-reading-mode` |
| `duration_ms` | `elapsedMs` from `ReadingSessionResult`, rounded |
| `completed` | `true` only for a **natural** completion (`wasFinishedEarly === false`); an honest early Finish writes `false` |
| `occurred_at` | server default `now()` at write time |

**What this table does NOT store (important, and permanent by design):** no WPM column, no words-read column, no completion-percentage column. A Reading Mode's `ReadingSessionResult` computes `averageWpm`/`wordsRead`/`completionPercent` transiently in memory, uses them to update `localStorage`'s Best Record, and then discards them — only `duration_ms`/`completed` ever reach this table. This is **the single most important limitation to understand** about this system's data model — see [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md) for its full consequences (Reading Hub's Recent Activity cannot show a real historical WPM for any past session, including the most recent one).

## `exercise_progress`

**Migration:** `supabase/migrations/20260629000001_create_exercise_progress.sql`
**Purpose:** the current status of a user's relationship to one exercise (not a history — one row per user/lab/exercise combination, upserted).

```sql
CREATE TABLE public.exercise_progress (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  lab_id       text        NOT NULL,
  exercise_id  text        NOT NULL,
  status       text        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT exercise_progress_user_exercise_key UNIQUE (user_id, lab_id, exercise_id)
);

CREATE INDEX exercise_progress_user_lab_idx ON public.exercise_progress (user_id, lab_id);

ALTER TABLE public.exercise_progress ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_exercise_progress_updated_at
  BEFORE UPDATE ON public.exercise_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

**RLS:** enabled. Policies exist for SELECT, INSERT, and UPDATE, each scoped to `auth.uid() = user_id`. No DELETE policy.

**Sticky-completion behavior:** once `status = 'completed'` for a given `(user_id, lab_id, exercise_id)`, a later `!completed` attempt does **not** downgrade it back to `'in_progress'` — see the write path below.

## The write path: `savePracticeSession` Server Action

**File:** `src/lib/exercises/actions/savePracticeSession.ts` (pre-existing, not part of this project)
**Called by:** `useReadingSession` → the pre-existing `useExerciseSession` hook, from every mode's `*Experience.tsx`.

Input validation (`src/lib/exercises/types.ts`):

```ts
export const PracticeSessionInputSchema = z
  .object({
    labId: LabIdSchema,
    exerciseId: z.string().min(1),
    durationMs: z.number().positive(),
    completed: z.boolean(),
  })
  .strict()
```

`LabIdSchema = z.enum(['quantum-speed-reading', 'memory-intelligence', 'focus-intelligence', 'visual-intelligence'])`.

Behavior, in order:
1. If no signed-in user: returns `{ success: true }` without writing anything (anonymous practice isn't tracked).
2. Re-verifies server-side that the exercise is actually unlocked (`verifyExerciseIsUnlocked`) — never trusts the client's own gating.
3. Inserts a new row into `practice_sessions` unconditionally (every attempt is logged, regardless of what happens next).
4. Reads the existing `exercise_progress.status` for this `(user, lab, exercise)`. If it is already `'completed'` and this new attempt is `!completed`, returns early **without downgrading** — completion is sticky.
5. Otherwise, upserts `exercise_progress` (`on conflict user_id, lab_id, exercise_id`) with `status: completed ? 'completed' : 'in_progress'`, `completed_at: completed ? now() : null`.

## Relationships

```
auth.users (Supabase Auth, not part of this project)
    │ 1
    │
    ├──── practice_sessions (many rows per user — history)
    │        user_id, lab_id, exercise_id, duration_ms, completed, occurred_at
    │
    └──── exercise_progress (at most 1 row per user+lab+exercise — current status)
             user_id, lab_id, exercise_id, status, started_at, completed_at, updated_at
```

No foreign key exists between `practice_sessions` and `exercise_progress` — they are independent tables written together by the same Server Action, correlated only by the shared `(user_id, lab_id, exercise_id)` triple, never joined at the SQL level anywhere in this project's own code (`getPracticeSessionsForExercises` only queries `practice_sessions`).

## Current limitations (database-specific)

- No per-session WPM, words-read, or completion-percent column on `practice_sessions` — permanent, by design (see [ARCHITECTURE.md](./ARCHITECTURE.md), Rule 10). Adding one is listed as future work in [ROADMAP.md](./ROADMAP.md), not implemented.
- No table at all for "Best Record" — it lives only in each browser's own `localStorage`, per mode (see [READING_SHELL.md](./READING_SHELL.md)/`readingLocalHistory.ts`), so it does not sync across devices.
- `getPracticeSessionsForExercises` (used by the Reading Hub) queries up to 200 rows — sufficient for the current 4-mode scope, but would need review if usage volume or mode count grows substantially.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Design System →](./DESIGN_SYSTEM.md)
