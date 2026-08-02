// Phrase Reading Dataset™ — curated, complete, grammatically whole
// sentences. Each phrase IS the stimulus directly; nothing is extracted as
// a sliding window from a longer sentence. Word count is the difficulty
// axis, matching PHRASE_DIFFICULTY_PROFILES exactly (beginner=3, easy=4,
// advanced=5, elite=6 — medium/expert/master share the adjacent tier's pool
// via the difficulty-tier fallback already built into datasetEngine.ts,
// since they want the identical word count). contentType is the dedicated
// 'reading-phrase' — NOT 'phrase' (Flash Phrases' lowercase, unpunctuated
// affirmation fragments visibly clash with complete sentences mid-session)
// and NOT 'sentence' (the generic SENTENCES_DATASET's much longer
// free-form sentences would reintroduce the length mismatch this dataset
// exists to remove). Themed: education, neuroscience, reading, memory,
// focus, learning, psychology.
//
// Expanded (24 items/tier, up from 8) for Progressive Chunk Reading™'s
// Level 4 ("Natural Reading"), which draws this pool directly rather than
// authoring separate "natural phrase" content — a deliberate reuse choice.
// The new entries deliberately explore different angles (sleep, curiosity,
// environment, feedback) than chunkDataset.ts's expansion, so a session
// drawing from both pools (Level 5) never reads as a re-punctuated repeat
// of a chunk it just showed.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const PHRASE_READING_DATASET = createDataset({
  id: 'en-phrase-reading-sentences-v2',
  locale: 'en',
  contentType: 'reading-phrase',
  rawItems: [
    // 3 words — beginner
    { content: 'Reading becomes effortless.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Practice improves perception.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Focus builds mastery.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Memory needs repetition.', difficulty: 'beginner', categories: ['memory'] },
    { content: 'Attention shapes learning.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Calm minds focus.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Habits create change.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Perception requires practice.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Curiosity drives learning.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Sleep aids memory.', difficulty: 'beginner', categories: ['memory'] },
    { content: 'Structure reduces effort.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Silence sharpens thought.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Motivation fuels persistence.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Environment shapes behavior.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Rest restores focus.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Consistency beats intensity.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Small steps compound.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Questions deepen understanding.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Patience rewards practice.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Movement clears thinking.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Novelty aids retention.', difficulty: 'beginner', categories: ['memory'] },
    { content: 'Feedback guides improvement.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Breathing calms nerves.', difficulty: 'beginner', categories: ['focus'] },
    { content: 'Curiosity sustains motivation.', difficulty: 'beginner', categories: ['focus'] },

    // 4 words — easy (medium falls back here)
    { content: 'The brain processes patterns.', difficulty: 'easy', categories: ['memory'] },
    { content: 'Memory strengthens through repetition.', difficulty: 'easy', categories: ['memory'] },
    { content: 'Reading speed improves gradually.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Focused attention aids comprehension.', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'Daily practice builds skill.', difficulty: 'easy', categories: ['focus'] },
    { content: 'The mind craves structure.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Learning requires active engagement.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Visual training sharpens perception.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Sleep consolidates new memories.', difficulty: 'easy', categories: ['memory'] },
    { content: 'Curiosity accelerates the process.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Small wins build momentum.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Silence improves reading focus.', difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'Rest between sessions helps.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Structure reduces mental fatigue.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Feedback accelerates skill growth.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Movement can boost alertness.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Novel content aids retention.', difficulty: 'easy', categories: ['memory'] },
    { content: 'Environment influences learning speed.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Patience outperforms rushed effort.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Questions deepen real comprehension.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Breathing steadies wandering attention.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Motivation sustains long practice.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Variety keeps minds engaged.', difficulty: 'easy', categories: ['focus'] },
    { content: 'Short breaks restore concentration.', difficulty: 'easy', categories: ['focus'] },

    // 5 words — advanced (expert falls back here)
    { content: 'Visual attention expands with practice.', difficulty: 'advanced', categories: ['reading', 'focus'] },
    { content: 'The brain adapts to challenges.', difficulty: 'advanced', categories: ['memory'] },
    { content: 'Consistent practice strengthens neural pathways.', difficulty: 'advanced', categories: ['memory'] },
    { content: 'Memory retention improves through repetition.', difficulty: 'advanced', categories: ['memory'] },
    { content: 'Reading fluency develops through practice.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'Calm minds absorb information faster.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Focused practice builds lasting habits.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Deliberate training expands visual span.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'Sleep plays a vital role.', difficulty: 'advanced', categories: ['memory'] },
    { content: 'Curiosity accelerates deep understanding overall.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'Small consistent wins build momentum.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Silence often improves reading focus.', difficulty: 'advanced', categories: ['reading', 'focus'] },
    { content: 'Rest between sessions aids retention.', difficulty: 'advanced', categories: ['memory'] },
    { content: 'Structure reduces unnecessary mental fatigue.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Feedback accelerates meaningful skill growth.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Novel content improves long-term retention.', difficulty: 'advanced', categories: ['memory'] },
    { content: 'Environment strongly influences learning speed.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'Patience consistently outperforms rushed effort.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Questions often deepen real comprehension.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'Breathing exercises steady wandering attention.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Motivation sustains genuinely long practice.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Variety consistently keeps minds engaged.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Short breaks truly restore concentration.', difficulty: 'advanced', categories: ['focus'] },
    { content: 'Movement genuinely can boost alertness.', difficulty: 'advanced', categories: ['focus'] },

    // 6 words — elite (master falls back here)
    { content: 'The brain adapts through daily practice.', difficulty: 'elite', categories: ['memory'] },
    { content: 'Neuroscience shows practice reshapes the brain.', difficulty: 'elite', categories: ['memory'] },
    { content: 'Visual attention expands with deliberate training.', difficulty: 'elite', categories: ['reading', 'focus'] },
    { content: 'Memory strengthens through consistent focused practice.', difficulty: 'elite', categories: ['memory', 'focus'] },
    { content: 'Reading comprehension improves with steady practice.', difficulty: 'elite', categories: ['reading'] },
    { content: 'Focused practice builds long-term cognitive strength.', difficulty: 'elite', categories: ['focus', 'memory'] },
    { content: 'Psychology shows motivation drives lasting change.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Learning deepens through active engaged practice.', difficulty: 'elite', categories: ['reading'] },
    { content: 'Sleep plays a genuinely vital role.', difficulty: 'elite', categories: ['memory'] },
    { content: 'Curiosity often accelerates deeper understanding overall.', difficulty: 'elite', categories: ['reading'] },
    { content: 'Small consistent wins gradually build momentum.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Silence measurably improves sustained reading focus.', difficulty: 'elite', categories: ['reading', 'focus'] },
    { content: 'Rest between sessions strongly aids retention.', difficulty: 'elite', categories: ['memory'] },
    { content: 'Structure meaningfully reduces unnecessary mental fatigue.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Fast feedback accelerates meaningful skill growth.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Novel content noticeably improves long-term retention.', difficulty: 'elite', categories: ['memory'] },
    { content: 'Environment quietly shapes overall learning speed.', difficulty: 'elite', categories: ['reading'] },
    { content: 'Patience reliably outperforms impulsive rushed effort.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Thoughtful questions genuinely deepen real comprehension.', difficulty: 'elite', categories: ['reading'] },
    { content: 'Breathing exercises steady a wandering mind.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Motivation alone sustains truly long practice.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Variety naturally keeps curious minds engaged.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Short breaks genuinely restore deep concentration.', difficulty: 'elite', categories: ['focus'] },
    { content: 'Deliberate movement can noticeably boost alertness.', difficulty: 'elite', categories: ['focus'] },
  ],
})
