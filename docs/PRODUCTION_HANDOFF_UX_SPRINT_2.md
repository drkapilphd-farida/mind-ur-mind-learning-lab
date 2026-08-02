# Production Handoff — UX Sprint 2 (Breath Awareness™ 2.0 — Motion Rebuild)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue with zero context loss.
**Scope of this document:** A follow-up to `docs/PRODUCTION_HANDOFF_UX_SPRINT_1.md`, same file plus one
shared stylesheet. Separate initiative from the Reading Intelligence Lab™ arc.

---

## 1. What This Sprint Is

Rebuilt the **motion mechanism** of `BreathAwarenessScreen.tsx`'s breathing animation. UX Sprint 1
upgraded copy/gradient/completion but kept the original per-phase CSS `transition` approach; this
sprint replaced that mechanism entirely because it structurally caused the reported "grow, stop,
shrink, stop" mechanical feel.

### Root cause (identified before writing any code)

The orb/glow/aura were driven by discrete CSS `transition`s that received a **new**
`transform`/`transitionDuration` value every time React's `phase` state changed (via the protected
`setTimeout` state machine). Each phase boundary was a separate JS-triggered CSS transition; any small
timing mismatch between the JS `setTimeout` firing and the CSS engine's own transition-completion
timing reads as a momentary stall — exactly the "stop" described in the brief. This is inherent to a
transition-per-state-change approach and isn't fixable by tuning easing curves alone.

### The fix

Found and followed an **existing, established precedent already in this codebase**:
`src/app/globals.css` already defines `@keyframes breathing-pulse` for a different screen's calm
breathing circle (Quantum Speed Reading's Pre-Reading Preparation), documented in the same rich-comment
style used throughout the file, gated by `usePrefersReducedMotion` at the call site. `globals.css` also
already has a global reduced-motion safety net
(`@media (prefers-reduced-motion: reduce) { animation-duration: 0.01ms !important; ... }`).

This sprint added 5 new `@keyframes` rules to `globals.css` (purely additive — the 3 existing keyframes
and the reduced-motion media query are untouched, confirmed by direct comparison) and switched the
orb/glow/aura/ambient layers from JS-state-driven `transition`s to **one continuous, self-looping CSS
animation per layer**, with per-keyframe easing reproducing the file's own original curve shapes. This
eliminates the JS/CSS handoff at every phase boundary — the visual motion is now a single uninterrupted
loop, fully decoupled from React re-renders.

---

## 2. What Stayed 100% Untouched (verified, not assumed)

Confirmed via direct `grep` comparison after implementation:
- `PHASE_ORDER`, `PHASE_DURATION_MS` (`{inhale:4000, hold:2000, exhale:6000}`), `BREATH_TOTAL_SECONDS`
  (120), `CYCLE_SECONDS` (12), `TOTAL_CYCLES`, `COMPLETION_BEAT_MS` (1800) — byte-identical.
- Both original `useEffect` timers (session clock, phase clock) — same `setTimeout` calls, same
  dependency arrays, same behavior (now gated by an `isComplete` early-return, functionally identical
  to the prior "unmounts immediately on completion" behavior).
- `onComplete: () => void` contract — same signature, still fires automatically, only delayed by the
  same fixed 1.8s beat established in UX Sprint 1.
- The completion screen (already satisfied "fade in, wait briefly, auto-continue, no button" from UX
  Sprint 1) — not touched this sprint.
- `ProgressRing` usage, `formatTime`, `VisualActivationSequence.tsx` and every other file in the
  sequence — untouched.
- `globals.css`'s 3 pre-existing keyframes and its reduced-motion media query — byte-identical
  (position shifted down in the file due to the new insertion above them; content unchanged, confirmed
  by direct read).

---

## 3. Work Completed

### `src/app/globals.css` (additive only, 5 new keyframes)
- `breath-awareness-orb-cycle` — the orb's scale, one continuous 12s loop (0%–33.333% inhale,
  33.333%–50% hold/flat, 50%–100% exhale — percentages computed from the unchanged
  `PHASE_DURATION_MS`), with per-keyframe easing reusing the file's own original curves (`ease-out`
  into hold, `cubic-bezier(0.86, 0, 0.07, 1)` for the exhale's slow-start/slow-end) — not new curves,
  the same ones, now applied within one loop instead of a chain of transitions.
- `breath-awareness-glow-cycle` — scale + opacity together, same percentages, reusing the original
  `PHASE_GLOW_OPACITY` values (1 during inhale/hold, 0.4 during exhale).
- `breath-awareness-aura-cycle` — a subtler version of the same shape for the outermost layer.
- `breath-awareness-ambient-cycle` (new capability, brief item 6) — a very-low-amplitude opacity
  oscillation for a wide background wash ("ambient lighting... very soft, never distracting").
- `breath-awareness-float` (new capability, brief item 7) — an independent, slower (~7s), 3px vertical
  drift, deliberately decoupled from the breath cycle's own timing.

