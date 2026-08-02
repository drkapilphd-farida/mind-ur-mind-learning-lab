# Reading Modes

[← Back to index](./PROJECT_BLUEPRINT.md)

Every Reading Mode follows the identical file shape:

```
{mode}Dataset.ts              — content, exported as readonly ReadingUnit[]
components/{Mode}Settings.tsx — Target WPM picker + mode-specific presentation options
components/{Mode}Canvas.tsx   — the renderer; inherits ReadingLayout + ReadingHeader
components/{Mode}Experience.tsx — orchestrator: wires useReadingRuntime + useExerciseSession
                                   + useReadingSession together, switches between
                                   Settings / Canvas / ReadingSessionCompleteScreen by phase
```

Plus one page route per mode under `src/app/labs/quantum-speed-reading/{mode-slug}/page.tsx` — a plain, ungated Server Component with no `LabNavHeader` (immersive reading screens own their own Exit control via `ReadingLayout`).

---

## Vertical Word Reading™

**Route:** `/labs/quantum-speed-reading/vertical-word-reading`
**Feature folder:** content/component files live under `src/features/quantum-speed-reading/` (this mode predates the `{mode}-reading-mode/` folder convention used by the other three — see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)).
**Purpose / learning objective:** Improve instant word recognition and eye movement.
**Exercise id / localStorage key:** `vertical-word-reading` / `qsr-vertical-word-reading-best`.

**Dataset:** `verticalWordReadingDataset.ts` — 90 hand-authored, real English words (no AI, no lorem ipsum), themed around reading/growth/focus vocabulary. Exported as both the raw `VERTICAL_WORD_READING_WORDS: readonly string[]` and the prepared `VERTICAL_WORD_READING_UNITS: readonly ReadingUnit[]` (`id: 'word-${index}'`).

**Settings:** Target WPM only (100–500 in fixed steps). This is the only mode with no additional presentation setting.

**Renderer (Canvas):** All 90 words render permanently in a single vertical column, each in a fixed 56px-tall row. A single `translateY` transform scrolls the column so the current word aligns with a fixed highlight strip at the vertical center of a 392px-tall viewport (`7 × 56px`). Current word: `scale(1)`, `opacity: 1`, foreground color. Every other word: `scale(0.8)`, `opacity: 0.4`, muted color. All three properties transition on a shared `cubic-bezier(0.4, 0, 0.2, 1)` curve. This is the **reference implementation** every other mode's later motion redesign was measured against — it was never flagged as feeling "segmented" because nothing is ever unmounted; only a transform moves.

**Engine integration:** `useReadingRuntime(VERTICAL_WORD_READING_UNITS.map(u => u.text))`. Since every unit is exactly one word, `computeUnitDwellMs` reduces to the original fixed `60000/targetWpm` per-word timing — no special-casing needed.

**Unique UI note:** the only mode using a persistent full-list vertical scroll with a *fixed* row height (all others either use variable-content peeks or a different fixed-size scroll axis).

---

## Phrase Reading™

**Route:** `/labs/quantum-speed-reading/phrase-reading-mode`
**Feature folder:** `src/features/phrase-reading-mode/`
**Purpose / learning objective:** Improve chunk reading and reading flow.
**Exercise id / localStorage key:** `phrase-reading-mode` / `qsr-phrase-reading-mode-best`.
**Naming note:** deliberately distinct from the unrelated, pre-existing legacy V1 exercise at `/labs/quantum-speed-reading/phrase-reading` (`src/features/phrase-reading/`) — different folder, different route, no shared files.

**Dataset:** `phraseReadingModeDataset.ts` — 18 real sentences, each split into natural 2–4 word syntactic phrase chunks (subject group / verb group / prepositional phrase), flattened to 61 total `ReadingUnit`s (`id: 'phrase-${index}'`).

**Settings:** Target WPM + **Phrase Size** (`small | medium | large`, `PhraseSize` type) — controls font size (`text-2xl` / `text-4xl` / `text-6xl`). Presentation-only; the engine never sees it.

