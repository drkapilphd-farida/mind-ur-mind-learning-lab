# Production Handoff — Smart Notes™ Sprint-2: Reading & Notes Workspace™

## Status: COMPLETE. QSR, Memory Mode, and Smart Notes Sprint-1's engine untouched.

## A real data-model decision, resolved with the founder before writing code

"Add only the presentation layer required for taking, editing, saving and restoring notes" requires
real, persisted note content — and LSE-3's own locked `SessionSnapshot` has no room for it by design
(it's deliberately bounded/derived, the same reasoning that already keeps the runtime's own
`eventLog` out of it). Two real options existed: notes scoped **per session** (each session's own
separate notes, blank on a new session) or **per document** (one growing set of notes per learner
per document, independent of any session's lifecycle). Flagged before writing code rather than
guessing — the founder's explicit choice: **per document**, "matches how a real notebook works."

### What that meant for the data model

Notes get their own small, dedicated table — never folded into `learning_sessions.data` (which
would have coupled note content to session rows despite notes deliberately outliving any single
session) and never a new field on `SessionSnapshot` (which would have meant redesigning a locked,
shared LSE-3 type used by all three modes):

```sql
CREATE TABLE public.smart_notes (
  id, user_id, document_id, content, created_at, updated_at,
  UNIQUE (user_id, document_id)
);
```

`supabase/migrations/20260718000002_create_smart_notes.sql` — strictly additive, RLS-scoped to
`auth.uid() = user_id` (select/insert/update), mirroring `learning_sessions`'/`documents`' own
policy pattern exactly. `src/lib/supabase/types.ts` gained a hand-added `smart_notes` entry in its
correct alphabetical position, matching the same disclosed "hand-added, not regenerated" convention
already used for `universal_learning_objects` (no live Supabase connection available in this
environment to regenerate against).

## Part 1 — Notes persistence and Server Actions

```
src/features/smart-notes-runtime/
  notes/
    types/SmartNote.ts
    loadSmartNote.ts
    saveSmartNote.ts
  actions/
    getSmartNotes.ts
    saveSmartNotes.ts
```

`loadSmartNote`/`saveSmartNote` mirror the exact shape of Sprint-1's own
`loadUniversalLearningObject.ts`/`saveUniversalLearningObject.ts` (real Supabase query, real
`logger.error` on failure, `null` returned honestly rather than thrown for "nothing saved yet").
`saveSmartNote` returns the real, database-assigned `updated_at` from a `.select().single()` after
the upsert — never a client-side `new Date().toISOString()` approximation — so "Saved 3:42 PM" is
always genuinely accurate. `getSmartNotes`/`saveSmartNotes` are real, validated (Zod) Server
Actions, auth-checked exactly like every other action in this codebase.

**Explicit save, not autosave** — a real, disclosed scope boundary. Debounced autosave is a real UX
decision (timing, save-status races, conflict handling) beyond this sprint's own "no premium UI
polish yet" / "presentation layer required for taking, editing, saving and restoring" — a Save
button is the minimum real mechanism that satisfies all four verbs honestly.

## Part 2 — Reading & Notes Workspace (presentation)

```
src/features/smart-notes-runtime/components/
  SmartNotesPanel.tsx    (new)
  SmartNotesWorkspace.tsx (edited — Sprint-1 file)

src/app/preview/learning-projects/[id]/notes/page.tsx (edited — Sprint-1 file)
```

**Why Sprint-1 files were edited, despite the lock.** This sprint's own brief — "Implement only the
Smart Notes workspace experience... add only the presentation layer required for taking, editing,
saving and restoring notes" — has no other real destination: the reading-and-notes experience is one
workspace, not two separate pages, and Sprint-1 already built that workspace's shell. The same
relationship QSR's and Memory Mode's own polish sprints already had to their own prior sprints
applies here: the existing session state machine, its four branches, and every Server Action call
Sprint-1 built are byte-for-byte unchanged; the only edits are the new `initialNote` prop and
rendering `<SmartNotesPanel>` in three of the four states (`not-started`, `active`, `completed` — not
`not-processed`, where there's no real document content yet to take notes on).

**`SmartNotesPanel.tsx`** is deliberately plain per this sprint's own "no premium UI polish yet"
rule: a bordered `<textarea>`, the existing `Button` primitive, no card treatment, no animation.
`hasUnsavedChanges` is a real comparison against the last successfully saved content, not a guessed
dirty flag; the "Saved 3:42 PM" / "Unsaved changes" indicator reflects real state, never an assumed
one.

**Notes are orthogonal to session state, by design** — `SmartNotesPanel` owns its own independent
`useState`/`useTransition` cycle, entirely separate from `SmartNotesWorkspace`'s own `LiveState`
session machine. This is a direct, structural consequence of the per-document scoping decision:
notes don't belong to a session's lifecycle, so their component shouldn't either.

**`page.tsx`** now fetches `getSmartNotes` in parallel with session-state resolution
(`Promise.all`) — the two are genuinely independent real queries, not a false dependency.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors.
- `npx eslint` scoped to every touched file — clean.
- `npx vitest run` (whole repo) — **612 test files, 3819 tests passed — identical counts to Smart
  Notes Sprint-1**, direct proof this sprint added and changed zero testable pure logic (the new
  persistence functions are I/O-touching, following the same established convention as
  `loadUniversalLearningObject`/`saveUniversalLearningObject` — untested directly, exercised through
  the Server Action boundary; components remain untested per this codebase's own convention, no
  jsdom configured).
- `npm run build` — compiled successfully, all real routes generated. `/notes` grew from 1.71 kB to
  2.29 kB (the real `SmartNotesPanel` markup/state). **QSR's `/read` (4.36 kB) and Memory's
  `/memory` (3.85 kB) are byte-identical to Smart Notes Sprint-1** — the strongest possible build-time
  evidence that neither was touched.
- Manual check: dev server started; `/preview/learning-projects/test-id/notes`, `/read`, and
  `/memory` all return a clean `307` to `/login` for an unauthenticated request, with no server
  error.

## Scope Check

- Zero changes to QSR or Memory Mode, any sprint — confirmed via `git status`/mtime check before
  writing this doc and via both routes' byte-identical build output.
- Zero changes to Smart Notes Sprint-1's engine — `smartNotesMode.ts`, every action under
  `actions/` except the two brand-new ones this sprint added
  (`getSmartNotes.ts`/`saveSmartNotes.ts`), and the Shared Learning Runtime are all untouched.
  `SmartNotesWorkspace.tsx`/`page.tsx` were edited, disclosed above, strictly additively (new prop,
  new rendered section) — the session engine, state machine, and every existing action call are
  unchanged.
- One new, additive, non-breaking database migration; zero changes to `learning_sessions` or
  `universal_learning_objects`.
- Zero AI generation, zero summarization, zero flashcards, zero MCQs, zero mind maps, zero revision,
  zero research, zero mentor.
- Zero premium visual polish — deliberately plain, per this sprint's own rule.

## Remaining Roadmap

Per the brief's explicit stop instruction, Smart Notes Sprint-3 does not begin here.
