// Symbols dataset — 20 items for visual discrimination training.
// Difficulty is calibrated by visual similarity: distinct symbols are
// beginner; symbols that look alike (S/5, O/0, l/I) are advanced/expert.
// Categorised for Reading (visual discrimination) and Focus (attention).

import { createDataset } from '../contentEngine'

export const SYMBOLS_DATASET = createDataset({
  id: 'symbols-foundation',
  locale: 'en',
  contentType: 'symbol',
  rawItems: [
    // ── Beginner (6 items: highly distinct, common) ──
    { content: '@', difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: '#', difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: '$', difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: '%', difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: '&', difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: '*', difficulty: 'beginner', categories: ['reading', 'focus'] },

    // ── Easy (5 items: common but requiring more attention) ──
    { content: '!', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: '?', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: '+', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: '=', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: '~', difficulty: 'easy', categories: ['reading', 'focus'] },

    // ── Medium (4 items: common uppercase letters used as symbols) ──
    { content: 'A', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'T', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'E', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'X', difficulty: 'medium', categories: ['reading', 'focus', 'right-brain'] },

    // ── Advanced (3 items: visually similar to other characters) ──
    { content: 'O', difficulty: 'advanced', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'S', difficulty: 'advanced', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'Z', difficulty: 'advanced', categories: ['reading', 'focus', 'right-brain'] },

    // ── Expert (2 items: easily confused with digits or other symbols) ──
    { content: 'l', difficulty: 'expert', categories: ['reading', 'focus', 'right-brain'] },
    { content: 'I', difficulty: 'expert', categories: ['reading', 'focus', 'right-brain'] },
  ],
})
