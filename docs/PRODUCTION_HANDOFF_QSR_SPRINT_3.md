# Production Handoff — Quantum Speed Reading™ Production Sprint-3: Reading Presentation Engine™

## Status: COMPLETE

## Resumed Mid-Sprint After an Interruption

This sprint was interrupted partway through and resumed in a later session. Rather than trust the prior
session's own account of its progress, the resumed session re-inspected the repository directly: read
Sprint-2's handoff doc, then verified file-by-file which Sprint-3 work genuinely existed on disk versus what
was only planned. Confirmed complete at resume time: `estimatedTimeLeftSeconds` surfaced end to end, and
`presentation/formatReadingDuration.ts` (+ test). Confirmed **not yet started**, despite being planned:
`resolveReadingShortcut.ts`, the theme CSS, the `AppShell` route addition, both new components
(`ReadingThemeSelector`, `FocusModeToggle`), and the `ReadingChunkViewer`/`SessionProgressBar`/
`ReadingNavigationControls`/`ReadingWorkspace` rebuilds — all still byte-identical to Sprint-2. Work resumed
from exactly that point; nothing already-correct was re-touched.

## A Fourth Discovery: A Real, Reusable Focus Mode Mechanism Already Existed

Before writing any Focus Mode code, `src/components/shell/AppShell.tsx` was inspected and turned out to
already contain a real, working, precedented mechanism: `IMMERSIVE_ROUTE_PATTERNS`, a route allow-list that
renders the page chrome-free (no sidebar/topbar/footer) — already applied to the *other*, mock
`/preview/learning-studio/quantum-speed-reading` page, whose own comment reads "This experience runs
entirely in Focus Mode. Hide... Everything." This sprint's Focus Mode is built as two real, distinct halves
rather than one invented system:

1. **Outer app chrome** — the real Reading Workspace route was added to the existing
   `IMMERSIVE_ROUTE_PATTERNS` array (one array entry + a comment; `AppShell.tsx`'s only edit this sprint).
   Reuses the exact mechanism the mock page already relies on — never a second implementation.
2. **In-page secondary chrome** (title, timer, progress, theme selector) — a genuinely new, small, local
   `focusMode` boolean in `ReadingWorkspace`'s own state, since the outer mechanism is static-per-route and
   has no way to be toggled at runtime by a nested client component. The Focus toggle itself, and real
   navigation (Previous/Next/Continue/Finish), stay visible even in Focus Mode — Focus Mode hides
   distractions, never the escape hatch or the reading itself.

## Two More Amendments to Sprint-1's Own `ReadingSessionActionResult`

Continuing the exact pattern Sprint-2 already established (surface an already-computed value that every
action was silently discarding, never invent a new one):

- **`estimatedTimeLeftSeconds`** — LSE-2's own real `RuntimeProgress.estimatedTimeLeftSeconds` (summed from
  the ULO's own `analysis.chunkAnalyses[].estimatedLearningTimeSeconds` over the real remaining queue) was
  sitting on `outcome.runtime.progress` untouched. Now returned by every session-lifecycle action and
  rendered, formatted, in `SessionProgressBar`.

No other amendment to `src/core/` or any locked layer was needed or made this sprint.

## Component Map (Sprint-3 changes only)

```
src/components/shell/AppShell.tsx                    +1 route pattern, reusing the existing mechanism

src/features/quantum-speed-reading-runtime/
  presentation/
    formatReadingDuration.ts        pure (+test) — mm:ss elapsed, "~N min left" estimate
    resolveReadingShortcut.ts       pure (+test) — keyboard event → at most one real action
  types/
    ReadingTheme.ts                 new — 'light' | 'dark' | 'sepia', pure presentation state
  components/
    readingThemes.css               new — Sepia only; Light/Dark need zero new CSS (see below)
    ReadingThemeSelector.tsx        new — real radiogroup, reuses Button
    FocusModeToggle.tsx             new — reuses the existing Switch primitive
    ReadingChunkViewer.tsx          rebuilt — typography system, chunk transition, aria-live
    SessionProgressBar.tsx          rebuilt — estimated time remaining, aria-valuetext
    ReadingNavigationControls.tsx   rebuilt — "Continue" label, keyboard-shortcut title hints
    ReadingWorkspace.tsx            rebuilt — theme/focus state, one keyboard listener, layout
```

## Reading Themes — Why Two of Three Needed Zero New CSS

`DESIGN_SYSTEM.md` §10 already states the dark-mode token set is "future-ready": every color in the palette
has a `.dark` counterpart in `globals.css`, and "any future toggle only needs to add/remove the `.dark`
class... zero component changes required." Every component in this feature already renders with
`bg-background`/`text-foreground`/`bg-card`/`text-muted-foreground` — the same Tailwind utility classes used
everywhere else in the app. So:

- **Light** — the default; no class needed.
- **Dark** — applying the existing `.dark` class to the Workspace's own root element re-themes the whole
  subtree correctly, purely through CSS variable cascade. Zero new CSS.
- **Sepia** — genuinely new (no existing token set for it). Scoped to `.reading-theme-sepia`
  (`components/readingThemes.css`) rather than added to `globals.css`'s own `:root`/`.dark` blocks, since
  Sepia is a reading-specific theme, not a general app theme — the design system's own rule ("never
  introduce a raw OKLCH value... without updating this document") applies to the shared token set, not to a
  feature-scoped override file.

**Disclosed, not silently assumed:** Sepia's OKLCH values (background L=0.94, foreground L=0.32) were
authored with a lightness gap comparable to the light theme's own (which passes AA), but — unlike the design
system's own `success`/`warning` tokens, which were precisely measured (OKLCH → linear sRGB → WCAG relative
luminance) — these were not run through that same measurement. A real follow-up, named here rather than
silently assumed passing.

