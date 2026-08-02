# Production Handoff — Sprint LW-1C.1 (Premium Visual Polish™)

**Generated:** 2026-07-15
**Purpose:** Allow a new Claude Code session to continue LW-1D onward with zero context loss.
**Scope of this document:** This sprint only — pure visual/motion polish, explicitly no flow/
architecture/API/routing/business-logic changes. Read `docs/PRODUCTION_HANDOFF_LW_1C.md` first for the
flow this sprint polishes without altering.

---

## 1. What This Sprint Is

A visual/motion-only pass across the `/welcome/*` flow (Arrival Experience™, Choose Learning Method™,
Record & Learn™) and the shared components behind them, targeting the brief's "every screen should
create WOW within 3 seconds" bar. No new routes, no new state machines, no changes to
`NewLearningProjectWizard.tsx` or anything under `src/app/preview/**` (the Upload/Recording engine,
Learning Blueprint, Learning Workspace) — all locked per the brief.

### Two judgment calls

1. **Colors stayed within the existing palette.** This app has no color design token (`--primary`/
   `--accent` are grayscale, confirmed in an earlier sprint). The brief's "richer... premium neutral
   tones... avoid saturated colors" alongside "Record & Learn™... soft BLUE pulse" was reconciled by
   reusing the *one* blue that already exists in this app's palette — `#4FE0FF`, `LivingBrainLogo`'s own
   internal glow color, already used by `AIPresenceLogo`'s ambient glow — extended to
   `RecordAndLearnIllustration.tsx` and the mic circle in `RecordAndLearnExperience.tsx`'s idle state, so
   all three read as one coherent brand accent rather than a second, invented hue. Everything else
   (backgrounds, card chrome, selection glow) stayed neutral/monochrome.
2. **"No buttons inside cards" was already true before this sprint** — `PrimaryLearningMethodCard`'s
   `ctaLabel` (added in LW-1C) has always rendered as plain colored text, never a nested `<button>`; the
   whole card has always been the single click target. This sprint's card work focused on making that
   existing whole-card interaction feel premium (lift → glow → selected), not removing something that
   wasn't there — noted explicitly so it isn't mistaken for skipped work.

---

## 2. Visual Improvements

### `src/components/learning/PrimaryLearningMethodCard.tsx` — the brief's own "biggest improvement"
- Larger radius (`rounded-3xl` → `rounded-[2rem]`), more internal padding (`px-8 py-10` → `px-10 py-12`),
  larger emoji/icon (`text-5xl` → `text-6xl`), larger gap (`gap-4` → `gap-5`) — "premium proportions."
- `formats` prop upgraded from `readonly string[]` to `readonly { emoji, label }[]`, rendered as larger,
  softer "elegant pills" (emoji + label together, `px-4 py-1.5`) instead of small technical-looking chips.
- New `flowSteps?: readonly string[]` — a *sequential* pill row with small `→` separators between each
  step, visually distinct from `formats`' independent, order-free pills (used only by Record & Learn™,
  since only that card describes an implied sequence).
- New soft hover glow layer (pure CSS `group-hover`, no JS) underneath the existing lift/shadow/border
  treatment.
- New brief-worded "selection" confirmation on click: soft primary-tinted glow, `border-primary`, a
  slight `scale-[1.02]`, held for 280ms before the parent's `onSelect` (the actual navigation) fires —
  "Hover → Lift → Glow → Selected," gated by `usePrefersReducedMotion` (navigates immediately, no
  animated hold, when reduced motion is on).

### `src/components/welcome/AIPresenceLogo.tsx`
- New one-time **entrance** animation (`opacity 0→1, scale 0.85→1, y +8→0`, 0.8s `easeOut`) on mount,
  fully independent of the pre-existing continuous breathing loop — plays once, then the symbol settles
  into its permanent idle breath with no visible seam. Reduced motion: plain opacity fade only.
- Default/call-site sizes bumped ("slightly larger"): 96→112 on Arrival Experience, 72→84 on Choose
  Learning Method™ and Record & Learn™.
- Ambient glow: larger blur radius (`blur-2xl`→`blur-3xl`) and slightly higher peak opacity
  (`0.28`→`0.32`) — "gentle glow... symbol feels alive" — the breathing rhythm itself is unchanged.

