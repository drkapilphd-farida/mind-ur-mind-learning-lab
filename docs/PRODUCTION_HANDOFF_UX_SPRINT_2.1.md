# Production Handoff — UX Sprint 2.1 (Breath Awareness™ — Amplitude & Synchronization Refinement)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue with zero context loss.
**Scope of this document:** A follow-up to `docs/PRODUCTION_HANDOFF_UX_SPRINT_2.md`, same two files.
Separate initiative from the Reading Intelligence Lab™ arc.

---

## 1. What This Sprint Is

UX Sprint 2 fixed the mechanical "grow-stop-shrink-stop" artifact by replacing JS-state-driven CSS
`transition`s with one continuous, self-looping CSS `@keyframes` animation per layer. That mechanism was
sound, but live review found the result still read as "a circle scaling," not "an orb breathing" — the
orb's scale range was only 1.0→1.16 (~16% growth), inhale and exhale looked too similar, and only the
orb/glow/aura layers moved.

This sprint kept the Sprint 2 mechanism entirely (same keyframe percentage structure: 0% / 33.333% /
50% / 100%, computed from the unchanged `PHASE_DURATION_MS` of 4000/2000/6000ms; same per-keyframe
easing curves) and tuned its **parameters**: much larger amplitude, a new warm-light layer, and floating
motion resynchronized onto the same timeline as everything else, so every animated layer now moves
together as "one living object" by construction.

### One explicit, unambiguous direction change from Sprint 2

Sprint 2 deliberately decoupled the floating drift into an independent ~7s/3px cycle, per that sprint's
brief. This sprint's brief explicitly asks for floating tied to the breath cycle ("Breath In → Orb
rises... Breath Out → Orb settles") — a clear reversal, not an ambiguous case, so it was implemented
directly without a user question.

### One requirement handled by a documented, disclosed substitution

The brief asked for "shadow" to breathe along with everything else (item 3). Animating CSS `box-shadow`
directly is a paint-time property, not GPU-compositor-friendly, and risks the brief's own 60fps/
GPU-transform requirement (item 9). No literal animated `box-shadow` was added — the existing glow/aura
layers (already `transform`/`opacity`/`filter`-only, GPU-composited) already serve the "breathing
halo" role that reads as "shadow" in practice; the orb keeps its static `shadow-lg` for grounding only,
unanimated.

---

## 2. What Stayed 100% Untouched (verified, not assumed)

Confirmed via direct `grep` comparison after implementation:
- `PHASE_ORDER`, `PHASE_DURATION_MS` (`{inhale:4000, hold:2000, exhale:6000}`), `BREATH_TOTAL_SECONDS`
  (120), `CYCLE_SECONDS` (12), `TOTAL_CYCLES`, `COMPLETION_BEAT_MS` (1800) — byte-identical.
- Both timer `useEffect`s (session clock, phase clock) — unchanged.
- `onComplete: () => void` contract and the completion screen — unchanged, not touched this sprint.
- The keyframe percentage structure (0% / 33.333% / 50% / 100%) and per-keyframe easing curves
  (`ease-out` into hold, `cubic-bezier(0.86, 0, 0.07, 1)` for exhale) — kept exactly; only target values
  at each stop changed, plus new layers were added.
