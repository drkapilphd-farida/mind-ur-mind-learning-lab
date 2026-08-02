// Memory Discovery™ Object Dataset — concrete, instantly recognizable
// everyday objects for Visual Memory™.
//
// contentType is 'everyday-object', not 'word': the existing word pools
// (wordFlashDataset.ts, the foundation dataset) skew abstract/academic
// (calm, focus, cognitive, insight) — the opposite of what this
// experiment needs, which is simple, concrete, drawable nouns a reader
// visualizes instantly. Object familiarity (not word length) is the
// difficulty axis here.
//
// 16 items/tier (doubled from 8) — a later refinement found the original
// 8-per-tier pool meant "6 shown + 4 decoys" per session drew nearly the
// entire tier every time, so replays showed almost the same objects in a
// different order. A wider pool is the actual fix for "I already saw
// this," not just better shuffling of a pool too small to vary.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const MEMORY_DISCOVERY_OBJECT_DATASET = createDataset({
  id: 'en-memory-discovery-objects',
  locale: 'en',
  contentType: 'everyday-object',
  rawItems: [
    // Beginner — objects seen every day
    { content: 'apple', difficulty: 'beginner', categories: ['memory'] },
    { content: 'book', difficulty: 'beginner', categories: ['memory'] },
    { content: 'cup', difficulty: 'beginner', categories: ['memory'] },
    { content: 'clock', difficulty: 'beginner', categories: ['memory'] },
    { content: 'leaf', difficulty: 'beginner', categories: ['memory'] },
    { content: 'key', difficulty: 'beginner', categories: ['memory'] },
    { content: 'chair', difficulty: 'beginner', categories: ['memory'] },
    { content: 'spoon', difficulty: 'beginner', categories: ['memory'] },
    { content: 'shoe', difficulty: 'beginner', categories: ['memory'] },
    { content: 'hat', difficulty: 'beginner', categories: ['memory'] },
    { content: 'ball', difficulty: 'beginner', categories: ['memory'] },
    { content: 'plate', difficulty: 'beginner', categories: ['memory'] },
    { content: 'brush', difficulty: 'beginner', categories: ['memory'] },
    { content: 'sock', difficulty: 'beginner', categories: ['memory'] },
    { content: 'lamp', difficulty: 'beginner', categories: ['memory'] },
    { content: 'pencil', difficulty: 'beginner', categories: ['memory'] },

    // Easy — still common, slightly less frequent
    { content: 'candle', difficulty: 'easy', categories: ['memory'] },
    { content: 'pillow', difficulty: 'easy', categories: ['memory'] },
    { content: 'mirror', difficulty: 'easy', categories: ['memory'] },
    { content: 'basket', difficulty: 'easy', categories: ['memory'] },
    { content: 'ladder', difficulty: 'easy', categories: ['memory'] },
    { content: 'umbrella', difficulty: 'easy', categories: ['memory'] },
    { content: 'blanket', difficulty: 'easy', categories: ['memory'] },
    { content: 'bottle', difficulty: 'easy', categories: ['memory'] },
    { content: 'wallet', difficulty: 'easy', categories: ['memory'] },
    { content: 'scarf', difficulty: 'easy', categories: ['memory'] },
    { content: 'whistle', difficulty: 'easy', categories: ['memory'] },
    { content: 'necklace', difficulty: 'easy', categories: ['memory'] },
    { content: 'suitcase', difficulty: 'easy', categories: ['memory'] },
    { content: 'kite', difficulty: 'easy', categories: ['memory'] },
    { content: 'globe', difficulty: 'easy', categories: ['memory'] },
    { content: 'trophy', difficulty: 'easy', categories: ['memory'] },

    // Medium — recognizable but a little more specific
    { content: 'compass', difficulty: 'medium', categories: ['memory'] },
    { content: 'lantern', difficulty: 'medium', categories: ['memory'] },
    { content: 'anchor', difficulty: 'medium', categories: ['memory'] },
    { content: 'telescope', difficulty: 'medium', categories: ['memory'] },
    { content: 'envelope', difficulty: 'medium', categories: ['memory'] },
    { content: 'kettle', difficulty: 'medium', categories: ['memory'] },
    { content: 'bracelet', difficulty: 'medium', categories: ['memory'] },
    { content: 'hammer', difficulty: 'medium', categories: ['memory'] },
    { content: 'binoculars', difficulty: 'medium', categories: ['memory'] },
    { content: 'violin', difficulty: 'medium', categories: ['memory'] },
    { content: 'thermometer', difficulty: 'medium', categories: ['memory'] },
    { content: 'padlock', difficulty: 'medium', categories: ['memory'] },
    { content: 'canteen', difficulty: 'medium', categories: ['memory'] },
    { content: 'satchel', difficulty: 'medium', categories: ['memory'] },
    { content: 'inkwell', difficulty: 'medium', categories: ['memory'] },
    { content: 'magnet', difficulty: 'medium', categories: ['memory'] },

    // Advanced — still concrete, less everyday
    { content: 'hourglass', difficulty: 'advanced', categories: ['memory'] },
    { content: 'chandelier', difficulty: 'advanced', categories: ['memory'] },
    { content: 'typewriter', difficulty: 'advanced', categories: ['memory'] },
    { content: 'kaleidoscope', difficulty: 'advanced', categories: ['memory'] },
    { content: 'harmonica', difficulty: 'advanced', categories: ['memory'] },
    { content: 'stethoscope', difficulty: 'advanced', categories: ['memory'] },
    { content: 'pendulum', difficulty: 'advanced', categories: ['memory'] },
    { content: 'easel', difficulty: 'advanced', categories: ['memory'] },
    { content: 'accordion', difficulty: 'advanced', categories: ['memory'] },
    { content: 'quill', difficulty: 'advanced', categories: ['memory'] },
    { content: 'lockbox', difficulty: 'advanced', categories: ['memory'] },
    { content: 'weathervane', difficulty: 'advanced', categories: ['memory'] },
    { content: 'birdcage', difficulty: 'advanced', categories: ['memory'] },
    { content: 'spyglass', difficulty: 'advanced', categories: ['memory'] },
    { content: 'tambourine', difficulty: 'advanced', categories: ['memory'] },
    { content: 'sundial', difficulty: 'advanced', categories: ['memory'] },

    // Expert — specialized objects
    { content: 'astrolabe', difficulty: 'expert', categories: ['memory'] },
    { content: 'sextant', difficulty: 'expert', categories: ['memory'] },
    { content: 'metronome', difficulty: 'expert', categories: ['memory'] },
    { content: 'barometer', difficulty: 'expert', categories: ['memory'] },
    { content: 'gyroscope', difficulty: 'expert', categories: ['memory'] },
    { content: 'caliper', difficulty: 'expert', categories: ['memory'] },
    { content: 'crucible', difficulty: 'expert', categories: ['memory'] },
    { content: 'monocle', difficulty: 'expert', categories: ['memory'] },
    { content: 'abacus', difficulty: 'expert', categories: ['memory'] },
    { content: 'centrifuge', difficulty: 'expert', categories: ['memory'] },
    { content: 'sonometer', difficulty: 'expert', categories: ['memory'] },
    { content: 'planisphere', difficulty: 'expert', categories: ['memory'] },
    { content: 'chronometer', difficulty: 'expert', categories: ['memory'] },
    { content: 'protractor', difficulty: 'expert', categories: ['memory'] },
    { content: 'micrometer', difficulty: 'expert', categories: ['memory'] },
    { content: 'periscope', difficulty: 'expert', categories: ['memory'] },
  ],
})