### `src/components/welcome/ArrivalBackground.tsx`
- A second, independent soft wash (different position, size, direction, and duration from the existing
  one — reverse direction, 26s vs 18s, offset start) layered behind it, creating "soft aurora / neural
  gradient" depth entirely through layered monochrome blur + very slow drift — no new color introduced.
  "Feel movement, not see movement": both washes are slow and low-amplitude enough that no single frame
  reads as visibly moving.

### `src/components/learning/RecordAndLearnIllustration.tsx`
- Larger mic icon (`size-10`→`size-12` in a `size-20`→`size-24` frame).
- Glow color changed from neutral to the reused `#4FE0FF` blue, composed via nested opacity (an outer
  `opacity-20` wrapper around the existing `breathing-pulse`-animated inner div) so the effective
  intensity stays low even though the underlying keyframe's own opacity range is higher — "very low
  intensity... never bright," without a new keyframe.

### `src/components/welcome/ChooseLearningMethodExperience.tsx`
- Upload & Learn™'s pills changed from technical file types (PDF/Images/Camera Scan/DOC/DOCX/TXT) to
  learning materials (📚 Books, 📄 Study PDFs, 📝 Notes, 📷 Notebook Photos, 📃 Text) — "visual
  storytelling," not technical chips.
- Record & Learn™ gained `flowSteps` (Lecture → AI → Summary → Mind Map → Flashcards → MCQs → Revision →
  Learning Blueprint™) and its subtitle became the brief's own suggested headline, "Record once. Learn
  forever."
- Copy tightened throughout (shorter subtitles, per "reduce unnecessary text... the interface should
  breathe"); spacing increased (`gap-8`→`gap-10`, card grid `gap-4`→`gap-6`).

### `src/components/welcome/RecordAndLearnExperience.tsx`
- Same "Record once. Learn forever." headline as the card, for continuity between the two screens.
- The idle-state mic circle now has the same blue breathing glow as the card's illustration (previously
  had none) — visual consistency across the whole Record & Learn™ journey.
- Pill spacing in the `completed` state's flow chips widened to match the card's new pill proportions.
- Overall gap increased (`gap-8`→`gap-9`).

### `src/components/welcome/ArrivalExperience.tsx`
- Logo bumped to 112, section gap increased (`gap-6`→`gap-8`) — no copy, structure, or CTA-behavior
  changes; the acknowledge/exit-transition logic built earlier already matched this sprint's motion bar.

---

## 3. Motion Improvements

- One consistent easing/duration vocabulary across every new interaction this sprint: 200-300ms for
  hover/selection transitions, `easeOut`/`easeInOut` throughout — matching what was already established
  in `ArrivalExperience.tsx`'s acknowledge-then-transition pattern, now extended to the cards.
- Every new animation (entrance, hover glow, selection, background wash) is `transform`/`opacity`/`filter`
  only — no layout-affecting properties — and every one is `usePrefersReducedMotion`-gated on top of the
  existing global reduced-motion CSS safety net.
- No new easing curves, no springs, no elastic/bounce — consistent with every prior motion sprint this
  session.

---

## 4. UX Reasoning