**Renderer (Canvas) — current state (as of Sprint 3.4D, second pass):** **Horizontal** scrolling row. All 61 phrases render permanently in a horizontal flex row, each in a fixed-width column (`small: 280px, medium: 380px, large: 520px`) and fixed height (`small: 80px, medium: 130px, large: 190px`). A single `translateX` transform scrolls the row so the current phrase's column aligns with a fixed highlight strip. Centering math uses CSS `left: 50%` (resolved by the browser against the real, unmeasured viewport width) combined with a pure pixel `translateX` offset — deliberately avoiding any DOM measurement. Current/non-current styling matches Vertical Word Reading's values exactly (`scale(1)/opacity 1` vs. `scale(0.8)/opacity 0.4`).

**Motion history for this mode specifically** (most iterated mode in the project):
1. Sprint 3.2A: single centered phrase, `key`-based remount + `animate-in fade-in zoom-in-95`.
2. Sprint 3.4A: same-node crossfade via `useContentCrossfade` (no remount, but still one unit alone on screen).
3. Sprint 3.4B: windowed previous/current/next (three always-visible rows, independently crossfading).
4. Sprint 3.4C: full vertical scrolling column (generalizing Vertical Word Reading's mechanism), fixed row height per `PhraseSize`.
5. Sprint 3.4D (second pass): **rotated to horizontal** — the current, live state described above.

`useContentCrossfade` is **not** used by the current implementation of this mode.

**Engine integration:** `useReadingRuntime(PHRASE_READING_MODE_UNITS.map(u => u.text))` — unchanged since Sprint 3.2, through every motion redesign.

---

## Sentence Reading™

**Route:** `/labs/quantum-speed-reading/sentence-reading-mode`
**Feature folder:** `src/features/sentence-reading-mode/`
**Purpose / learning objective:** Improve fluent sentence processing and meaning extraction.
**Exercise id / localStorage key:** `sentence-reading-mode` / `qsr-sentence-reading-mode-best`.
**Naming note:** deliberately distinct from the unrelated legacy V1 `/labs/quantum-speed-reading/sentence-reading` (its files live inline inside `src/features/quantum-speed-reading/`, e.g. `sentenceEngine.ts`/`sentenceLibrary.ts`).

**Dataset:** `sentenceReadingModeDataset.ts` — 18 real, grammatically complete sentences, grouped into 3 progressive difficulty levels (Level 1: ~4–6 words; Level 2: ~9–12 words; Level 3: ~15–19 words), ordered short-to-long. Each `ReadingUnit` is one **complete sentence** — content is not chunked further the way Phrase Reading's is.

**Settings:** Target WPM + **Sentence Width** (`compact | comfortable | wide`, `SentenceWidth` type) — controls the text container's max-width (`max-w-sm` / `max-w-xl` / `max-w-3xl`), keeping font size fixed at `text-2xl leading-relaxed`. This is a genuinely different control than Phrase Reading's Phrase Size: width (line-wrap) vs. font-size.

**Renderer (Canvas) — current state:** Full vertical scrolling column, identical mechanism to Vertical Word Reading and to Phrase Reading's *pre-horizontal* (3.4C) version. Fixed row height per `SentenceWidth` (narrower width → more wrapped lines → taller row): `compact: 220px, comfortable: 170px, wide: 120px`, sized generously against the longest Level-3 sentence in the dataset. Live-verified: the longest sentence renders at 156px within its 220px row at `compact` width — no clipping.

**Motion history:** same 3.2A → 3.4A → 3.4B progression as Phrase Reading, then in the first pass of Sprint 3.4D adopted the full vertical-scroll model (mirroring Phrase Reading's own 3.4C redesign) — and, unlike Phrase Reading, has **not** since been rotated to horizontal.

`useContentCrossfade` is **not** used by the current implementation of this mode.

**Engine integration:** `useReadingRuntime(SENTENCE_READING_MODE_UNITS.map(u => u.text))`.

---

## Paragraph Reading™

**Route:** `/labs/quantum-speed-reading/paragraph-reading-mode`
**Feature folder:** `src/features/paragraph-reading-mode/`
**Purpose / learning objective:** Improve extended reading endurance and comprehension of connected, multi-sentence prose.
**Exercise id / localStorage key:** `paragraph-reading-mode` / `qsr-paragraph-reading-mode-best`.
**Naming note:** deliberately distinct from the unrelated, protected, mission-gated legacy V1 `/labs/quantum-speed-reading/paragraph-reading` (`ParagraphReadingExperience.tsx`) — a 20-mission Brain Challenge exercise with its own access-gating, architecturally unrelated to this engine.

**Dataset:** `paragraphReadingModeDataset.ts` — 8 real, hand-written paragraphs (3–8 sentences of genuine connected prose each), progressive difficulty by length (~30 words up to ~75 words, ~430 words total). Each `ReadingUnit` is one **entire paragraph** — the largest content unit of any mode.

**Settings:** Target WPM + **Reading Width** (`compact: 560px, comfortable: 720px, wide: 900px`, `ParagraphReadingWidth` type) + **Font Size** (`small: 17px/31px, medium: 19px/34px, large: 22px/40px` font-size/line-height pairs, `ParagraphFontSize` type). Typography is **fixed-pixel, not Tailwind text-size utilities** — borrowed deliberately from the legacy V1 `ParagraphReadingExperience.tsx`'s own comfort-reading convention, since stable, predictable line-wrapping matters more here than anywhere else in the project.

**Renderer (Canvas) — current state:** **Windowed previous/current/next** (the Sprint 3.4B model, intentionally *not* upgraded to the full persistent-scroll-list mechanism the other three modes use). Only the **current** paragraph is ever height-unconstrained; the previous/next peeks are clipped to a small fixed `maxHeight: 72px` with a top/bottom CSS mask fade. Each of the three slots uses its own `useContentCrossfade` instance (still the only mode using this hook), with an added small consistent upward `translateY(-14px)` on the hidden state (Sprint 3.4D, first pass) so transitions drift upward rather than fading flat in place.

**Why this mode's motion model deliberately differs from the other three:** paragraphs are long (30–95 words) and highly variable in rendered height. Rendering all 8 permanently at one fixed row height (the mechanism the other 3 modes use) would either waste large amounts of vertical space for short paragraphs or reintroduce a real risk of clipping real, fully-readable text for long ones — a functional regression, not just a cosmetic one, in the mode explicitly called "highest priority" across several sprints. The windowed-peek model with a clipped, honestly-partial preview was chosen instead and has been kept through every subsequent motion sprint.

**Engine integration:** `useReadingRuntime(PARAGRAPH_READING_MODE_UNITS.map(u => u.text))`. Live-verified: a ~30-word paragraph dwells ~18s and a ~34-word paragraph dwells ~20.4s at 100 target WPM — both matching `wordCount × 600ms` almost exactly, confirming the same engine mechanism paces full paragraphs correctly with no special-casing.

---

## Cross-mode comparison table

| | Vertical Word | Phrase | Sentence | Paragraph |
|---|---|---|---|---|
| Unit = | 1 word | 2–4 word chunk | 1 full sentence | 1 full paragraph |
| Dataset size | 90 | 61 (from 18 sentences) | 18 | 8 |
| Mode-specific setting | — | Phrase Size (font size) | Sentence Width (line-wrap) | Reading Width + Font Size |
| Current motion model | Vertical full-scroll (fixed row) | **Horizontal** full-scroll (fixed column) | Vertical full-scroll (fixed row) | Windowed peek + upward drift |
| Uses `useContentCrossfade`? | No | No | No | **Yes** (only remaining consumer) |
| Typography style | Large centered display type | Large centered display type | Large centered display type | Fixed-px comfort-reading body text |

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Reading Hub →](./READING_HUB.md)
