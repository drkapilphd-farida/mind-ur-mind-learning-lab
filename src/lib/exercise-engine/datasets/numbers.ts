// Numbers dataset — 30 items across 5 difficulty tiers.
// Digit count increases with difficulty: 2→3→4→5→6 digits.
// Categorised for Reading (numeral recognition) and Memory (number recall).

import { createDataset } from '../contentEngine'

export const NUMBERS_DATASET = createDataset({
  id: 'numbers-foundation',
  locale: 'en',    // numbers are locale-independent but we tag 'en' for Arabic numerals
  contentType: 'number',
  rawItems: [
    // ── Beginner (8 items: 2-digit numbers, highly distinct) ──
    { content: '42',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: '17',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: '83',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: '56',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: '29',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: '74',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: '61',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: '38',  difficulty: 'beginner', categories: ['reading', 'memory'] },

    // ── Easy (7 items: 3-digit numbers) ──
    { content: '347', difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: '819', difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: '562', difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: '174', difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: '936', difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: '481', difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: '725', difficulty: 'easy', categories: ['reading', 'memory'] },

    // ── Medium (6 items: 4-digit numbers) ──
    { content: '3847', difficulty: 'medium', categories: ['memory'] },
    { content: '1296', difficulty: 'medium', categories: ['memory'] },
    { content: '7531', difficulty: 'medium', categories: ['memory'] },
    { content: '4682', difficulty: 'medium', categories: ['memory'] },
    { content: '9174', difficulty: 'medium', categories: ['memory'] },
    { content: '2859', difficulty: 'medium', categories: ['memory'] },

    // ── Advanced (5 items: 5-digit numbers) ──
    { content: '38472', difficulty: 'advanced', categories: ['memory'] },
    { content: '91634', difficulty: 'advanced', categories: ['memory'] },
    { content: '57208', difficulty: 'advanced', categories: ['memory'] },
    { content: '42985', difficulty: 'advanced', categories: ['memory'] },
    { content: '16374', difficulty: 'advanced', categories: ['memory'] },

    // ── Expert (4 items: 6-digit numbers) ──
    { content: '384729', difficulty: 'expert', categories: ['memory'] },
    { content: '916348', difficulty: 'expert', categories: ['memory'] },
    { content: '572081', difficulty: 'expert', categories: ['memory'] },
    { content: '429856', difficulty: 'expert', categories: ['memory'] },
  ],
})