### `BreathAwarenessScreen.tsx`
- Orb/glow/aura: switched from per-render inline `transform`/`transitionDuration`/`transitionDelay`
  driven by `phase` state to a fixed `animation` referencing the new keyframes — applied once, never
  recalculated on phase changes. `RING_DELAY_MS` (unchanged value, 100ms) now expressed as
  `animationDelay` instead of `transitionDelay`, preserving the "glow trails the orb" ripple.
  `PHASE_SCALE`/`PHASE_EASE_CLASS`/`PHASE_GLOW_OPACITY` — removed as genuinely dead code (their values
  live in the new CSS keyframes now; keeping unused JS constants around would have been dead-code
  clutter, confirmed removable by a clean `eslint` pass with zero findings).
- New ambient-light layer (fills the card, low opacity, `breath-awareness-ambient-cycle`).
- New floating wrapper around the orb/glow/aura stack (`breath-awareness-float`).
- Orb gradient expanded from 3 stops to 4 (`ORB_BLUE.light → soft → soft → deep`) for smoother "deep
  blue center → soft blue → light blue edge" blending with no hard transitions (brief item 4).
- Phase label text: wrapped with `key={phase}` + `animate-in fade-in duration-500` so each label change
  (`Breathe In` → `Hold` → `Breathe Out`) crossfades gently instead of updating instantly (brief item
  10) — the underlying `phase` state and its data source are unchanged.
- Every new animated layer is conditionally applied only when `!prefersReducedMotion` (matching the
  established call-site-gating convention next to `breathing-pulse`), with an explicit static fallback
  transform/opacity for each layer — on top of `globals.css`'s own blanket reduced-motion safety net
  (defense in depth, same as the rest of the app).

---

## 4. Disclosed Trade-off (not hidden)

The CSS animation and the JS `phase`-state text label are now two independent clocks sharing the same
nominal durations. Over a 120s/10-cycle session, `setTimeout`'s normal sub-frame imprecision could let
them drift by at most tens of milliseconds by the final cycle. This is imperceptible for a meditative
breathing exercise and strictly preferable to the previous visible stalls — flagged here so a future
engineer investigating any reported micro-drift knows this is an accepted, understood trade-off, not an
undiscovered bug.

---

## 5. Files Changed

```
src/app/globals.css                                                           (additive: +5 keyframes)
src/features/visual-intelligence/components/preparation/BreathAwarenessScreen.tsx  (motion mechanism rebuilt)
```

No other file touched.

---

## 6. Validation (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
2. `npx eslint src/features/visual-intelligence/components/preparation/BreathAwarenessScreen.tsx` —
   **zero findings** (confirms the removed `PHASE_SCALE`/`PHASE_EASE_CLASS`/`PHASE_GLOW_OPACITY`
   constants left no dangling references).
3. `npx vitest run` (whole repo) — **468 test files, 3158 tests, all passing** — unchanged baseline (no
   pure-logic file exists to test; business logic was preserved, not changed).
4. `npm run build` — **green on the first attempt.**
5. Business-logic byte-identity check — `grep`-confirmed every protected constant and both timer
   effects are unchanged; `onComplete`'s contract is unchanged.
6. `globals.css` diff check — confirmed purely additive; all 3 pre-existing keyframes and the
   reduced-motion media query are present and byte-identical (only their position in the file shifted).

---

## 7. Known Limitations

1. **No automated visual/motion regression test exists** for this change (none exists in this repo) —
   verified by code review, `tsc`/`eslint`/build correctness, and direct comparison against the
   pre-existing implementation.
2. **The CSS-animation / JS-label drift** described in §4 — accepted, not a defect.
3. **`EyeRelaxationScreen.tsx`** (the next step in the same sequence) still uses the older motion
   language this sprint replaced for Breath Awareness — flagged again (also noted in UX Sprint 1's
   handoff) as a likely candidate for a future sprint if visual consistency across the whole
   preparation sequence is wanted.
4. **The new `@keyframes` are global** (in `globals.css`, not component-scoped), matching this
   codebase's own established convention for this kind of animation — but as with the 3 pre-existing
   keyframes, their names must stay globally unique if more are added later.

---

## 8. Resume Instructions for the Next Sprint

**Nothing has been done beyond this sprint — no further brief has been received.** When one arrives:

1. If it continues this "Premium Experience" motion-polish line (e.g., applying the same treatment to
   `EyeRelaxationScreen.tsx`, per §7.3): read both this document and UX Sprint 1's handoff first, and
   apply the same discipline — identify the root technical cause before proposing a fix, confirm any
   genuinely ambiguous behavioral change with the user before assuming it, and verify byte-identity of
   preserved business logic before/after.
2. If it returns to the Reading Intelligence Lab™ arc instead: that is a different initiative — read
   `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` and `docs/PRODUCTION_HANDOFF_SPRINT_51.md`, and resume
   from that arc's own numbering (Sprint 52), not this UX line's.
3. Verify using the same sequence as this sprint (§6) — the whole-repo baseline going forward is
   **468 test files / 3158 tests**, `tsc` clean, `eslint` clean, build green.
4. Report results and stop — do not begin further work without a new, explicit user instruction.

**Nothing else is pending.** The repository is fully clean, fully verified at this sprint's boundary.
