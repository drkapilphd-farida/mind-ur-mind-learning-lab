# Production Handoff — Sprint 53 (Premium Image Asset Library™ & Image Persistence Upgrade)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue Production Sprint 54 onward with zero context
loss.
**Scope of this document:** Sprint 53 only. Builds on `docs/PRODUCTION_HANDOFF_SPRINT_52.md`. Target
confirmed (again, per Sprint 52's own instruction to re-state this for the next reader): every file below
lives under `src/features/tratak-intelligence/` — the "Tratak Intelligence Journey™" Image Persistence
Challenge™, not the separate, unrelated `visual-intelligence/persistence-challenge` feature.

---

## 1. What This Sprint Is

Upgraded the image *assets* and the daily *composition rule* for Image Persistence Challenge™. The 2
existing mandalas were too simple; the human-face set needed real diversity; and the daily sequence
needed to become a strict, deterministic Human Face → Mandala → Human Face → Mandala → Human Face
alternation instead of the previous guided-but-partly-random 5-slot structure.

### A capability limit, disclosed plainly

This environment has no image-generation tool — nothing that can produce actual photorealistic raster
portraits. The brief's request for "AI-generated, photorealistic portraits inspired by well-known Indian
celebrities" was **not literally fulfilled**. The brief itself anticipated this exact contingency ("if
production assets are not yet available: create the asset pipeline and placeholder manifest"), so this
sprint built genuinely upgraded placeholder art (following this codebase's own pre-existing, disclosed
precedent for the identical limitation in `imagePersistencePool.ts`) plus a complete, documented,
ready-to-receive pipeline — see `docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md`, which also carries an explicit
publicity-rights caution for whoever adds real assets later (deliberately generating a specific real,
identifiable person's likeness/styling is legally sensitive independent of copyright, even with a capable
image-generation tool).

### Business-logic boundary

The brief's central deliverable — a deterministic category sequence — required rewriting
`selectDailyImagePersistenceSequence` in `imagePersistenceDailySequence.ts`. Verified before touching it:
this file contains zero scoring/streak/session-completion logic and is called only from the query layer
(`getTodaysImagePersistenceSequence.ts`), never from the protected session engine
(`completeTratakMissionSession.ts`, untouched). "No random ordering" was read as governing the *category*
sequence only — *which* specific image fills a Face/Mandala slot each day still uses the existing
seeded-PRNG "prefer non-recent" mechanism, unchanged in spirit, since the brief never specifies which
individual image should appear and a small pool needs this to avoid staleness (the same rationale this
file's own header comment has always given).

---

## 2. What Stayed Untouched

- `ImagePersistenceChallengeExperience.tsx`, `completeTratakMissionSession.ts`, every scoring/streak/
  report file, `onReturnToJourney`/`continueLabel`, `VisualActivationSequence.tsx`, routing, Universal
  Exercise Player, timers, analytics.
- `MandalaIllustration.tsx` and Mandala Tratak generally — its parametric-SVG-layer *technique* inspired
  the new mandala assets, but as an entirely separate, new set of files; this component itself was not
  edited. `MandalaSessionScreen.tsx` never passes `.svg`/`invert`/`invertedSrc`, confirmed unaffected by
  every change below.
- `imagePersistenceRandomEngine.ts` — confirmed dead code (only its own test calls it, zero production
  call sites) — left alone.
- The 8 pool entries for flowers/sacred-geometry/everyday-objects/animals — untouched in
  `imagePersistencePool.ts` (still valid, still satisfy "architecture supports future categories...
  without changing the engine") but simply never selected by the new alternation algorithm — reserved for
  a future version, not deleted.
- The separate `visual-intelligence/persistence-challenge` feature — not this sprint's target.

---

## 3. Work Completed

### New: `src/features/tratak-intelligence/imagePersistenceAssetKit.ts`
Offline asset-generation kit — pure functions and design data only, never imported by runtime UI.
`invertHexColor()` is a true per-channel negation (`255 - channel`); every design uses only flat,
fully-opaque fills and a solid background rect (no strokes/gradients/transparency), which makes channel
negation an *exact* per-pixel negative, not an approximation. Contains 3 `MandalaDesign`s (6 petal rings +
a rotated star core each, extending `MandalaIllustration.tsx`'s concentric-layer technique into new,
separate files) and 4 `FaceMotifDesign`s (concentric "halo" disks behind a geometric head silhouette with
eye/brow/nose/mouth marks — abstract, explicitly not photorealistic).

### New: `imagePersistenceAssetKit.test.ts`
Proves `invertHexColor` is a true involution (`invertHexColor(invertHexColor(x)) === x`), checks known
values, and asserts every generated SVG's background color is the exact channel-negation between its
original and inverted variant — a machine-checkable proof that inversion is real, not faked. 8 tests, all
passing.

### New: `scripts/image-persistence/generateAssets.mts`
Committed (not run-once-and-discarded) generator — imports the kit's design data and writes 14 SVG files
(7 designs × original + inverted) plus `public/assets/image-persistence/generated/README.md`. Runs via
`node scripts/image-persistence/generateAssets.mts` (Node 24's native TypeScript type-stripping, no new
`tsx`/`ts-node` dependency). Doubles as the documented, re-runnable "inversion workflow."

### New assets: `public/assets/image-persistence/`
```
human-faces/human-face-01.svg .. human-face-04.svg
mandalas/mandala-01.svg .. mandala-03.svg
inverted/human-faces/human-face-01.svg .. human-face-04.svg
inverted/mandalas/mandala-01.svg .. mandala-03.svg
generated/README.md
```
14 SVG files + 1 README, all generated and verified well-formed.

### `src/features/tratak-intelligence/imagePersistencePool.ts`
- Added optional `invertedSrc?: string` to `ImagePersistenceImageDefinition`.
- Removed 4 legacy entries: `mandala-1`, `mandala-2`, `human-faces-1`, `human-faces-2` (old JPGs left on
  disk, unreferenced — not deleted).
- Added 7 new entries (`mandala-01..03`, `human-face-01..04`), each with `src`, `invertedSrc`, and
  centered anchors (`50/50`, per the brief's "centered composition").
- Updated the file's header comment (image count, which categories the daily sequence actually selects).

### `src/features/tratak-intelligence/imagePersistenceObservationQuestions.ts`
Removed the 4 legacy entries, added 7 new ones using the existing `countQuestion` pattern — mandala
questions all use the real count of 6 petal rings (every new mandala design has exactly 6, by
construction); human-face questions use each design's real halo-ring count (3 or 4).

### `src/features/tratak-intelligence/imagePersistenceDailySequence.ts`
Rewrote `selectDailyImagePersistenceSequence`: replaced `pickOne`/`pickDistinctPair`/
`pickTwoVaryingCategory` with one generalized `pickDistinctN` (category-variety logic is no longer
needed — category is now fixed by position). New fixed `CATEGORY_SEQUENCE` = `['human-faces', 'mandala',
'human-faces', 'mandala', 'human-faces']`. Kept the seeded-PRNG determinism (`hashSeed` + `mulberry32`,
byte-identical) and "prefer non-recent" behavior for which specific image fills each slot. `pickDistinctN`
throws a named error (mirroring the prior `pickOne` pattern) rather than silently duplicating if a
category ever has fewer candidates than the day needs. `DAILY_IMAGE_COUNT` unchanged at 5.
`getTodaysImagePersistenceSequence.ts` needed **zero changes** — same function signature.

### `imagePersistenceDailySequence.test.ts`
Full rewrite for the new alternating structure — 11 tests (was 12 for the old 5-slot shape), all passing:
exact category sequence, Human Face always first, exactly 3 faces + 2 mandalas per day, no duplicates
within a day, deterministic per seed, varies across seeds, prefers non-recent images, correct fallback
when not enough non-recent candidates exist, and a new test confirming the named-error behavior when a
category has too few candidates.

### `src/features/tratak-intelligence/components/image-persistence/ImagePersistenceSessionScreen.tsx`
`imageSrc={image.invertedSrc ?? image.src}`, `invert={image.invertedSrc === undefined}` — new premium
entries use their real pre-generated negative directly (no CSS filter); any future entry without one
still gets Sprint 52's CSS-invert fallback, unchanged.

### `src/features/tratak-intelligence/imageFixation/ImageFixationSessionScreen.tsx` (shared with Mandala)
Added `unoptimized={imageSrc.endsWith('.svg')}` to the `<Image>` call. `next.config.ts` has no
`dangerouslyAllowSVG`, so Next's built-in optimizer 400s on SVG sources by default (local or remote) —
`unoptimized` serves the raw file as-is instead, sidestepping that without a global config change. A
no-op for every raster `.jpg` source, confirmed including every Mandala Tratak and Candle Tratak call
site (neither ever passes `.svg`).

### New: `docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md`
The brief's required documentation: honest current-state disclosure, publicity-rights caution, folder
structure, naming convention, required asset counts (4 faces/3 mandalas minimum 3/2), target resolution
for future raster replacements (2048×2048), the inversion workflow, how to add an image to an existing
category, and how to add a new category entirely.

---

## 4. Files Changed / Added

```
NEW   src/features/tratak-intelligence/imagePersistenceAssetKit.ts
NEW   src/features/tratak-intelligence/imagePersistenceAssetKit.test.ts
NEW   scripts/image-persistence/generateAssets.mts
NEW   public/assets/image-persistence/**  (14 SVGs + 1 README)
NEW   docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md
NEW   docs/PRODUCTION_HANDOFF_SPRINT_53.md
MOD   src/features/tratak-intelligence/imagePersistencePool.ts
MOD   src/features/tratak-intelligence/imagePersistenceObservationQuestions.ts
MOD   src/features/tratak-intelligence/imagePersistenceDailySequence.ts
MOD   src/features/tratak-intelligence/imagePersistenceDailySequence.test.ts
MOD   src/features/tratak-intelligence/components/image-persistence/ImagePersistenceSessionScreen.tsx
MOD   src/features/tratak-intelligence/imageFixation/ImageFixationSessionScreen.tsx
```

All `tratak-intelligence` files live inside an already-untracked (`??`) folder, so `git status`'s `M`
list is unaffected by this sprint (same as Sprint 52) — reviewed directly instead of via `git diff`.

---

## 5. Validation (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
2. `npx eslint` on all 8 changed/new source files — **zero findings.**
3. `npx vitest run` (whole repo) — **469 test files, 3165 tests, all passing** (up from Sprint 52's
   baseline of 468/3158 — net +1 file / +7 tests: +8 from the new asset-kit test, -1 from the
   daily-sequence rewrite dropping one now-inapplicable "varying category" test while adding a new
   error-case test).
4. `npm run build` — **green, first attempt**, both `/labs/visual-intelligence/tratak/mandala` and
   `/labs/visual-intelligence/tratak/image-persistence` present in the route table with no errors; the
   known unrelated `reading-discovery` flake did not trip.
5. Grep sweep for the 4 removed legacy ids (`mandala-1`, `mandala-2`, `human-faces-1`, `human-faces-2`) —
   zero remaining references anywhere in `src`.
6. Manual SVG well-formedness check — read `human-face-01.svg` directly, confirmed valid, well-formed XML
   with the expected halo/head/mark elements.
7. `git status` — the tracked `M` list is unchanged from before this sprint; all new content lives in
   already-untracked or newly-created paths.

---

## 6. Known Limitations

1. **No photorealistic portraits** — see §1. The pipeline is real and ready; the assets themselves are
   placeholders, exactly as the brief's own contingency anticipated.
2. **No automated visual regression test and no browser was used to manually view the rendered page** —
   no browser-automation tool is available in this environment. Verified instead by: reading a generated
   SVG file directly for well-formedness, the machine-checked inversion-exactness test, and a clean
   production build (which would surface any `next/image`/SVG-optimizer wiring error). If a browser is
   available in a later session, a manual pass through `/labs/visual-intelligence/tratak/image-persistence`
   is recommended to visually confirm the new artwork reads as intended.
3. **The abstract face-motif designs use non-skin-tone, stylized colour palettes deliberately** (amber,
   sky-blue, rose-violet, emerald) rather than attempting literal skin tones — a deliberate choice to
   avoid crude or inaccurate skin-tone representation in non-figurative art, consistent with this
   codebase's existing abstract-art convention for this category.
4. **`imagePersistenceRandomEngine.ts` remains dead code**, confirmed again this sprint (zero production
   call sites) — not removed, since deleting unused-but-harmless code wasn't requested and carries its own
   small risk of missing a hidden caller; flagged for visibility only.
5. **The `generated/` staging folder is currently empty** apart from its README — by design, since no raw
   AI-generated assets exist yet to stage there.

---

## 7. Resume Instructions for Sprint 54

**Nothing has been done for Sprint 54 yet — no brief has been received.** When it arrives:

1. If it continues Tratak/Visual Intelligence work: read this document and
   `docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md` first. If real photorealistic assets become available,
   follow the pipeline doc's §6-7 exactly — drop files at the documented paths, add pool + observation-
   question entries, no other code change needed.
2. If a brief mentions "Image Persistence Challenge™" again: confirm which of the two same-named features
   it means before assuming (see §0 above) — this has been the single highest-risk ambiguity across both
   Sprint 52 and 53.
3. If it returns to the Reading Intelligence Lab™ arc: read `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md`
   and `docs/PRODUCTION_HANDOFF_SPRINT_51.md`, and resume that arc's own numbering independently.
4. If it continues the Breath Awareness™ UX line: read `docs/PRODUCTION_HANDOFF_UX_SPRINT_2.1.md`.
5. Verify using the same sequence as this sprint (§5) — the whole-repo baseline going forward is
   **469 test files / 3165 tests**, `tsc` clean, `eslint` clean, build green.
6. Report results and stop — do not begin further work without a new, explicit user instruction.

**Nothing else is pending.** The repository is fully clean, fully verified at this sprint's boundary.
