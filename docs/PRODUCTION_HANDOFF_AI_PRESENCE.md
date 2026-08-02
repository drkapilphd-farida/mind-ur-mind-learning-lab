# Production Handoff — AI Presence™ (Living Mind Ur Mind™ Symbol)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue LW-1B onward with zero context loss.
**Scope of this document:** This UX micro sprint only. Builds on `docs/PRODUCTION_HANDOFF_LW_1A.md`
(the Arrival Experience™ screen this sprint adds a logo to) — read that first for the broader `/welcome/*`
flow context.

---

## 1. What This Sprint Is, and a Premise Correction

The brief assumed "the existing Brain + Book logo" was already present on the Arrival Experience screen
and just needed a breathing animation added. In reality, that screen had **no logo at all** — just a
plain "Mind Ur Mind™" text kicker. The real logo, `src/components/brand/LivingBrainLogo.tsx` ("Living
Brain™ Logo — official mark"), exists but lives elsewhere: it's already used in **5 live screens** under
the Discovery/assessment flow (`ReadingExperimentLayout.tsx`, `MemoryExperimentLayout.tsx`,
`FocusExperimentLayout.tsx`, `focus/components/PreparationScreen.tsx`, and
`discover-learning-potential/components/Hero.tsx`).

That component already ships its own idle breathing animation (`framer-motion`, `scale: [1, 1.02, 1]`,
4s `easeInOut`, infinite, gated by an `animated` prop) plus a hover-triggered glow on its core dot and an
internal click-pulse — but that profile doesn't match this brief's spec (96%→100%→96%, 6–8s, a
continuously breathing glow, ±2–3px float, full static fallback under reduced motion). The brief was also
explicit: **"Do not affect any other screen."** Changing the shared component's *default* animation in
place would have changed behavior for all 5 existing usages.

### The architecture decision

Built a **new, thin wrapper component**, `src/components/welcome/AIPresenceLogo.tsx`, that renders the
existing `LivingBrainLogo` completely unmodified (`animated={false}` — an already-existing prop, not a
new capability) and applies the new breathing/glow/float/acknowledge treatment entirely *around* it, in a
new file. **Zero lines of `LivingBrainLogo.tsx` were changed** — confirmed by `git diff --stat` on that
exact path returning nothing, and by re-confirming all 5 existing importers are untouched. This is the
lowest-risk way to satisfy both "reuse the artwork, don't recreate it" and "do not affect any other
screen" simultaneously.

### One requirement skipped, per the brief's own permission

**"Neural Energy"** (subtle light travel through the brain's existing gyri/node-network paths) was not
implemented. Achieving it safely would require either modifying the shared `LivingBrainLogo.tsx` (the
exact risk this sprint's architecture avoids) or reaching into its internal SVG DOM from outside via
fragile, implementation-detail-coupled CSS selectors that would silently break on any future edit to that
file. The brief explicitly allows this: *"Only animate existing paths if available... If not available,
skip this effect."* Skipped and disclosed here, not silently dropped.

---

## 2. What Stayed Untouched

- `src/components/brand/LivingBrainLogo.tsx` — not one line changed.
- All 5 Discovery-flow screens that already use `LivingBrainLogo` — confirmed unaffected (they don't
  import the new wrapper; the shared component they do import is byte-identical).
- `/welcome/learning-goal`, `/welcome/preparing`, and anything Upload/AI-Processing-related.
- No new cross-route/page-transition framework — the "graceful fade" before navigation is local,
  screen-owned CSS opacity, not a Next.js route-transition mechanism.

---

## 3. Animation Architecture

### `src/components/welcome/AIPresenceLogo.tsx` (new)
Three independently-animated layers, all `framer-motion`, all driven by `transform`/`opacity` (GPU-cheap,
no layout recalculation):

1. **Ambient breathing glow** — an absolutely-positioned, blurred (`blur-2xl`), low-opacity soft-blue
   circle behind the logo. `opacity: [0.12, 0.28, 0.12]`, `scale: [0.9, 1.08, 0.9]`, one continuous 7s
   `easeInOut` loop (`repeat: Infinity`) — expands on "inhale," fades on "exhale," never bright. Color
   `#4FE0FF` is not invented — it's the exact hex `LivingBrainLogo` already uses internally for its own
   `full-color` glow (`COLOR_STOPS['full-color'].glow`), reused here so the ambient presence glow reads as
   one coherent brand colour rather than a second, mismatched blue.
2. **The logo itself** — `<LivingBrainLogo animated={false} />` inside an outer `motion.div` that drives
   `scale: [0.96, 1, 0.96]` and `y: [0, -2.5, 0]` (the floating motion) on the *same* `transition` object
   as each other, guaranteeing they can never drift out of sync — one continuous 7s loop, matching the
   brief's "6–8 seconds" range at its midpoint, `easeInOut`, never a bounce/overshoot (no spring/elastic
   easing used anywhere).
3. **Acknowledge flash** — a third, separate glow layer, rendered only while the new `acknowledging` prop
   is true: `opacity: [0.2, 0.5, 0]` over 300ms, `easeInOut` — the "very small glow, ~300ms" on CTA press,
   fully independent of the idle breathing loop (doesn't reset or interrupt it).

`LivingBrainLogo`'s own book flaps, gyri lines, and node network are never targeted individually — the
whole SVG scales/floats together as one unit, satisfying "the book should remain stable... only
participate in the overall breathing scale" by construction (nothing in this wrapper singles the book out).

### `src/components/welcome/ArrivalExperience.tsx` (edited)
- `<AIPresenceLogo size={96} acknowledging={isAcknowledging} />` added above the existing "Mind Ur Mind™"
  text kicker (kept, not removed) as part of the screen's existing stage-0 entrance.
- The "Let's Begin" CTA changed from a plain `<Link>` to an `onClick` handler (`handleBegin`): sets
  `isAcknowledging`/`isExiting` state (triggering the logo's flash and a 250ms local content fade), then
  `router.push('/welcome/learning-goal')` after both complete (~550ms total). Under
  `prefersReducedMotion`, this entire sequence is skipped — navigation is immediate, with no delay and no
  animation, matching the brief's reduced-motion requirement extended sensibly to the interaction itself.

---

## 4. Performance Considerations

- Every animated property across all three layers is `transform` (`scale`/`y`) or `opacity` — both
  compositor-only properties in modern browsers, never triggering layout or paint recalculation. The one
  `blur` used on the glow layers is a static Tailwind class (`blur-2xl`/`blur-xl`), not itself animated —
  only the glow's opacity/scale move, keeping the expensive blur filter's cost constant rather than
  re-computed every frame.
- No `box-shadow` animation, no animated gradients, no SVG path/attribute animation — nothing that would
  force per-frame re-paint.
- `framer-motion` is already a project dependency (used by `LivingBrainLogo` itself) — no new dependency
  added.
- The breathing/glow loops use `repeat: Infinity` on a single shared `transition` object per layer rather
  than independent per-frame JS timers — the browser's own compositor drives the loop, not React re-renders.

---

## 5. Accessibility Support

- Full `prefers-reduced-motion` support via the existing `usePrefersReducedMotion` hook: when enabled, the
  ambient glow, acknowledge flash, and breathing/float motion are **not rendered at all** — `LivingBrainLogo`
  renders with `animated={false}` regardless, so the result is a completely static logo, exactly as the
  brief requires, on top of `globals.css`'s existing blanket reduced-motion CSS safety net (defense in
  depth, consistent with every prior motion sprint this session).
- `decorative` was deliberately left at `LivingBrainLogo`'s own default (`true`/`aria-hidden`), per that
  component's own documented guidance: decorative when adjacent text already conveys the same meaning —
  which it does here, since the "Mind Ur Mind™" text kicker is kept directly beneath the logo. This avoids
  a screen reader announcing the brand name twice in a row.
- The CTA remains a real, focusable `<Button>` with an `onClick` handler — no keyboard-navigation
  regression from removing the `<Link>` wrapper; `router.push` fires identically regardless of activation
  method (Enter/Space/click).
- The reduced-motion interaction path is not merely "less visual" but genuinely faster (immediate
  navigation, no artificial delay) — never penalizing users who've opted out of motion with a slower flow.

---

## 6. Validation (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
2. `npx eslint` on both changed files — **zero findings.**
3. `npx vitest run` (whole repo) — **470 test files, 3169 tests, all passing** — identical count to before
   this sprint (no pure logic added; this is a UI/motion-only change, consistent with every prior motion
   sprint this session having no dedicated unit tests).
4. `npm run build` — hit the known, pre-existing, unrelated `reading-discovery` prerender flake
   (documented since early in this session's handoffs) on the first attempt; **green on the second
   attempt**, confirming it was unrelated to this sprint's changes.
5. `git diff --stat -- src/components/brand/LivingBrainLogo.tsx` — **empty**, confirming zero changes to
   the shared component.
6. `grep -rl "LivingBrainLogo" src/app/discover-learning-potential` — all 5 existing importers still
   present and unchanged.
7. `git status`/`git diff --stat` scoped to exactly `src/components/welcome/AIPresenceLogo.tsx` (new) and
   `src/components/welcome/ArrivalExperience.tsx` (modified) — the tracked `M` list is unchanged from
   before this sprint; nothing else appears.

---

## 7. Known Limitations

1. **No browser was available to visually preview the breathing animation** in this environment (no
   browser-automation tool, same disclosed limitation as every prior UI sprint this session). Verified
   instead via a clean production build, `tsc`/`eslint` correctness, and careful reasoning about the exact
   `framer-motion` values against the brief's numeric spec. A manual visual pass — especially to confirm
   the breathing genuinely reads as "alive, not animated" rather than mechanical — is strongly recommended
   before this ships to real users, since that's a subjective, felt quality that code review alone can't
   fully verify.
2. **"Neural Energy" was skipped** — see §1. If a future sprint wants it, the safest path is adding a new,
   *optional*, default-off prop to `LivingBrainLogo.tsx` itself (e.g. `energyFlow?: boolean`) that
   animates the existing gyri/node-network `<g>` groups only when explicitly opted into — preserving byte-
   identical behavior for the 5 existing callers that wouldn't pass it.
3. **The 7-second breath duration is a fixed midpoint** of the brief's "6–8 seconds" range, not
   user/context-configurable — matches the brief's own request for one continuous, unchanging loop, not a
   tunable parameter.
4. **The exit-fade duration (`250ms`) is duplicated** between a JS constant (`EXIT_FADE_MS`, used in the
   `setTimeout` delay) and a literal Tailwind arbitrary-value class (`duration-[250ms]`) in
   `ArrivalExperience.tsx`, since Tailwind's static analysis can't read a JS variable — flagged with an
   inline comment at the point of duplication so a future edit to one doesn't silently desync from the
   other.

---

## 8. Resume Instructions

**Nothing has been done for LW-1B — per this sprint's explicit instruction, it must not begin without new
review and approval.** When a brief arrives:

1. Read this document and `docs/PRODUCTION_HANDOFF_LW_1A.md` first.
2. If it touches the logo again: read §1 and §7.2 above before deciding whether to extend
   `AIPresenceLogo.tsx` further or (carefully, with explicit confirmation) add opt-in props to the shared
   `LivingBrainLogo.tsx`.
3. Verify using the same sequence as this sprint (§6) — the whole-repo baseline going forward remains
   **470 test files / 3169 tests**, `tsc` clean, `eslint` clean, build green (retry once for the known
   `reading-discovery` flake if it trips).
4. Report results and stop — do not begin further work without a new, explicit user instruction.

**Nothing else is pending. Stop after this sprint, per the brief's own instruction.**
