# Datasets

[← Back to index](./PROJECT_BLUEPRINT.md)

Every dataset in this project follows the same rules, stated in every dataset file's own header comment and enforced sprint after sprint:

- **No AI-generated content.** No API calls. No file upload. No lorem ipsum.
- Real, hand-authored, meaningful, grammatically correct content only.
- Thematically consistent register across the whole project: reading, focus, growth, patience, wisdom, resilience.
- Exported as `readonly ReadingUnit[]` (see [ARCHITECTURE.md](./ARCHITECTURE.md) for the `ReadingUnit` type), with stable, index-derived ids (`'word-0'`, `'phrase-12'`, `'sentence-3'`, `'paragraph-7'`, etc.) for React keys.
- Ordered short-to-long / easy-to-hard where the mode has a meaningful difficulty axis, so a session naturally ramps up.

## Word dataset

**File:** `src/features/quantum-speed-reading/verticalWordReadingDataset.ts`
**Size:** 90 unique words.
**Structure:** a flat list — deliberately not organized into lines/passages, since Vertical Word Reading presents one word at a time down a single column.
**Difficulty:** no explicit difficulty tiers — all 90 words are roughly comparable single tokens; variation comes from reading pace, not content complexity.
**Exports:** `VERTICAL_WORD_READING_WORDS: readonly string[]` (raw), `TOTAL_VERTICAL_WORD_READING_WORDS: number`, `VERTICAL_WORD_READING_UNITS: readonly ReadingUnit[]` (derived, `id: 'word-${index}'`).

## Phrase dataset

**File:** `src/features/phrase-reading-mode/phraseReadingModeDataset.ts`
**Size:** 61 phrases, derived from 18 full source sentences.
**Structure:** each source sentence is split into natural 2–4 word syntactic chunks (subject group / verb group / prepositional phrase — e.g. "The quick brown" / "fox jumps over" / "the lazy dog"), then the whole set is flattened into one sequential array. The private, unexported `PHRASE_READING_MODE_PHRASES` array holds the flattened list; only the derived `ReadingUnit[]` is exported.
**Difficulty:** no explicit tiering by phrase — difficulty here comes from chunk size (2 vs. 4 words) more than vocabulary complexity.
**Exports:** `PHRASE_READING_MODE_UNITS: readonly ReadingUnit[]`, `TOTAL_PHRASE_READING_MODE_UNITS: number`.

## Sentence dataset

**File:** `src/features/sentence-reading-mode/sentenceReadingModeDataset.ts`
**Size:** 18 complete sentences.
**Structure:** three explicit difficulty groups, concatenated in order:
- `LEVEL_1_SHORT_SENTENCES` (6 sentences, ~4–6 words each)
- `LEVEL_2_MEDIUM_SENTENCES` (6 sentences, ~9–12 words each)
- `LEVEL_3_LONG_SENTENCES` (6 sentences, ~15–19 words each)

Unlike Phrase Reading, each `ReadingUnit` here is one **entire, uninterrupted** sentence — content is not chunked further.
**Exports:** `SENTENCE_READING_MODE_UNITS: readonly ReadingUnit[]`, `TOTAL_SENTENCE_READING_MODE_UNITS: number`.

## Paragraph dataset

**File:** `src/features/paragraph-reading-mode/paragraphReadingModeDataset.ts`
**Size:** 8 paragraphs, ~430 words total.
**Structure:** no explicit named difficulty tiers (unlike Sentence Reading's 3 named levels), but paragraphs are hand-ordered short-to-long: from a ~30-word 3-sentence paragraph up to a ~75-word paragraph. Each `ReadingUnit` is one entire, multi-sentence paragraph — the largest content unit in the project.
**Exports:** `PARAGRAPH_READING_MODE_UNITS: readonly ReadingUnit[]`, `TOTAL_PARAGRAPH_READING_MODE_UNITS: number`.

## Summary table

| Dataset | File | Units | Difficulty structure | Unit = |
|---|---|---|---|---|
| Word | `verticalWordReadingDataset.ts` | 90 | None (flat) | 1 word |
| Phrase | `phraseReadingModeDataset.ts` | 61 (from 18 sentences) | None (flat, chunk-size varies) | 2–4 word chunk |
| Sentence | `sentenceReadingModeDataset.ts` | 18 | 3 named levels (6 each) | 1 sentence |
| Paragraph | `paragraphReadingModeDataset.ts` | 8 | Ordered by length, no named tiers | 1 paragraph |

## Folder structure for datasets

Each mode's dataset lives as a single top-level `.ts` file directly inside that mode's own feature folder (not in a nested `datasets/` subfolder) — see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for the complete tree. There is no shared/central dataset registry file; each mode's `*Experience.tsx` imports its own dataset directly by path.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Folder Structure →](./FOLDER_STRUCTURE.md)
