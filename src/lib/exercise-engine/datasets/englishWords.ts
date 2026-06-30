// English Words dataset — 50 items across all 5 difficulty tiers.
// Extends the 37 words from Sprint 5A's ENGLISH_WORDS_FOUNDATION with
// 13 additional items to reach the 50-word demo target.
//
// All items categorised for Reading and Memory — the two primary consumers
// of word recognition content in the platform.

import { createDataset } from '../contentEngine'

export const ENGLISH_WORDS_DATASET = createDataset({
  id: 'en-words-foundation-v2',
  locale: 'en',
  contentType: 'word',
  rawItems: [
    // ── Beginner (10 items: common, 3–4 letters, high visual distinctiveness) ──
    { content: 'cat',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: 'dog',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: 'sun',  difficulty: 'beginner', categories: ['reading', 'visualization'] },
    { content: 'run',  difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: 'big',  difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: 'sky',  difficulty: 'beginner', categories: ['reading', 'visualization'] },
    { content: 'read', difficulty: 'beginner', categories: ['reading'] },
    { content: 'mind', difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: 'grow', difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: 'flow', difficulty: 'beginner', categories: ['reading', 'focus'] },

    // ── Easy (10 items: 5 letters, common vocabulary) ──
    { content: 'focus', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'brain', difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: 'speed', difficulty: 'easy', categories: ['reading'] },
    { content: 'light', difficulty: 'easy', categories: ['reading', 'visualization'] },
    { content: 'power', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'learn', difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: 'sharp', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'think', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'clear', difficulty: 'easy', categories: ['reading', 'visualization'] },
    { content: 'aware', difficulty: 'easy', categories: ['reading', 'focus'] },

    // ── Medium (15 items: 6–7 letters, varied vocabulary) ──
    { content: 'reading',  difficulty: 'medium', categories: ['reading'] },
    { content: 'pattern',  difficulty: 'medium', categories: ['reading', 'memory'] },
    { content: 'balance',  difficulty: 'medium', categories: ['reading', 'focus'] },
    { content: 'control',  difficulty: 'medium', categories: ['reading', 'focus'] },
    { content: 'mastery',  difficulty: 'medium', categories: ['reading', 'memory'] },
    { content: 'clarity',  difficulty: 'medium', categories: ['reading', 'visualization'] },
    { content: 'insight',  difficulty: 'medium', categories: ['reading', 'memory'] },
    { content: 'develop',  difficulty: 'medium', categories: ['reading'] },
    { content: 'forward',  difficulty: 'medium', categories: ['reading', 'focus'] },
    { content: 'capture',  difficulty: 'medium', categories: ['reading', 'memory'] },
    { content: 'session',  difficulty: 'medium', categories: ['reading', 'focus'] },
    { content: 'improve',  difficulty: 'medium', categories: ['reading'] },
    { content: 'success',  difficulty: 'medium', categories: ['reading', 'focus'] },
    { content: 'journey',  difficulty: 'medium', categories: ['reading', 'visualization'] },
    { content: 'mindful',  difficulty: 'medium', categories: ['reading', 'focus'] },

    // ── Advanced (10 items: 8+ letters or lower frequency) ──
    { content: 'cognitive',   difficulty: 'advanced', categories: ['reading', 'memory'] },
    { content: 'retention',   difficulty: 'advanced', categories: ['reading', 'memory'] },
    { content: 'bandwidth',   difficulty: 'advanced', categories: ['reading'] },
    { content: 'visualize',   difficulty: 'advanced', categories: ['reading', 'visualization'] },
    { content: 'persevere',   difficulty: 'advanced', categories: ['reading', 'focus'] },
    { content: 'integrate',   difficulty: 'advanced', categories: ['reading', 'memory'] },
    { content: 'absorption',  difficulty: 'advanced', categories: ['reading'] },
    { content: 'consistency', difficulty: 'advanced', categories: ['reading', 'focus'] },
    { content: 'accelerate',  difficulty: 'advanced', categories: ['reading'] },
    { content: 'comprehend',  difficulty: 'advanced', categories: ['reading', 'memory'] },

    // ── Expert (5 items: rare, technical, or longer) ──
    { content: 'tachistoscope',   difficulty: 'expert', categories: ['reading'] },
    { content: 'metacognition',   difficulty: 'expert', categories: ['reading', 'memory'] },
    { content: 'subvocalisation', difficulty: 'expert', categories: ['reading'] },
    { content: 'neuroplasticity', difficulty: 'expert', categories: ['memory'] },
    { content: 'disambiguation',  difficulty: 'expert', categories: ['reading', 'memory'] },
  ],
})
