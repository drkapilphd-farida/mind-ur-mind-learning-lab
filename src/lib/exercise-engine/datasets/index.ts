// Universal Intelligence Dataset™ Registry
// Import this file ONCE to register all datasets with the engine.
// Adding a new dataset: create its file, add one export line here.
// Zero other code changes needed — all exercises see the new dataset immediately.

// ── English Language ──────────────────────────────────────────────────────
export { ENGLISH_WORDS_DATASET } from './englishWords'        // 50 words, 5 tiers

// ── Hindi Language ────────────────────────────────────────────────────────
export { HINDI_WORDS_DATASET } from './hindi/words'           // 30 words, multilingual demo

// ── Numbers ───────────────────────────────────────────────────────────────
export { NUMBERS_DATASET } from './numbers'                   // 30 numbers, 2-6 digits

// ── Symbols & Characters ──────────────────────────────────────────────────
export { SYMBOLS_DATASET } from './symbols'                   // 20 symbols
export { LETTERS_DATASET } from './letters'                   // 20 letters

// ── Shapes ────────────────────────────────────────────────────────────────
export { SHAPES_DATASET } from './shapes'                     // 20 shapes

// ── Colors ────────────────────────────────────────────────────────────────
export { COLORS_DATASET } from './colors/index'               // 24 colors with hex values

// ── Phrases & Sentences ───────────────────────────────────────────────────
export { PHRASES_DATASET } from './phrases/index'             // 45 phrases, 5 tiers
export { SENTENCES_DATASET } from './sentences/index'         // 25 sentences, 5 tiers

// ── Visual / Illustrations ────────────────────────────────────────────────
export { ILLUSTRATIONS_DATASET } from './illustrations/index' // 24 icon-based illustrations

// ── Sprint 5A built-in datasets (still registered) ───────────────────────
// ENGLISH_WORDS_FOUNDATION and ENGLISH_PHRASES_FOUNDATION from contentEngine.ts
// register themselves on import of contentEngine — no additional lines needed.

// ── Future datasets (add new imports here) ────────────────────────────────
// export { GUJARATI_WORDS_DATASET } from './gujarati/words'
// export { TAMIL_WORDS_DATASET } from './tamil/words'
// export { MARATHI_WORDS_DATASET } from './marathi/words'
// export { MEMORY_CARDS_DATASET } from './memory/cards'
// export { EXAM_VOCAB_DATASET } from './exam-practice/vocabulary'
// export { PDF_CHUNKS_DATASET } from './ai-generated/pdf-extracted'  // Future AI Learning Studio
// export { AI_GENERATED_DATASET } from './ai-generated/generated'

// ── Total demo dataset summary ────────────────────────────────────────────
// English words:   50 items
// Hindi words:     30 items
// Numbers:         30 items
// Symbols:         20 items
// Letters:         20 items
// Shapes:          20 items
// Colors:          24 items
// Phrases:         45 items
// Sentences:       25 items
// Illustrations:   24 items
// ─────────────────────────
// Total:          288 items across 10 datasets / 2 languages