- **Selection as confirmation, not just navigation**: the brief's "Hover → Lift → Glow → Selected"
  sequence implied a visible moment of confirmation before the screen changes — previously, clicking a
  card navigated instantly with no visual acknowledgment. The 280ms selected-state hold (mirroring the
  acknowledge pattern already established for Arrival Experience's own CTA) gives the interaction a
  felt "yes, got it" moment without meaningfully slowing the user down.
- **Sequential vs. independent pills as two distinct visual grammars**: Upload & Learn™'s materials are
  parallel choices (any of them, no order implied); Record & Learn™'s flow is inherently sequential. Using
  two different pill treatments (plain vs. arrow-connected) lets the visual language itself communicate
  that distinction without extra copy — "reduce unnecessary text."
- **One blue, reused, not invented**: extending the Living AI Symbol's own existing glow color to Record
  & Learn™ ties the "hero feature" visually to "the face of the product" the brief describes, reinforcing
  that Record & Learn™ is powered by the same AI Mentor, not a separate, disconnected feature.

---

## 5. Files Changed

```
MOD   src/components/welcome/AIPresenceLogo.tsx
MOD   src/components/welcome/ArrivalBackground.tsx
MOD   src/components/learning/PrimaryLearningMethodCard.tsx
MOD   src/components/welcome/ChooseLearningMethodExperience.tsx
MOD   src/components/learning/RecordAndLearnIllustration.tsx
MOD   src/components/welcome/RecordAndLearnExperience.tsx
MOD   src/components/welcome/ArrivalExperience.tsx
NEW   docs/PRODUCTION_HANDOFF_LW_1C_1.md
```

No other file touched — confirmed via `git status`/`git diff --stat`. `NewLearningProjectWizard.tsx` and
everything under `src/app/preview/**` do not appear in the diff.

---

## 6. Validation (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
2. `npx eslint` on all 7 changed files — **zero findings.**
3. `npx vitest run` (whole repo) — **470 test files, 3169 tests, all passing** — identical count to
   before this sprint (no pure logic touched; this sprint is visual/motion only).
4. `npm run build` — hit the known, pre-existing, unrelated `reading-discovery` prerender flake on the
   first attempt (documented since early in this session); **green on the second attempt**, confirming it
   was unrelated to this sprint's changes.
5. `git status`/`git diff --stat` — the tracked `M` list is unchanged from before this sprint; all
   changes live inside the already-untracked `src/components/welcome/` and `src/components/learning/`
   directories; `NewLearningProjectWizard.tsx` and `src/app/preview/**` do not appear anywhere in the
   diff.

---

## 7. Accessibility Validation

- Every new animation (entrance, hover glow, selection glow/scale, background washes, mic pulse) is
  `usePrefersReducedMotion`-gated, on top of the existing global reduced-motion CSS safety net in
  `globals.css` — unchanged, still in place.
- `PrimaryLearningMethodCard`'s new `aria-pressed={isSelected}` reflects the selection state to assistive
  technology; the card remains a single real `<button>` (keyboard-operable via Enter/Space, unchanged
  focus-visible ring).
- `RecordAndLearnExperience.tsx`'s `aria-live="polite"` status region (built in LW-1C) is untouched and
  still correct — this sprint added no new dynamic content requiring announcement beyond what was already
  covered.
- No color-only signaling was introduced: selection is conveyed by border + glow + scale together, not
  color alone; the pulsing recording indicator (unchanged from LW-1C) still pairs its red dot with a
  text label ("Recording in progress").

---

## 8. Known Limitations

1. **No browser was available to visually preview any of this sprint's polish** in this environment (no
   browser-automation tool, same disclosed limitation as every prior UI sprint this session). This sprint
   is unusually visual/subjective in nature ("does it create WOW," "does it feel Apple-quality") — a
   manual visual pass is strongly recommended before treating this as final, more so than for prior,
   more mechanically-verifiable sprints.
2. **The card selection's 280ms hold is a fixed value**, not user/context-configurable — matches the
   brief's own request for one consistent, non-aggressive transition, not a tunable parameter.
3. **`RecordAndLearnIllustration.tsx`'s nested-opacity glow technique** (outer `opacity-20` wrapper
   around the `breathing-pulse` keyframe) is a deliberate CSS composition trick to keep intensity low
   without a new keyframe — flagged here so a future editor doesn't "simplify" it by flattening the two
   divs into one, which would restore the original keyframe's brighter 0.7–1 opacity range.

---

## 9. Resume Instructions

**Nothing has been done for LW-1D — per this sprint's explicit instruction, it must not begin without new
visual review and approval.**

1. **Strongly recommend a manual visual review** of `/welcome`, `/welcome/choose-method`, and
   `/welcome/record` before proceeding to LW-1D, given §8.1.
2. Read `docs/PRODUCTION_HANDOFF_LW_1C.md` for the underlying flow/architecture this sprint polished
   without altering.
3. Verify using the same sequence as this sprint (§6) — the whole-repo baseline going forward remains
   **470 test files / 3169 tests**, `tsc` clean, `eslint` clean, build green (retry once for the known
   `reading-discovery` flake if it trips).
4. Report results and stop — do not begin further work without a new, explicit user instruction.

**Nothing else is pending. Stop after LW-1C.1, per the brief's own instruction.**
