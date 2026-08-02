# Limitations & Technical Debt

[← Back to index](./PROJECT_BLUEPRINT.md)

Two related but distinct lists. **Limitations** are things the product honestly does not do yet (a user-facing gap). **Technical debt** is implementation detail that works today but should be revisited (a maintainer-facing gap). Every item below is real and currently true in the repository — none are hypothetical.

## Section 16 — Known Limitations

### Settings do not persist across visits
Every mode-specific presentation setting — **Reading Width** and **Font Size** (Paragraph Reading), **Phrase Size** (Phrase Reading), **Sentence Width** (Sentence Reading) — lives in local `useState` inside that mode's own `*Experience.tsx` (see [ARCHITECTURE.md](./ARCHITECTURE.md) Section 12, State Management). Reloading the page or returning later always resets to the default. **Target WPM** has the identical limitation — it resets to `useReadingRuntime`'s default (250) every visit, even though a user's Best Record for that mode is remembered.

### No per-session historical WPM
`practice_sessions` stores only `duration_ms` and `completed` — no WPM, no words-read, no completion-percent column (see [DATABASE.md](./DATABASE.md)). This means:
- Reading Hub's Recent Activity cannot show a real Reading Pace or Completion % for the most recent session — it honestly shows "Not tracked yet" rather than fabricating a number (see [READING_HUB.md](./READING_HUB.md), and [ARCHITECTURE.md](./ARCHITECTURE.md) Rule 5).
- There is no way to show a WPM trend/history chart for any mode, ever, without a schema change.

### Best Record is per-browser only
`readingLocalHistory.ts` stores each mode's best WPM in `localStorage`, keyed per mode. It does not sync across devices or browsers — a user's "Best Reading Pace" on their phone and on their laptop are two independent numbers with no reconciliation.

### Motion model asymmetry across modes
Vertical Word Reading, Phrase Reading, and Sentence Reading all use a "render everything, scroll one transform" model, but on **different axes**: Phrase Reading is horizontal (`translateX`), Vertical Word and Sentence Reading are vertical (`translateY`). Paragraph Reading uses a third, structurally different model (windowed previous/current/next peek + crossfade). This is a real, current visual inconsistency across the four modes — see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) and [ROADMAP.md](./ROADMAP.md) for the open question of whether horizontal, vertical, or a per-mode choice is the intended final state. Every sprint that changed this was explicitly told to touch only one mode and "wait for approval before expanding this model elsewhere" (see [CHANGELOG.md](./CHANGELOG.md)), so this asymmetry is a known, deliberately-paused state, not an oversight.

### Guided Paragraph Reading™ does not exist
Listed in `readingHubModes.ts` with `status: 'coming-soon'` and no `href`/`exerciseId`/`storageKey`. **Planned – Not Implemented.**

### Reading Hub is under-linked
Only Lab Home's footer links to the Reading Hub. The Library page (`/labs/quantum-speed-reading/library`) does not link to it. A user who only ever visits the Library would not discover the Hub. **Planned – Not Implemented** (deliberately deferred at the time the Hub was built, not forgotten).

### "Back to Lab," not "Back to Hub"
Every mode's completion screen links back to `/labs/quantum-speed-reading` (Lab Home), not back to the Reading Hub the user most likely arrived from. A user who starts a session from the Hub and finishes it lands one navigation step away from where they began.

### No reference video was ever actually available
Sprints 3.4B through 3.4D (second pass) were all briefed against an "attached reference video" that never actually reached the agent implementing them (see [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md), Section 2, closing note). Every motion-model decision in that range was made from text descriptions only. This isn't a code limitation, but it is a real gap between "what was asked for" and "what could be verified" that a future AI or engineer should know about before assuming the current motion models are a pixel-perfect match to whatever the original reference actually showed.

## Section 17 — Technical Debt

| Item | Why it should be improved | Priority |
|---|---|---|
| No per-session WPM/words-read/completion-percent column on `practice_sessions` | Blocks Recent Activity, any historical trend view, and any future analytics on reading performance. Requires a new migration — a deliberate, discussed decision, not a quick fix (see [ARCHITECTURE.md](./ARCHITECTURE.md) Rule 10). | High — blocks the most user-visible honesty gap in the product |
| No cross-device Best Record sync | `localStorage`-only Best Record means the "Best Reading Pace" shown is meaningless for a multi-device user. Would need a small dedicated table or a column on `exercise_progress`. | Medium |
| Motion model asymmetry (horizontal vs. vertical vs. windowed) | Three different scrolling mechanisms for four modes is more surface area to maintain than one. Should be resolved deliberately (pick one model, or explicitly ratify per-mode difference as intentional) rather than left as an accumulation of sequential, narrowly-scoped sprints. | Medium — cosmetic, not functional, but growing harder to justify with each new mode |
| `useContentCrossfade` has only one remaining consumer (Paragraph Reading) | Not dead code — it's still genuinely needed there — but worth noting that if Paragraph Reading is ever migrated to a full-scroll model (matching the other three), this hook would become unused and should be removed rather than left as an orphaned utility. | Low |
| Reading Mode settings/Target WPM not persisted (see Limitations above) | Repeated manual re-selection every session is a real UX cost as the product matures past an MVP feel. | Medium |
[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Roadmap →](./ROADMAP.md)
