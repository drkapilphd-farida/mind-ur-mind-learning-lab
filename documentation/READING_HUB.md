# Reading Hub

[← Back to index](./PROJECT_BLUEPRINT.md)

**Route:** `/labs/quantum-speed-reading/reading-hub`
**Feature folder:** `src/features/reading-hub/`
**Built in:** Sprint 3.3A.

## Purpose

Before this sprint, all four Reading Modes were reachable only by typing their exact URL — nothing in the app linked to them. The Reading Hub is a pure navigation/aggregation layer, giving them one discoverable entry point with real progress data, without touching the engine, any mode, or the shared shell.

## Architecture

```
src/app/labs/quantum-speed-reading/reading-hub/page.tsx   — Server Component
   │
   ├─ getPracticeSessionsForExercises('quantum-speed-reading', READING_HUB_AVAILABLE_EXERCISE_IDS, 200)
   │     src/lib/exercises/queries/getPracticeSessionsForExercises.ts
   │     (new sibling to getPracticeSessions.ts — that function has no
   │      exercise_id filter at all; this one adds .in('exercise_id', ...)
   │      for real server-side filtering instead of over-fetching)
   │
   ├─ computeDailyStreak(sessions)          — src/lib/exercises/practiceHistory.ts (pre-existing, reused as-is)
   ├─ computeTodaysProgress(sessions)       — src/lib/exercises/practiceHistory.ts (pre-existing, reused as-is)
   │
   └─ renders:
        LabNavHeader (currentSection="Reading Hub")
        ReadingHubModeCard × 5   (one per entry in readingHubModes.ts)
        ReadingHubRecentActivity
        ReadingHubProgressSummary
```

`readingHubModes.ts` is the single source of truth for what the Hub lists:

```ts
export type ReadingHubModeStatus = 'available' | 'coming-soon'

export type ReadingHubMode = {
  id: string
  title: string
  purpose: string
  status: ReadingHubModeStatus
  href?: string
  exerciseId?: string
  storageKey?: string
}
```

Current contents (verified against the live file):

| id | title | status | href |
|---|---|---|---|
| `vertical-word-reading` | Vertical Word Reading™ | `available` | `/labs/quantum-speed-reading/vertical-word-reading` |
| `phrase-reading-mode` | Phrase Reading™ | `available` | `/labs/quantum-speed-reading/phrase-reading-mode` |
| `sentence-reading-mode` | Sentence Reading™ | `available` | `/labs/quantum-speed-reading/sentence-reading-mode` |
| `paragraph-reading-mode` | Paragraph Reading™ | `available` | `/labs/quantum-speed-reading/paragraph-reading-mode` |
| `guided-paragraph-reading-mode` | Guided Paragraph Reading™ | `coming-soon` | — (no href, no exerciseId, no storageKey) |

`READING_HUB_AVAILABLE_EXERCISE_IDS` is derived by filtering for entries with a defined `exerciseId` — it will only ever include the 4 currently-available modes.

## Navigation

- **Discoverability:** Lab Home (`/labs/quantum-speed-reading`, the pre-existing V1 journey dashboard) has one added footer link, "Explore the Reading Hub →," placed next to the existing "Browse the full Library →" link. This is the **only** change made to Lab Home for this project — its stage/journey/gating logic is untouched.
- **From the Hub:** each available mode's card is a `<Link>` wrapping the whole card (click anywhere on the card to start that mode). "Coming Soon" cards render disabled, with a muted badge, and are not links.
- **Back:** each mode's own completion screen (`ReadingSessionCompleteScreen`) has a "Back to Lab" link to `/labs/quantum-speed-reading` (not directly back to the Hub) — see [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md).

## Cards (`ReadingHubModeCard.tsx`)

A Client Component (needs `localStorage` access, so cannot be a Server Component). Visually matches the existing `Card`/`CardContent` + hover-lift + `ArrowRight` convention already established elsewhere in this codebase by `ReadingModeCard.tsx` (a **different, unrelated** component tied to an old passage-reading pacing-profile picker — not reused directly, matched visually only).

Each available card shows:
- Title + purpose (both from `readingHubModes.ts`, static content).
- **Best Reading Pace** — read from `localStorage` via `loadBestWpm(mode.storageKey)` on mount. Shows `"—"` before mount (genuinely unavailable during SSR), and `"No sessions yet"` (not `"0 wpm"`) if the value is 0, to avoid misreading an absence of data as an actual pace of zero.
- **Last Practised** — a real date label (`"Today"` / `"Yesterday"` / `"N days ago"`) computed server-side from the most recent real `practice_sessions` row for that `exerciseId`.
- A "Start →" affordance (not a separate button — the whole card is the click target).

"Coming Soon" cards show only title, purpose, and a muted badge — no stats, no link.

## Recent Activity (`ReadingHubRecentActivity.tsx`)

Shows the single most recent session across all 4 available modes:

```ts
export type ReadingHubRecentActivityRecord = {
  modeTitle: string
  durationMs: number
  completed: boolean
}
```

Displays: real Mode name, real Duration (via `formatElapsedTime`), real Completed/Not-completed status. **Deliberately does not show a Reading Pace or Completion % number** — both are rendered as an explicit "Not tracked yet." This is not a placeholder-for-laziness; it reflects a real, permanent gap: `practice_sessions` has no WPM or completion-percent column (see [DATABASE.md](./DATABASE.md)), and no other table stores a per-session historical WPM either (only a single rolling *best* value ever persists, in `localStorage`). Fabricating a number here would violate this project's "never fabricate data" rule (see [ARCHITECTURE.md](./ARCHITECTURE.md), Rule 5).

## Progress Summary (`ReadingHubProgressSummary.tsx`)

Four stats, using the shared `ReadingStatTile` (card variant):

| Stat | Source | Real or placeholder? |
|---|---|---|
| Today's Practice | `computeTodaysProgress(sessions).totalDurationMsToday` (pre-existing pure function, reused) | Real |
| Sessions Today | Count of today's sessions with `completed === true` | Real |
| Best Reading Pace | `Math.max(...)` across all 4 modes' `loadBestWpm(storageKey)`, computed client-side on mount | Real (client-only, `localStorage`) |
| Current Streak | `computeDailyStreak(sessions).currentStreak` (pre-existing pure function, reused, scoped to just these 4 exercise ids) | Real — turned out to be genuinely available, not a placeholder, once sessions were pre-filtered to the right exercise ids |

## Current limitations

- Recent Activity's Reading Pace/Completion fields are honestly untracked (see above) — this requires a new DB column to fix for real, not implemented, see [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md).
- Guided Paragraph Reading has no route yet — its card is permanently "Coming Soon" until that mode is built.
- The Hub is not linked from the Library page (`/labs/quantum-speed-reading/library`) — only from Lab Home's footer. A second discoverability path was considered and deliberately deferred as unnecessary scope for the sprint that built the Hub.
- Best Reading Pace and the Progress Summary's aggregate Best Reading Pace are per-browser (localStorage), not synced across devices — same limitation as every mode's own Best Record.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Reading Shell →](./READING_SHELL.md)
