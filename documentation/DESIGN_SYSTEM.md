# Design System

[← Back to index](./PROJECT_BLUEPRINT.md)

This section documents the **current, actually-implemented** visual language of Quantum Speed Reading™ V2 — not an aspirational style guide. There is no central design-token file (no `readingDesignTokens.ts`) for this feature area; every value below is read directly from the components that use it, as documented in [READING_MODES.md](./READING_MODES.md) and [READING_SHELL.md](./READING_SHELL.md). Where this project reuses a project-wide convention (e.g. `TYPOGRAPHY` from `@/lib/designSystem/typography`), that is noted explicitly rather than re-derived.

## Typography

Two distinct typographic modes exist across the four Reading Modes, a deliberate split rather than one universal scale:

| Style | Used by | Sizing | Rationale |
|---|---|---|---|
| Large centered display type | Vertical Word, Phrase, Sentence Reading | Tailwind text-size utilities (Phrase Reading: `text-2xl` / `text-4xl` / `text-6xl` by Phrase Size) | These units are short (1 word to 1 sentence) — a large, bold, centered display treatment maximizes legibility at speed and matches the "flashcard" feel appropriate to short units. |
| Fixed-pixel comfort-reading body text | Paragraph Reading | Explicit `font-size`/`line-height` pairs (`small: 17px/31px`, `medium: 19px/34px`, `large: 22px/40px`) | Borrowed deliberately from the legacy V1 `ParagraphReadingExperience.tsx` convention (see [READING_MODES.md](./READING_MODES.md)) — long, multi-sentence prose needs stable, predictable line-wrapping more than it needs Tailwind's coarser size steps, so this mode intentionally opts out of the shared Tailwind scale. |

Sentence Reading's **Sentence Width** setting deliberately holds font size fixed (`text-2xl leading-relaxed`) and varies only the container's max-width — a genuinely different axis of control than Phrase Reading's **Phrase Size** (which varies font size, not width). This distinction is intentional and documented in [READING_MODES.md](./READING_MODES.md) so a future AI does not "fix" it into a single shared setting.

Outside the reading canvases themselves, `ReadingHeader`'s eyebrow label and `ReadingStatTile` labels use the project-wide `TYPOGRAPHY` tokens from `@/lib/designSystem/typography` (e.g. `TYPOGRAPHY.label`, `TYPOGRAPHY.small`) — the Reading Shell does not invent its own separate label typography.

## Spacing

No Reading-Mode-specific spacing scale exists; the Reading Shell and Canvases use the project's ambient Tailwind spacing scale directly (`gap-*`, `p-*`, `mt-*` utilities), the same as the rest of the app. `ReadingLayout`'s `maxWidthClassName` prop is the one spacing-adjacent value that *is* mode-specific, giving each mode its own "safe reading width" container:

| Mode | `maxWidthClassName` |
|---|---|
| Vertical Word Reading | `max-w-md` |
| Phrase Reading, Sentence Reading | `max-w-2xl` |
| Paragraph Reading | `max-w-3xl` |

## Cards

Two card conventions exist, deliberately unmerged:

- **`ReadingHubModeCard`** (Reading Hub) — matches the codebase's pre-existing `Card`/`CardContent` + hover-lift + `ArrowRight` convention (visually matched to the unrelated `ReadingModeCard.tsx`, not code-shared with it — see [READING_HUB.md](./READING_HUB.md)).
- **`ReadingStatTile` (`variant="card"`)** — a smaller, self-contained `{label, value}` stat atom used on `ReadingSessionCompleteScreen` and in `ReadingHubProgressSummary`. It is not a general-purpose card; it exists only to present one labeled number. See [READING_SHELL.md](./READING_SHELL.md) for why the `'inline' | 'card'` variant split exists (the two original per-mode `Stat` components it replaced were not visually identical to each other).

## Buttons

