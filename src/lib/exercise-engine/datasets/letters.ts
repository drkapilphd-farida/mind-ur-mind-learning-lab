// Letters dataset — 20 items for visual discrimination and reading readiness.
// Beginner: highly distinct letters (T, O, X).
// Expert: visually similar letters that commonly cause confusion (b/d/p/q).
// Categorised for Reading and Right Brain training.

import { createDataset } from '../contentEngine'

export const LETTERS_DATASET = createDataset({
  id: 'letters-foundation',
  locale: 'en',
  contentType: 'letter',
  rawItems: [
    // ── Beginner (6 items: globally distinct letterforms) ──
    { content: 'T', difficulty: 'beginner', categories: ['reading', 'right-brain'] },
    { content: 'O', difficulty: 'beginner', categories: ['reading', 'right-brain'] },
    { content: 'X', difficulty: 'beginner', categories: ['reading', 'right-brain'] },
    { content: 'W', difficulty: 'beginner', categories: ['reading', 'right-brain'] },
    { content: 'A', difficulty: 'beginner', categories: ['reading', 'right-brain'] },
    { content: 'L', difficulty: 'beginner', categories: ['reading', 'right-brain'] },

    // ── Easy (5 items: recognisable, less distinct than beginner) ──
    { content: 'F', difficulty: 'easy', categories: ['reading', 'right-brain'] },
    { content: 'J', difficulty: 'easy', categories: ['reading', 'right-brain'] },
    { content: 'K', difficulty: 'easy', categories: ['reading', 'right-brain'] },
    { content: 'M', difficulty: 'easy', categories: ['reading', 'right-brain'] },
    { content: 'Z', difficulty: 'easy', categories: ['reading', 'right-brain'] },

    // ── Medium (5 items: moderate similarity to others) ──
    { content: 'G', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'S', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'N', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'U', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'C', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },

    // ── Advanced / Expert (4 items: letters commonly confused with each other) ──
    { content: 'b', difficulty: 'advanced', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'd', difficulty: 'advanced', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'p', difficulty: 'expert',   categories: ['reading', 'focus', 'right-brain'] },
    { content: 'q', difficulty: 'expert',   categories: ['reading', 'focus', 'right-brain'] },
  ],
})
