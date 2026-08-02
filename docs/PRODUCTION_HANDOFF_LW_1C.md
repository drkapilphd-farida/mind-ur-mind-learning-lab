# Production Handoff — Sprint LW-1C (The World's Most Intelligent Upload Experience™)

**Generated:** 2026-07-15
**Purpose:** Allow a new Claude Code session to continue LW-1D onward with zero context loss.
**Scope of this document:** This sprint only. Builds on `docs/PRODUCTION_HANDOFF_LW_1A.md` and
`docs/PRODUCTION_HANDOFF_PRIMARY_LEARNING_METHODS.md` — read both before touching this flow again, since
this sprint corrects a real duplication between them.

---

## 1. What This Sprint Is, and a Real Collision It Corrected

The brief asked to replace the "Preparing" placeholder (`/welcome/preparing`) with a real "Choose
Learning Method™" screen (Upload & Learn™ / Record & Learn™ hero cards). Research found that screen had
already been built — **in the wrong place**: last sprint added it as a `'method'` step *inside* the real
upload wizard (`src/components/learning/NewLearningProjectWizard.tsx`,
`/preview/learning-projects/new`), while `/welcome/preparing` remained exactly the `ModulePlaceholder`
stub from two sprints before that.

The fix wasn't building a second copy of the same screen — it was **relocating the choice** to match the
brief's own flow diagram (`Learning Goal™ → Choose Learning Method™ → Upload & Learn™ OR Record &
Learn™`, a single upstream decision, not something the wizard should ask about a second time):

1. `/welcome/preparing` → renamed **`/welcome/choose-method`**, now the real screen, reusing
   `PrimaryLearningMethodCard.tsx` exactly as built last sprint (no duplication — just a new call site
   with this sprint's exact copy).
2. The wizard's now-redundant `'method'`/`'record-coming-soon'` steps (added last sprint specifically
   because no upstream screen existed yet) were **removed** — the wizard reverts to starting at its
   `source` step, so the user is never asked "Upload or Record?" twice in a row.
3. **Record & Learn™ now has real, working client-side audio capture** — confirmed with the user as the
   deliberate middle ground between "fake Coming Soon placeholder" (the brief explicitly forbids this) and
   "fully implement the recording backend" (also explicitly out of scope). See §4.

---

## 2. What Stayed Untouched

- `createLearningProjectWithDocument`, `validateDocumentFile.ts`, `constants/documents/index.ts`,
  `UploadZone.tsx`, `UploadProgress.tsx`, `SourceTypeCard.tsx` — the wizard's real engine, byte-identical.
- The wizard's `source`/`name`/`upload` steps' own JSX and handlers — unchanged content, only their
  position in the sequence (now the *only* steps, starting at `source`) and the removal of `source`'s
  dangling "Back to method" button (there's no in-wizard step to return to anymore).
- `ArrivalBackground.tsx`, `AIPresenceLogo.tsx`, `LivingBrainLogo.tsx` — reused unmodified. The brief's
  "reuse the existing Living AI Symbol™... do not replace it" is honored literally: `AIPresenceLogo`
  (built 2 sprints ago) now also appears on Choose Learning Method™ and Record & Learn™, continuing its
  same breathing animation, zero changes to either component.
- Authentication, `middleware.ts`, the database, AI Processing, Learning Blueprint, Learning Workspace —
  none touched.

---

## 3. Work Completed

### `src/app/welcome/choose-method/page.tsx` (new, replaces the deleted `welcome/preparing/`)
Same in-page auth pattern as every other `/welcome/*` route. Renders
`ChooseLearningMethodExperience`.

### `src/components/welcome/ChooseLearningMethodExperience.tsx` (new)
Title "Choose how you'd like to begin.", brief's exact subtitle, `<ArrivalBackground />` +
`<AIPresenceLogo size={72} />`, and two `<PrimaryLearningMethodCard>`s (component reused, unmodified):
Upload & Learn™ (`onSelect` → `router.push('/preview/learning-projects/new')`) and Record & Learn™
(`onSelect` → `router.push('/welcome/record')`).

### `src/components/learning/PrimaryLearningMethodCard.tsx` (additive prop only)
New optional `ctaLabel?: string` — renders a bottom "Start Uploading →" / "Start Recording →" line inside
the card (the brief explicitly asks for a visible button label; the whole card was already the click
target, so this is decorative affordance text, not a second nested interactive element). Purely additive
— every other prop and the existing rendering is unchanged.

### `src/components/learning/NewLearningProjectWizard.tsx` (simplified — the real wizard)
- `WizardStep` narrowed from 5 states back to 3: `'source' | 'name' | 'upload'`.
- Initial step reverts to `'source'` (was `'method'`).
- `STEP_NUMBER`/`TOTAL_STEPS` revert to the original 3-step numbering.
- The `'method'` and `'record-coming-soon'` JSX blocks, and their now-unused imports
  (`PrimaryLearningMethodCard`, `RecordAndLearnIllustration`, `ModulePlaceholder`, the `Mic` icon), were
  removed.
- `source`'s own content is unchanged; only its now-pointless "Back to method" button was removed.

### `src/components/welcome/LearningGoalSelector.tsx` (one-line change)
Navigation target updated: `router.push('/welcome/preparing?goal=...')` →
`router.push('/welcome/choose-method?goal=...')`. The `?goal=` param still travels forward exactly as
before — this sprint doesn't change what (if anything) happens to it.

### `src/app/welcome/record/page.tsx` + `src/components/welcome/RecordAndLearnExperience.tsx` (new)
Same auth pattern. A 6-state client component: `'idle' | 'requesting' | 'recording' |
'permission-denied' | 'unsupported' | 'completed'`.
- **`idle`**: mic-forward hero visual + real "Start Recording →" button.
- **`requesting`**: shown while `getUserMedia({ audio: true })` is pending.
- **`recording`**: real `MediaRecorder` capture, a live `mm:ss` timer, a pulsing recording indicator
  (`usePrefersReducedMotion`-gated — static dot when reduced motion is on), a real Stop button, and an
  `aria-live="polite"` status region announcing state changes for screen readers.
- **`permission-denied`**: honest error state (mic blocked/denied) with a "Try Again" path — never a
  silent failure.
- **`unsupported`**: feature-detected fallback (`navigator.mediaDevices`/`MediaRecorder` missing) — same
  honest-degradation principle used throughout this codebase.
- **`completed`** (on Stop): every `MediaStream` track is stopped immediately — the browser's
  microphone-in-use indicator never lingers. **The recorded audio is discarded — never uploaded, stored,
  or sent anywhere; no backend exists for that yet.** Shows a designed "what's next" panel (title
  "Preparing your learning journey.", body "We'll understand it for you...") listing the locked future
  flow (AI Transcription → AI Understanding → Learning Blueprint™ → Learning Workspace™ → Smart Notes™ →
  Mind Map™ → Flashcards™ → MCQs™ → Memory Test™ → Revision™ → Learning Proof™ → Dashboard™) as chips —
  never the words "Coming Soon."
- Also handles unmount mid-recording (`useEffect` cleanup calls the same track-stopping function).

### Microcopy
Applied only to the new/renamed screens' own copy. The brief's "never say Upload File/Uploading/
Processing/File Added" list was not applied to the existing, reused `UploadZone.tsx`/`UploadProgress.tsx`
internals — those are being reused unmodified, not rebuilt, per the brief's own "reuse everything, do not
rebuild" instruction.

---

## 4. Architecture Decision: Real Audio Capture, Confirmed With the User

The brief's Record & Learn™ instructions contain real tension: "do not fully implement the recording
backend" alongside "do not show Coming Soon" and "design the flow... production-ready architecture." Two
readings were possible — (a) real, working client-side capture with no backend, or (b) a polished but
non-functional mockup. **Confirmed with the user before implementation: option (a).** Rationale: capture
is the one layer of this feature that's honestly buildable without touching any backend or business
logic — `getUserMedia`/`MediaRecorder` are pure browser APIs, nothing persists, nothing is sent to a
server. This is the most literal reading of "production-ready architecture, not a placeholder," and it
avoids the alternative's risk of *looking* like a dressed-up "Coming Soon" card, which the brief
explicitly forbids.

---

## 5. Animation Decisions

- `AIPresenceLogo` (unmodified) now appears on 2 additional screens, continuing its existing breathing
  loop — no new animation code, purely a new call site.
- `ArrivalBackground` (unmodified) provides the "living background... very subtle... no distracting
  particles" on both new screens — reused, not reinvented.
- The recording indicator uses Tailwind's built-in `animate-pulse` utility (not a new custom keyframe),
  gated by `usePrefersReducedMotion` to a static dot — the one new piece of motion this sprint adds,
  deliberately minimal.
- `RecordAndLearnIllustration.tsx` (built last sprint, reused unmodified) still provides the "premium
  microphone illustration" on the Choose Learning Method™ card.

---

## 6. Future Hooks for LW-1D

1. **AI Thinking™** — the `completed` state in `RecordAndLearnExperience.tsx` is the exact swap point:
   once a real transcription/processing backend exists, replace its "what's next" panel with a real
   upload of the captured audio (currently discarded) and a real navigation into the AI Thinking™ flow.
2. **Uploading the captured audio** — would need a new Server Action (mirroring
   `createLearningProjectWithDocument`'s pattern) and likely a new `learning_sessions`/`documents`-adjacent
   table entry for audio-sourced material — not started this sprint, per "no database changes."
3. **The wizard's `source`/`name`/`upload` steps are unchanged** and remain the real, reusable engine for
   whatever LW-1D needs from the document-upload side.

---

## 7. Validation (exact results, this sprint)

1. `npx tsc --noEmit` — hit a stale `.next/types` artifact referencing the just-deleted
   `/welcome/preparing` route (a build-cache leftover, not a real source error); cleared `.next/` and
   reran — **clean, whole repo.**
2. `npx eslint` on all 7 new/changed files — **zero findings.**
3. `npx vitest run` (whole repo) — **470 test files, 3169 tests, all passing** — identical count to before
   this sprint (no pure logic added; this sprint is UI/flow-structure plus a new browser-API integration
   with no unit-testable pure functions).
4. `npm run build` — **green, first attempt**; route table confirms `/welcome/preparing` is gone and
   `/welcome/choose-method`/`/welcome/record` are present with no errors.
5. `git status`/`git diff --stat` — the tracked `M` list is unchanged from before this sprint; all changes
   live inside the already-untracked `src/app/welcome/`, `src/components/welcome/`, and
   `src/components/learning/` directories.

---

## 8. Known Limitations

1. **No browser was available to manually test the interactive microphone-permission flow** in this
   environment (no browser-automation tool, same disclosed limitation as every prior UI sprint this
   session) — flagged prominently here since this is exactly the kind of feature (real browser permission
   prompts, `MediaRecorder` state transitions, denied/unsupported edge cases) that most benefits from real
   manual testing across at least Chrome, Safari, and a mobile browser before shipping to real users.
2. **No `MediaRecorder` `dataavailable`/`stop` event handling was added to actually collect the recorded
   `Blob`** — since the audio is discarded either way this sprint, the recorder is created and stopped but
   its output chunks are never read. LW-1D will need to add `ondataavailable`/`onstop` handlers to
   actually assemble the recording once there's a backend to send it to.
3. **No maximum recording duration or file-size cap exists yet** — the timer displays elapsed time but
   never auto-stops. Worth adding once real upload/processing costs are a concern.
4. **`/welcome/record`'s browser-support feature detection has not been tested against real older
   browsers** — the `typeof MediaRecorder === 'undefined'` check is a standard, correct pattern, but
   unverified in this environment for lack of a browser.

---

## 9. Resume Instructions for LW-1D

**Nothing has been done for LW-1D — per this sprint's explicit instruction, it must not begin without new
review and approval.** When a brief arrives:

1. Read this document and §6 (future hooks) before assuming what already exists.
2. **Strongly recommend a manual QA pass** on `/welcome/record` across real browsers before or alongside
   any LW-1D work, given §8.1 — this sprint could not verify the permission/recording UX by hand.
3. If it's about wiring real transcription/upload for the captured audio: treat it as a genuine
   architectural decision (new Server Action, new storage, new database shape) requiring the same
   scrutiny as prior sprints' backend decisions in this session.
4. Verify using the same sequence as this sprint (§7) — the whole-repo baseline going forward remains
   **470 test files / 3169 tests**, `tsc` clean, `eslint` clean, build green.
5. Report results and stop — do not begin further work without a new, explicit user instruction.

**Nothing else is pending. Stop after LW-1C, per the brief's own instruction.**
