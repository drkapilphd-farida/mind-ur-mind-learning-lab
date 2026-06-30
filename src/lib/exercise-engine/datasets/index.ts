// Universal Dataset Registry — import this file once to register all demo datasets.
//
// Every exercise that imports from the exercise engine will automatically have
// access to all registered datasets via getDataset() / listDatasets().
// Adding a new dataset: create its file, add one import line here. No other
// code changes required — all consumers see the new dataset immediately.

// ── Built-in demo datasets ────────────────────────────────────────────────

// English Words (50 items, 5 difficulty tiers)
export { ENGLISH_WORDS_DATASET } from './englishWords'

// Numbers (30 items, 5 difficulty tiers, 2–6 digits)
export { NUMBERS_DATASET } from './numbers'

// Symbols (20 items, visual discrimination)
export { SYMBOLS_DATASET } from './symbols'

// Shapes (20 items, visualization + right brain)
export { SHAPES_DATASET } from './shapes'

// Letters (20 items, reading readiness + right brain)
export { LETTERS_DATASET } from './letters'

// ── Sprint 5A built-in datasets (still registered) ───────────────────────
// ENGLISH_WORDS_FOUNDATION and ENGLISH_PHRASES_FOUNDATION from contentEngine.ts
// register themselves on import of contentEngine. No additional lines needed.

// ── Future datasets (add new imports here) ────────────────────────────────
// export { HINDI_WORDS_DATASET } from './hindiWords'
// export { GUJARATI_WORDS_DATASET } from './gujaratiWords'
// export { MEMORY_CARDS_DATASET } from './memoryCards'
// export { PDF_CHUNKS_DATASET } from './pdfContent'  // future AI Learning Studio