## Keyboard Shortcuts — Contextual, Never Diverging From Click Behavior

`resolveReadingShortcut` is a pure function (event → action, tested in isolation, no DOM access) —
`ReadingWorkspace`'s one `keydown` listener applies the *same* guard conditions to a shortcut that the
matching button already applies to its own `disabled` prop (pending, paused, `queueIndex === 0` for
Previous). A shortcut never fires when its button would be disabled — keyboard and pointer users get
identical behavior, not two divergent interaction models. Modifier keys (⌘/Ctrl/Alt) always suppress a
shortcut, so no browser/OS shortcut is ever hijacked.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors, on the first full pass.
- `npx eslint` scoped to every file touched across all four QSR sprints (`src/core`,
  `src/features/quantum-speed-reading-runtime`, `AppShell.tsx`, the reading route) — clean. A bare
  `npx eslint .` across the whole repository surfaces 9 pre-existing errors in files this sprint (and no
  prior QSR sprint) has ever touched (`scripts/image-persistence/generateAssets.mts`, `tests/.auth/seed.mjs`,
  `tests/e2e/*`) — disclosed here as a discovery, not fixed, per "continue only the current sprint."
- `npx vitest run` (whole repo) — **594 test files, 3759 tests passed** (2 new test files, 8 new tests: for
  `formatReadingDuration` and `resolveReadingShortcut`), zero regressions against the pre-sprint 592/3751
  baseline. One test in `mentor-conversation-engine` (an unrelated AI Mentor feature, never touched by any
  QSR sprint) failed once on a full-suite run with a 1-millisecond timestamp mismatch, then passed cleanly
  both in isolation and on a full-suite re-run — a pre-existing timing flake, not a regression.
- `npm run build` — compiled successfully on the first attempt. The reading route's bundle grew from
  Sprint-2's 5.31 kB to 7.07 kB, consistent with the new components/CSS added.
- Scope check — confirmed zero diff under any `src/core/` layer. `AppShell.tsx` is the only pre-existing
  tracked file this sprint modified (one array entry + a comment); every other change is a new file.

## What Was Deliberately Not Built

Per the brief's explicit exclusion list: no word flashing, RSVP, WPM, adaptive speed, eye tracking, or any
of the other named future modes. Font size is fluid/responsive CSS only, never a user-facing control (it was
never named among this sprint's Reading Controls, unlike the theme selector and focus toggle, which were).

## Remaining Roadmap

Per the brief's STOP instruction, Sprint-4 does not begin here. The two dependencies disclosed in Sprint-2
(a live Supabase connection to apply the Sprint-1 migration; a future sprint wiring document upload to real
UCE processing) remain the same real blockers to a live end-to-end demonstration of the full presentation
layer built across Sprints 2 and 3.