No Reading-Mode-specific button component exists — every Pause/Resume/Restart/Finish/Read Again/Back-to-Lab action uses the project's shared `Button` component (`@/components/ui/button`) with its existing variants. The Reading Shell's contribution is arrangement and copy (e.g. `ReadingSessionCompleteScreen`'s "Read Again" / "Back to Lab" pair), not new button styling.

## Header (`ReadingHeader`)

- A small muted eyebrow line showing `modeLabel` (e.g. "Vertical Word Reading™").
- A 3-tile stat row: **Reading Pace** (live WPM, renamed from "Current WPM" in Sprint 3.2A), **Target WPM**, **Elapsed**. Words Read is deliberately omitted from this live view — it appears only on the completion screen — to keep the header uncluttered while actively reading.
- Below `elapsedMs < 1500`, the Reading Pace tile shows `"Warming up…"` instead of a number, since the live WPM estimate is statistically meaningless from too little elapsed time (see [READING_SHELL.md](./READING_SHELL.md) for the full rationale). This is a presentation-only guard — `computeWpm` itself is never altered.
- Embeds `ReadingProgressBar` directly beneath the stat row.

## Progress (`ReadingProgressBar`)

A thin (`h-1`), rounded, Apple-style progress track with a smooth CSS `width` transition — replaced an earlier plain "72%" text stat in Sprint 3.2A. No gamification styling (no color-coded thresholds, no confetti, no milestone badges). Transition is skipped instantly under `prefers-reduced-motion`.

## Completion (`ReadingSessionCompleteScreen`)

A single shared screen (title default "Session Complete", mode-specific `subtitle` copy) presenting 6 `ReadingStatTile` (card variant) stats — **Average Reading Pace**, Target WPM, Time, Words Read, Completion %, Best Record — followed by "Read Again" and "Back to Lab" actions. See [READING_SHELL.md](./READING_SHELL.md) for its full history (it replaced two now-deleted mode-specific completion screens that were byte-for-byte identical except for subtitle copy).

## Motion

The single most consistent visual-language element across the whole project is the shared easing curve:

```
cubic-bezier(0.4, 0, 0.2, 1)
```

Used for every current-vs-non-current transform/opacity transition in every mode's Canvas (`scale`/`opacity` for Vertical Word, Phrase, and Sentence Reading's full-scroll models; the crossfade transitions inside Paragraph Reading's windowed peeks via `useContentCrossfade`). The current unit always resolves to `scale(1)` / `opacity: 1` / foreground color; every non-current unit resolves to `scale(0.8)` / `opacity: 0.4` / muted color — this exact pair of values is repeated in every mode rather than each mode inventing its own emphasis styling.

**Current state per mode** (full history in [READING_MODES.md](./READING_MODES.md)):

| Mode | Motion model | Axis |
|---|---|---|
| Vertical Word Reading | Full persistent-list scroll, fixed row height | Vertical (`translateY`) |
| Phrase Reading | Full persistent-list scroll, fixed column width | **Horizontal** (`translateX`) — the one outlier axis |
| Sentence Reading | Full persistent-list scroll, fixed row height | Vertical (`translateY`) |
| Paragraph Reading | Windowed previous/current/next peek, `useContentCrossfade` | Crossfade + upward `translateY(-14px)` drift |

Every "full scroll" mode renders its entire dataset permanently in the DOM and moves a single transform — content is never unmounted/remounted mid-session, which is what keeps every transition feeling continuous rather than "segmented" (see [ARCHITECTURE.md](./ARCHITECTURE.md), Rule 4, and [READING_SHELL.md](./READING_SHELL.md) for `useContentCrossfade`'s own no-remount guarantee). All transitions respect `prefers-reduced-motion` via the pre-existing `usePrefersReducedMotion` hook — reduced-motion sessions get instant cuts, not disabled functionality.

## Current visual language, summarized

- **Minimal, chrome-light immersive reading screens** — no persistent app header inside `ReadingLayout` (see [READING_SHELL.md](./READING_SHELL.md)'s convention note), just the mode's own header/progress/canvas/controls.
- **One shared emphasis language** (scale + opacity + color, one easing curve) reused by every mode rather than each mode having its own "feel."
- **Honesty over decoration** in stats — no fabricated numbers, no gamified progress visuals (see [ARCHITECTURE.md](./ARCHITECTURE.md), Rule 5) — the Design System and the "never fabricate data" architecture rule are, in this project, the same discipline applied to two different layers.
- **Presentation is intentionally the most-iterated layer** — 5 successive motion redesigns for Phrase Reading alone (Sprints 3.2A → 3.4A → 3.4B → 3.4C → 3.4D) — while the Reading Shell and engine underneath stayed byte-for-byte unchanged. This is the clearest evidence in the whole project that the architecture's presentation/engine separation (Rule 4) actually holds up under real, repeated iteration pressure.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Limitations & Technical Debt →](./LIMITATIONS_AND_TECHNICAL_DEBT.md)
