// Symbol Flash™ Dataset — curated single-glyph content for the Flash
// Intelligence Pack™'s third mission. Symbol Flash succeeds Rapid Visual
// Intelligence™'s Flash Symbols™ (same reasoning Word Flash and Number
// Flash used for 'word' and 'number' — contentType 'symbol' merges with
// that existing pool, which is the correct outcome for a successor
// exercise, not pool contamination).
//
// Every entry is a real, single Unicode glyph — never a composed or
// synthetic character. Word/Number Flash's difficulty axis was content
// length; Symbol Flash's within-session difficulty axis is compositional
// (how many symbols are shown together — see symbolFlashEngine.ts), so
// DifficultyTier here governs which symbols are drawn from at all
// (simple, everyday glyphs at Beginner; rarer, more visually dense glyphs
// at Master) — a real but different kind of progression.
//
// `metadata.family` groups symbols that are genuinely easy to mistake for
// one another at a glance (★/☆, ▲/△, </≤/«) — the exact same mechanism
// wordFlashDataset.ts uses for word families, applied to glyph shape
// instead of shared text prefix. This is what makes "wrong options must
// look visually similar" true by construction rather than by luck.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const SYMBOL_FLASH_DATASET = createDataset({
  id: 'en-symbol-flash-symbols',
  locale: 'en',
  contentType: 'symbol',
  rawItems: [
    // Beginner — simple, everyday glyphs
    { content: '@', difficulty: 'beginner' },
    { content: '#', difficulty: 'beginner' },
    { content: '%', difficulty: 'beginner' },
    { content: '&', difficulty: 'beginner' },
    { content: '$', difficulty: 'beginner' },
    { content: '?', difficulty: 'beginner', metadata: { family: 'punctuation' } },
    { content: '!', difficulty: 'beginner', metadata: { family: 'punctuation' } },

    // Easy — shapes and simple comparisons
    { content: '★', difficulty: 'easy', metadata: { family: 'star' } },
    { content: '☆', difficulty: 'easy', metadata: { family: 'star' } },
    { content: '▲', difficulty: 'easy', metadata: { family: 'triangle' } },
    { content: '△', difficulty: 'easy', metadata: { family: 'triangle' } },
    { content: '✓', difficulty: 'easy', metadata: { family: 'check' } },
    { content: '✔', difficulty: 'easy', metadata: { family: 'check' } },
    { content: '<', difficulty: 'easy' },
    { content: '>', difficulty: 'easy' },

    // Medium — more shapes
    { content: '■', difficulty: 'medium', metadata: { family: 'square' } },
    { content: '□', difficulty: 'medium', metadata: { family: 'square' } },
    { content: '●', difficulty: 'medium', metadata: { family: 'circle' } },
    { content: '○', difficulty: 'medium', metadata: { family: 'circle' } },
    { content: '✕', difficulty: 'medium', metadata: { family: 'cross' } },
    { content: '✗', difficulty: 'medium', metadata: { family: 'cross' } },
    { content: '◆', difficulty: 'medium', metadata: { family: 'diamond' } },
    { content: '◇', difficulty: 'medium', metadata: { family: 'diamond' } },

    // Advanced — directional arrows
    { content: '↑', difficulty: 'advanced', metadata: { family: 'arrow-up' } },
    { content: '⇑', difficulty: 'advanced', metadata: { family: 'arrow-up' } },
    { content: '↓', difficulty: 'advanced', metadata: { family: 'arrow-down' } },
    { content: '⇓', difficulty: 'advanced', metadata: { family: 'arrow-down' } },
    { content: '←', difficulty: 'advanced', metadata: { family: 'arrow-left' } },
    { content: '⇐', difficulty: 'advanced', metadata: { family: 'arrow-left' } },
    { content: '→', difficulty: 'advanced', metadata: { family: 'arrow-right' } },
    { content: '⇒', difficulty: 'advanced', metadata: { family: 'arrow-right' } },

    // Expert — brackets and approximation
    { content: '(', difficulty: 'expert', metadata: { family: 'bracket-round' } },
    { content: ')', difficulty: 'expert', metadata: { family: 'bracket-round' } },
    { content: '{', difficulty: 'expert', metadata: { family: 'bracket-curly' } },
    { content: '}', difficulty: 'expert', metadata: { family: 'bracket-curly' } },
    { content: '[', difficulty: 'expert', metadata: { family: 'bracket-square' } },
    { content: ']', difficulty: 'expert', metadata: { family: 'bracket-square' } },
    { content: '≈', difficulty: 'expert', metadata: { family: 'approx' } },
    { content: '≠', difficulty: 'expert', metadata: { family: 'approx' } },

    // Elite — currency and legal marks
    { content: '€', difficulty: 'elite', metadata: { family: 'currency' } },
    { content: '₹', difficulty: 'elite', metadata: { family: 'currency' } },
    { content: '£', difficulty: 'elite', metadata: { family: 'currency' } },
    { content: '¥', difficulty: 'elite', metadata: { family: 'currency' } },
    { content: '¢', difficulty: 'elite', metadata: { family: 'currency' } },
    { content: '©', difficulty: 'elite', metadata: { family: 'legal' } },
    { content: '®', difficulty: 'elite', metadata: { family: 'legal' } },
    { content: '™', difficulty: 'elite', metadata: { family: 'legal' } },

    // Master — dense, rarely-seen glyphs
    { content: '∞', difficulty: 'master' },
    { content: '°', difficulty: 'master' },
    { content: '§', difficulty: 'master', metadata: { family: 'typographic' } },
    { content: '¶', difficulty: 'master', metadata: { family: 'typographic' } },
    { content: '†', difficulty: 'master', metadata: { family: 'dagger' } },
    { content: '‡', difficulty: 'master', metadata: { family: 'dagger' } },
    { content: '±', difficulty: 'master', metadata: { family: 'math-op' } },
    { content: '×', difficulty: 'master', metadata: { family: 'math-op' } },
  ],
})