- `globals.css`'s 3 pre-existing keyframes (`exercise-reduced-motion-pulse`, `breathing-pulse`,
  `anchor-glow-pulse`) and its reduced-motion media query — byte-identical, confirmed by direct `grep`
  (unchanged position and content; the new 6th keyframe was inserted after Sprint 2's existing 5).

---

## 3. Work Completed

### `src/app/globals.css` (modifies the 5 Sprint-2 keyframes in place, adds 1 new keyframe)
- `breath-awareness-orb-cycle` — scale range widened from 1.0↔1.16 to **0.62 (exhale) ↔ 1.4
  (inhale/hold)**. Base declared size (`size-28`, 112px) unchanged, so rendered size ranges ~69px
  (exhale) to ~157px (inhale) — comfortably inside the existing `size-48` (192px) wrapper, no layout
  changes needed.
- `breath-awareness-glow-cycle` — scale widened to 0.62↔1.45, opacity to 0.35↔1, and `filter: blur(...)`
  is now itself keyframe-animated (20px at exhale → 40px at inhale) instead of a static Tailwind class —
  "glow becomes softer" is now a real blur-radius increase, still a compositor-friendly property.
- `breath-awareness-aura-cycle` — scale widened to 0.75↔1.25, opacity to 0.15↔0.4 — kept subtler than
  glow, same shape, wider range.
- `breath-awareness-ambient-cycle` — unchanged from Sprint 2.
- `breath-awareness-float` — changed from an independent ~7s/3px cycle to the **same 12s breath-cycle
  timeline** as every other layer, amplitude increased to 6px: `translateY(0)` at exhale →
  `translateY(-6px)` at inhale/hold → back to `0` at exhale.
- **New:** `breath-awareness-warmth-cycle` — opacity 0.15 (exhale) ↔ 0.55 (inhale/hold), same timeline,
  driving the new warm-light overlay described below.

### `src/features/visual-intelligence/components/preparation/BreathAwarenessScreen.tsx`
- Floating wrapper: `animation` changed from the hardcoded `'breath-awareness-float 7s ease-in-out
  infinite'` to `` `breath-awareness-float ${CYCLE_ANIMATION_DURATION} infinite` ``, reusing the existing
  `CYCLE_ANIMATION_DURATION` constant (`'12s'`) so it's driven by the same single source of truth as
  every other layer. JSX comment above it updated to describe the new synced behavior (previously
  described it as "independent... decoupled from the breath cycle").
- Glow layer: dropped the static `blur-2xl` Tailwind class (blur is now keyframe-animated via `filter`);
  added a static `blur(30px)` reduced-motion fallback.
- **New** warm-light overlay `<div>`: a small radial gradient (`rgba(255, 247, 230, ...)`, warm white)
  positioned over the orb, `animation: breath-awareness-warmth-cycle ${CYCLE_ANIMATION_DURATION}
  infinite`, gated by `!prefersReducedMotion` (not rendered at all for reduced-motion users — purely
  atmospheric, the text label already conveys phase for that audience).
- Reduced-motion static fallbacks updated for the new, much wider ranges — chosen as sensible resting
  midpoints rather than reusing the old (now stale) 1.05–1.16 values tuned for the old subtle range:
  orb `scale(1)`, glow `scale(1)` / opacity `0.65` / `blur(30px)`, aura `scale(1)` / opacity `0.28`.
- `RING_DELAY_MS` (100ms, unchanged) still staggers the glow layer via `animationDelay`, confirmed
  unchanged.

---

## 4. Files Changed

```
src/app/globals.css                                                                (5 keyframes modified, 1 added)
src/features/visual-intelligence/components/preparation/BreathAwarenessScreen.tsx  (amplitude/layers/fallbacks updated)
```

No other file touched. `EyeRelaxationScreen.tsx` and the rest of the preparation sequence remain
untouched, as in every prior sprint in this line.

---

## 5. Validation (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
2. `npx eslint` on `BreathAwarenessScreen.tsx` — **zero findings.** (`globals.css` isn't in ESLint's
   configured scope in this repo — reported as an ignored-file warning, not a lint failure; expected.)
3. `npx vitest run` (whole repo) — **468 test files, 3158 tests, all passing** — unchanged baseline (no
   pure-logic file exists to test; business logic was preserved, not changed).
4. `npm run build` — **green on the first attempt** (the known, unrelated `reading-discovery` prerender
   flake did not trip this run).
5. Business-logic byte-identity check — `grep`-confirmed every protected constant and both timer
   effects are unchanged; `onComplete`'s contract is unchanged.
6. `globals.css` diff check — confirmed the 3 pre-existing keyframes and the reduced-motion media query
   are present, unchanged, and in their original position; only the 5 `breath-awareness-*` keyframes
   from Sprint 2 were modified, plus 1 new one (`breath-awareness-warmth-cycle`) added.

---

## 6. Known Limitations

1. **No automated visual/motion regression test exists** for this change (none exists in this repo) —
   verified by code review, `tsc`/`eslint`/build correctness, and direct comparison against Sprint 2.
2. **The CSS-animation / JS-label drift** disclosed in Sprint 2's handoff (§4 there) still applies
   unchanged — the visual animation and the JS `phase`-state text label are independent clocks sharing
   nominal durations; imperceptible over a 120s session, still an accepted trade-off.
3. **`EyeRelaxationScreen.tsx`** still uses older motion language — flagged again, unchanged status from
   Sprints 1 and 2.
4. **The warm-light overlay is not shown to reduced-motion users at all** (rather than a static
   fallback) — a deliberate choice since it's a purely atmospheric enhancement layer with no informational
   content beyond what the text label already provides; flagged in case a future sprint wants a static
   warm tint for that audience too.

---

## 7. Resume Instructions for the Next Sprint

**Nothing has been done beyond this sprint — no further brief has been received.** Per the user's "Stop
after this sprint" instruction, no further UX work should begin without a new, explicit brief. When one
arrives:

1. If it continues this motion-polish line: read this document and Sprint 2's handoff first, apply the
   same discipline — identify the exact technical/parameter change requested, confirm any genuinely
   ambiguous behavioral change with the user before assuming it, verify byte-identity of preserved
   business logic before/after.
2. If it returns to the Reading Intelligence Lab™ arc instead: that is a different initiative — read
   `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` and `docs/PRODUCTION_HANDOFF_SPRINT_51.md`, and resume
   from that arc's own numbering (Sprint 52), not this UX line's.
3. Verify using the same sequence as this sprint (§5) — the whole-repo baseline going forward is
   **468 test files / 3158 tests**, `tsc` clean, `eslint` clean, build green.
4. Report results and stop — do not begin further work without a new, explicit user instruction.

**Nothing else is pending.** The repository is fully clean, fully verified at this sprint's boundary.
