// Expanded Phrases dataset — 45 items for Flash Phrases™.
// Replaces the 13-item ENGLISH_PHRASES_FOUNDATION from Sprint 5A.
// All phrases are transformation-focused and educationally relevant.

import { createDataset } from '../../contentEngine'

export const PHRASES_DATASET = createDataset({
  id: 'en-phrases-foundation-v2',
  locale: 'en',
  contentType: 'phrase',
  rawItems: [
    // ── Beginner: short 2-word phrases ──
    { content: 'read fast',     difficulty: 'beginner', categories: ['reading'] },
    { content: 'stay calm',     difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: 'eyes open',     difficulty: 'beginner', categories: ['reading'] },
    { content: 'think clear',   difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: 'move forward',  difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: 'stay sharp',    difficulty: 'beginner', categories: ['focus'] },
    { content: 'brain grows',   difficulty: 'beginner', categories: ['memory'] },
    { content: 'build focus',   difficulty: 'beginner', categories: ['focus'] },
    { content: 'be present',    difficulty: 'beginner', categories: ['focus', 'meditation'] },
    { content: 'think deep',    difficulty: 'beginner', categories: ['focus'] },

    // ── Easy: 3-word phrases ──
    { content: 'mind over matter',   difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'keep going now',     difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'see more clearly',   difficulty: 'easy', categories: ['reading', 'visualization'] },
    { content: 'read with ease',     difficulty: 'easy', categories: ['reading'] },
    { content: 'train your brain',   difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: 'stay in flow',       difficulty: 'easy', categories: ['focus'] },
    { content: 'grow every day',     difficulty: 'easy', categories: ['reading', 'memory'] },
    { content: 'focus builds speed', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'trust the process',  difficulty: 'easy', categories: ['focus'] },
    { content: 'think then act',     difficulty: 'easy', categories: ['focus', 'memory'] },
    { content: 'notice every word',  difficulty: 'easy', categories: ['reading'] },
    { content: 'small steps matter', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'calm and steady',    difficulty: 'easy', categories: ['focus', 'meditation'] },
    { content: 'speed comes later',  difficulty: 'easy', categories: ['reading'] },
    { content: 'one word at time',   difficulty: 'easy', categories: ['reading'] },

    // ── Medium: 4-5 word phrases ──
    { content: 'your brain is adapting',      difficulty: 'medium', categories: ['memory'] },
    { content: 'reading speed is growing',    difficulty: 'medium', categories: ['reading'] },
    { content: 'focus creates real clarity',  difficulty: 'medium', categories: ['focus'] },
    { content: 'every session builds strength', difficulty: 'medium', categories: ['reading', 'focus'] },
    { content: 'consistency is your power',   difficulty: 'medium', categories: ['reading', 'focus'] },
    { content: 'your mind is getting faster', difficulty: 'medium', categories: ['reading'] },
    { content: 'pattern recognition improves', difficulty: 'medium', categories: ['reading', 'memory'] },
    { content: 'silent reading is a skill',   difficulty: 'medium', categories: ['reading'] },
    { content: 'peripheral vision expands',   difficulty: 'medium', categories: ['reading', 'visualization'] },
    { content: 'attention shapes the outcome', difficulty: 'medium', categories: ['focus'] },

    // ── Advanced: 5-6 word phrases ──
    { content: 'your visual cortex is rewiring',       difficulty: 'advanced', categories: ['reading', 'memory'] },
    { content: 'subvocalisation slows reading down',   difficulty: 'advanced', categories: ['reading'] },
    { content: 'chunking text accelerates comprehension', difficulty: 'advanced', categories: ['reading', 'memory'] },
    { content: 'metacognition improves learning transfer', difficulty: 'advanced', categories: ['memory'] },
    { content: 'deep focus requires deliberate practice', difficulty: 'advanced', categories: ['focus'] },
    { content: 'memory palace encodes spatial location',  difficulty: 'advanced', categories: ['memory', 'visualization'] },
    { content: 'neuroplasticity responds to consistent training', difficulty: 'advanced', categories: ['memory'] },
    { content: 'spaced repetition maximises long-term recall',   difficulty: 'advanced', categories: ['memory'] },
    { content: 'visual processing speed is trainable',           difficulty: 'advanced', categories: ['reading', 'focus'] },
    { content: 'comprehension depends on background knowledge',  difficulty: 'advanced', categories: ['reading', 'memory'] },

    // ── Expert: technical/scientific (for advanced learners) ──
    { content: 'tachistoscopic training improves saccadic speed', difficulty: 'expert', categories: ['reading'] },
    { content: 'binocular rivalry reveals unconscious processing', difficulty: 'expert', categories: ['reading', 'focus'] },
    { content: 'attentional blink limits rapid sequential recognition', difficulty: 'expert', categories: ['focus', 'memory'] },
    { content: 'parafoveal preview facilitates fluent reading', difficulty: 'expert', categories: ['reading'] },
    { content: 'semantic priming reduces lexical access time', difficulty: 'expert', categories: ['reading', 'memory'] },
  ],
})
