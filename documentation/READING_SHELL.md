# Reading Shell & Shared Components

[← Back to index](./PROJECT_BLUEPRINT.md)

All five components below live in `src/features/reading-engine/components/`. Every Reading Mode inherits them exactly as-is — no mode has ever forked its own copy of any of these. Built incrementally: `ReadingStatTile` in Sprint 3.1A; `ReadingHeader`/`ReadingLayout`/`ReadingProgressBar`/`ReadingSessionCompleteScreen` extracted from duplicated per-mode code in Sprint 3.2A.

## ReadingHeader

```ts
type ReadingHeaderProps = {
  modeLabel: string
  liveWpm: number
  targetWpm: number
  elapsedMs: number
  progressPercent: number
}
function ReadingHeader(props: ReadingHeaderProps): React.JSX.Element
```

**Responsibility:** the one shared live-reading header. Renders a small muted eyebrow (`modeLabel`, e.g. "Vertical Word Reading™"), a 3-tile stat row (Reading Pace / Target WPM / Elapsed — **Words Read is intentionally omitted** from this live view, appearing only on the completion screen, to keep the header uncluttered while actively reading), then embeds `ReadingProgressBar`.

**UX decision — "Reading Pace" label + warm-up state:** the value shown for live WPM is labeled "Reading Pace," not "Current WPM" (renamed in Sprint 3.2A — softer, doesn't imply the same numeric precision that invites direct comparison against Target WPM early in a session). While `elapsedMs < 1500`, the tile shows `"Warming up…"` instead of a number — below that threshold the live WPM estimate is computed from too little data to be meaningful (e.g. "11" against a target of "300" reads as broken, not slow). This is a **presentation-only** fix; the underlying `computeWpm` math in `readingMetrics.ts` is never altered.

**Used by:** all 4 modes' Canvas components.

## ReadingLayout

```ts
type ReadingLayoutProps = {
  maxWidthClassName?: string   // default 'max-w-md'
  onExit: () => void
  children: React.ReactNode
}
function ReadingLayout(props: ReadingLayoutProps): React.JSX.Element
```

**Responsibility:** the shared outer container for every active-reading screen — consistent padding/vertical rhythm, and the shared "Exit" control (a small text link, top-right), which every mode's Canvas renders through this component rather than building its own. `maxWidthClassName` is how each mode gets its own "safe reading width" (`max-w-md` for Vertical Word, `max-w-2xl` for Phrase/Sentence, `max-w-3xl` for Paragraph) without hardcoding it per mode.

**Convention note:** immersive reading screens (anything rendered inside `ReadingLayout`) deliberately do **not** also render the app's persistent `LabNavHeader` — that header is reserved for browsing surfaces (Hub, Library, Reports), not full-screen reading sessions, which need their own self-contained exit control instead of persistent chrome.

**Used by:** all 4 modes' Canvas components.

## ReadingProgressBar

```ts
type ReadingProgressBarProps = { progressPercent: number }
function ReadingProgressBar(props: ReadingProgressBarProps): React.JSX.Element
```

**Responsibility:** a thin (`h-1`), rounded, Apple-style progress track — replaced the original plain "72%" text stat (Sprint 3.2A). No gamification, no flashy animation, just a smooth `width` transition (skipped instantly under `prefers-reduced-motion`).

**Used by:** embedded inside `ReadingHeader` — no mode renders it directly.

## ReadingSessionCompleteScreen

```ts
type ReadingSessionCompleteScreenProps = {
  title?: string          // default 'Session Complete'
  subtitle: string        // mode-specific copy, e.g. "Nice, steady reading."
  result: ReadingSessionResult
  bestWpm: number
  onReadAgain: () => void
  backHref?: string        // default '/labs/quantum-speed-reading'
}
function ReadingSessionCompleteScreen(props): React.JSX.Element
```

**Responsibility:** the one shared completion screen every mode renders directly from its own `*Experience.tsx` on `phase === 'complete'`. Displays 6 stats via `ReadingStatTile` (card variant): **Average Reading Pace**, Target WPM, Time, Words Read, Completion %, Best Record — plus "Read Again" and "Back to Lab" actions.

**History:** replaced two separate mode-specific completion components (`VerticalWordReadingComplete.tsx`, `PhraseReadingModeComplete.tsx`) that were, per the source comment that documents this, "byte-for-byte identical except for their subtitle copy." Both were deleted once this shared component existed (confirmed: no orphaned Complete-screen files remain anywhere in the reading-mode folders). Sentence Reading and Paragraph Reading were built directly against this shared screen from day one and never had their own mode-specific version at all.

**Label history:** the "Average WPM" stat was renamed to **"Average Reading Pace"** in Sprint 3.3, for terminology consistency with `ReadingHeader`'s live "Reading Pace" label — a deliberate, narrow, explicitly-justified touch to this one shared file (the only shared-shell file any mode-adding sprint has ever modified), verified live to correctly affect every mode's completion screen, not just the one being built that sprint.

**Used by:** all 4 modes' `*Experience.tsx` orchestrators, called directly (not through any wrapper).

## ReadingStatTile

```ts
type ReadingStatTileProps = {
  label: string
  value: string
  variant?: 'inline' | 'card'   // default 'inline'
}
function ReadingStatTile(props: ReadingStatTileProps): React.JSX.Element
```

**Responsibility:** the one shared `{label, value}` stat atom. `'inline'` (default) matches the plain stat-row style used inside `ReadingHeader`; `'card'` matches the card-wrapped, larger-value style used on `ReadingSessionCompleteScreen`. These two variants exist because the two original per-mode `Stat` components they replaced were **not** actually byte-identical to each other (one was plain, one was card-wrapped) — the variant prop preserves both exact visual outputs rather than forcing one shape onto both call sites.

**Used by:** `ReadingHeader` (inline), `ReadingSessionCompleteScreen` (card), and the Reading Hub's `ReadingHubProgressSummary` (card) — the only shared-shell piece reused **outside** the reading-mode Canvas/completion flow.

---

## Shared motion utility: `useContentCrossfade`

Not part of the "Reading Shell" (it's a hook, not UI chrome), but a genuinely shared piece worth documenting alongside it. Lives at `src/hooks/reading-engine/useContentCrossfade.ts`.

```ts
type UseContentCrossfadeOptions = { exitMs?: number; enterMs?: number }
type UseContentCrossfadeResult = { displayedValue: string; isVisible: boolean; transitionMs: number }
function useContentCrossfade(
  targetValue: string,
  prefersReducedMotion: boolean,
  options?: UseContentCrossfadeOptions,
): UseContentCrossfadeResult
```

**Responsibility:** built in Sprint 3.4A as a reusable "if this text value changes, sequence exit → brief pause → enter" state machine — deliberately contains zero reading/session/metrics/dwell-time logic, purely a motion-timing utility. The rendered node's identity never changes (no `key` prop needed on the animated element), so React never unmounts/remounts content during a transition — only its opacity/transform and text content update in place.

**Current usage:** as of the latest motion sprint (3.4D, second pass), this hook is used by **only one** mode — Paragraph Reading, three times (once per previous/current/next slot in its windowed-peek layout). Vertical Word Reading, Phrase Reading, and Sentence Reading have all since moved to a full persistent-list-plus-transform scrolling mechanism that doesn't need a text-swap crossfade at all. It remains a legitimate, still-needed shared utility — not dead code — because Paragraph Reading's windowed model still genuinely depends on it.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Datasets →](./DATASETS.md)
