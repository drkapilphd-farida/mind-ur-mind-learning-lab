// Word Flash™ Dataset — curated single-word content for the Flash
// Intelligence Pack™'s entry game. Word Flash™ succeeds Rapid Visual
// Intelligence™'s Flash Words™ (see docs/QUANTUM_SPEED_READING_CURRICULUM.md
// history) and deliberately shares contentType: 'word' with it — the two
// pools merge at query time via getContentForExercise, which is the correct
// outcome now that Word Flash is FIP's successor to Flash Words, not a
// competing lane like 'chunk' vs 'reading-phrase' had to be.
//
// Every entry is a real, independently recognizable English word — never
// mechanically derived. Word length is the primary difficulty axis (longer,
// less-frequent words require more visual processing bandwidth to
// recognize in a single flash), themed around education, neuroscience,
// reading, memory, and focus per the locked Flash Intelligence Pack™
// design. Categories are drawn only from the platform's DatasetCategory
// union (reading/memory/focus) — matches chunkDataset.ts's precedent.
//
// `metadata.family` groups words that share a visible prefix/root (e.g.
// receive/receives/received/receiver/recipe) so wordFlashEngine.ts's
// distractor selection can prefer genuinely visually-similar wrong answers
// over merely similar-length ones — the "the user should genuinely think
// before selecting" requirement. Family members intentionally sit at the
// same difficulty tier so they reliably land in the same session's
// candidate pool together.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const WORD_FLASH_DATASET = createDataset({
  id: 'en-word-flash-words',
  locale: 'en',
  contentType: 'word',
  rawItems: [
    // Beginner — 3-4 letters, everyday
    { content: 'calm', difficulty: 'beginner', categories: ['focus'] },
    { content: 'book', difficulty: 'beginner', categories: ['reading'] },
    { content: 'page', difficulty: 'beginner', categories: ['reading'] },
    { content: 'view', difficulty: 'beginner', categories: ['focus'] },
    { content: 'scan', difficulty: 'beginner', categories: ['reading'] },
    { content: 'word', difficulty: 'beginner', categories: ['reading'] },
    { content: 'text', difficulty: 'beginner', categories: ['reading'] },
    { content: 'time', difficulty: 'beginner', categories: ['focus'] },
    { content: 'fast', difficulty: 'beginner', categories: ['reading'] },
    { content: 'bold', difficulty: 'beginner', categories: ['focus'] },
    { content: 'easy', difficulty: 'beginner', categories: ['focus'] },
    { content: 'keen', difficulty: 'beginner', categories: ['focus'] },
    { content: 'glow', difficulty: 'beginner', categories: ['focus'] },
    { content: 'spark', difficulty: 'beginner', categories: ['memory'] },

    // "read" distractor family — visually similar, genuinely distinct words
    { content: 'read', difficulty: 'beginner', categories: ['reading'], metadata: { family: 'read' } },
    { content: 'reads', difficulty: 'beginner', categories: ['reading'], metadata: { family: 'read' } },
    { content: 'ready', difficulty: 'beginner', categories: ['focus'], metadata: { family: 'read' } },
    { content: 'real', difficulty: 'beginner', categories: ['focus'], metadata: { family: 'read' } },

    // Beginner — additional variety (Fix 2: dataset was repeating too often)
    { content: 'mind', difficulty: 'beginner', categories: ['focus'] },
    { content: 'grow', difficulty: 'beginner', categories: ['memory'] },
    { content: 'flow', difficulty: 'beginner', categories: ['focus'] },
    { content: 'cool', difficulty: 'beginner', categories: ['focus'] },
    { content: 'warm', difficulty: 'beginner', categories: ['focus'] },
    { content: 'slow', difficulty: 'beginner', categories: ['reading'] },
    { content: 'wide', difficulty: 'beginner', categories: ['reading'] },
    { content: 'open', difficulty: 'beginner', categories: ['focus'] },

    // Easy — 5 letters
    { content: 'sharp', difficulty: 'easy', categories: ['focus'] },
    { content: 'quick', difficulty: 'easy', categories: ['reading'] },
    { content: 'aware', difficulty: 'easy', categories: ['focus'] },
    { content: 'grasp', difficulty: 'easy', categories: ['memory'] },
    { content: 'reach', difficulty: 'easy', categories: ['focus'] },
    { content: 'order', difficulty: 'easy', categories: ['memory'] },
    { content: 'track', difficulty: 'easy', categories: ['focus'] },
    { content: 'build', difficulty: 'easy', categories: ['memory'] },
    { content: 'habit', difficulty: 'easy', categories: ['memory'] },
    { content: 'depth', difficulty: 'easy', categories: ['reading'] },
    { content: 'pulse', difficulty: 'easy', categories: ['focus'] },
    { content: 'drive', difficulty: 'easy', categories: ['focus'] },
    { content: 'range', difficulty: 'easy', categories: ['reading'] },
    { content: 'phase', difficulty: 'easy', categories: ['memory'] },

    // Easy — additional variety
    { content: 'brain', difficulty: 'easy', categories: ['memory'] },
    { content: 'speed', difficulty: 'easy', categories: ['reading'] },
    { content: 'light', difficulty: 'easy', categories: ['focus'] },
    { content: 'power', difficulty: 'easy', categories: ['focus'] },
    { content: 'sight', difficulty: 'easy', categories: ['reading'] },
    { content: 'swift', difficulty: 'easy', categories: ['reading'] },
    { content: 'trust', difficulty: 'easy', categories: ['focus'] },
    { content: 'solid', difficulty: 'easy', categories: ['memory'] },

    // Medium — 6-7 letters
    { content: 'reading', difficulty: 'medium', categories: ['reading'] },
    { content: 'pattern', difficulty: 'medium', categories: ['memory'] },
    { content: 'balance', difficulty: 'medium', categories: ['focus'] },
    { content: 'control', difficulty: 'medium', categories: ['focus'], metadata: { family: 'control' } },
    { content: 'mastery', difficulty: 'medium', categories: ['memory'] },
    { content: 'clarity', difficulty: 'medium', categories: ['focus'] },
    { content: 'insight', difficulty: 'medium', categories: ['memory'] },
    { content: 'develop', difficulty: 'medium', categories: ['memory'] },
    { content: 'forward', difficulty: 'medium', categories: ['reading'] },
    { content: 'capture', difficulty: 'medium', categories: ['memory'] },
    { content: 'process', difficulty: 'medium', categories: ['focus'] },
    { content: 'session', difficulty: 'medium', categories: ['focus'] },
    { content: 'mindful', difficulty: 'medium', categories: ['focus'] },
    { content: 'journey', difficulty: 'medium', categories: ['memory'] },

    // "control" distractor family (continued from above)
    { content: 'controls', difficulty: 'medium', categories: ['focus'], metadata: { family: 'control' } },
    { content: 'controlled', difficulty: 'medium', categories: ['focus'], metadata: { family: 'control' } },
    { content: 'contrast', difficulty: 'medium', categories: ['focus'], metadata: { family: 'control' } },

    // "focus" distractor family
    { content: 'focus', difficulty: 'medium', categories: ['focus'], metadata: { family: 'focus' } },
    { content: 'focused', difficulty: 'medium', categories: ['focus'], metadata: { family: 'focus' } },
    { content: 'focusing', difficulty: 'medium', categories: ['focus'], metadata: { family: 'focus' } },
    { content: 'focal', difficulty: 'medium', categories: ['focus'], metadata: { family: 'focus' } },

    // "learn" distractor family
    { content: 'learn', difficulty: 'medium', categories: ['memory'], metadata: { family: 'learn' } },
    { content: 'learns', difficulty: 'medium', categories: ['memory'], metadata: { family: 'learn' } },
    { content: 'learner', difficulty: 'medium', categories: ['memory'], metadata: { family: 'learn' } },
    { content: 'learning', difficulty: 'medium', categories: ['memory'], metadata: { family: 'learn' } },

    // "think" distractor family
    { content: 'think', difficulty: 'medium', categories: ['focus'], metadata: { family: 'think' } },
    { content: 'thinks', difficulty: 'medium', categories: ['focus'], metadata: { family: 'think' } },
    { content: 'thinker', difficulty: 'medium', categories: ['focus'], metadata: { family: 'think' } },
    { content: 'thing', difficulty: 'medium', categories: ['focus'], metadata: { family: 'think' } },

    // "memory" distractor family
    { content: 'memo', difficulty: 'medium', categories: ['memory'], metadata: { family: 'memory' } },
    { content: 'memory', difficulty: 'medium', categories: ['memory'], metadata: { family: 'memory' } },
    { content: 'memories', difficulty: 'medium', categories: ['memory'], metadata: { family: 'memory' } },
    { content: 'memorize', difficulty: 'medium', categories: ['memory'], metadata: { family: 'memory' } },

    // Medium — additional variety
    { content: 'steady', difficulty: 'medium', categories: ['focus'] },
    { content: 'gently', difficulty: 'medium', categories: ['focus'] },
    { content: 'rhythm', difficulty: 'medium', categories: ['reading'] },
    { content: 'expand', difficulty: 'medium', categories: ['memory'] },
    { content: 'adjust', difficulty: 'medium', categories: ['focus'] },
    { content: 'anchor', difficulty: 'medium', categories: ['focus'] },
    { content: 'detect', difficulty: 'medium', categories: ['reading'] },
    { content: 'signal', difficulty: 'medium', categories: ['reading'] },

    // Advanced — 8-9 letters
    { content: 'cognitive', difficulty: 'advanced', categories: ['memory'] },
    { content: 'retention', difficulty: 'advanced', categories: ['memory'] },
    { content: 'velocity', difficulty: 'advanced', categories: ['reading'] },
    { content: 'bandwidth', difficulty: 'advanced', categories: ['focus'] },
    { content: 'attention', difficulty: 'advanced', categories: ['focus'] },
    { content: 'consonant', difficulty: 'advanced', categories: ['reading'] },
    { content: 'discipline', difficulty: 'advanced', categories: ['focus'] },
    { content: 'threshold', difficulty: 'advanced', categories: ['memory'] },
    { content: 'framework', difficulty: 'advanced', categories: ['memory'] },
    { content: 'awareness', difficulty: 'advanced', categories: ['focus'] },
    { content: 'consistent', difficulty: 'advanced', categories: ['focus'] },
    { content: 'sensation', difficulty: 'advanced', categories: ['focus'] },
    { content: 'iteration', difficulty: 'advanced', categories: ['memory'] },
    { content: 'structure', difficulty: 'advanced', categories: ['reading'] },

    // "receive" distractor family — the canonical example of visually
    // similar-but-genuinely-distinct words (shared prefix, different
    // endings — "recipe" isn't a form of "receive" at all, just visually
    // close, which is exactly the point of a family-based distractor)
    { content: 'receive', difficulty: 'advanced', categories: ['reading'], metadata: { family: 'receive' } },
    { content: 'receives', difficulty: 'advanced', categories: ['reading'], metadata: { family: 'receive' } },
    { content: 'received', difficulty: 'advanced', categories: ['reading'], metadata: { family: 'receive' } },
    { content: 'receiver', difficulty: 'advanced', categories: ['reading'], metadata: { family: 'receive' } },
    { content: 'recipe', difficulty: 'advanced', categories: ['reading'], metadata: { family: 'receive' } },

    // Advanced — additional variety
    { content: 'accuracy', difficulty: 'advanced', categories: ['memory'] },
    { content: 'duration', difficulty: 'advanced', categories: ['focus'] },
    { content: 'intuitive', difficulty: 'advanced', categories: ['reading'] },
    { content: 'cognition', difficulty: 'advanced', categories: ['memory'] },
    { content: 'precision', difficulty: 'advanced', categories: ['focus'] },
    { content: 'stimulus', difficulty: 'advanced', categories: ['reading'] },
    { content: 'response', difficulty: 'advanced', categories: ['focus'] },
    { content: 'encoding', difficulty: 'advanced', categories: ['memory'] },

    // Expert — 10-12 letters, technical/academic
    { content: 'perception', difficulty: 'expert', categories: ['reading'], metadata: { family: 'perceive' } },
    { content: 'tachistoscope', difficulty: 'expert', categories: ['reading'] },
    { content: 'peripheral', difficulty: 'expert', categories: ['reading'] },
    { content: 'psychology', difficulty: 'expert', categories: ['memory'] },
    { content: 'neuroscience', difficulty: 'expert', categories: ['memory'] },
    { content: 'comprehension', difficulty: 'expert', categories: ['reading'] },
    { content: 'concentration', difficulty: 'expert', categories: ['focus'] },
    { content: 'subvocalize', difficulty: 'expert', categories: ['reading'] },
    { content: 'recognition', difficulty: 'expert', categories: ['memory'] },
    { content: 'automaticity', difficulty: 'expert', categories: ['memory'] },
    { content: 'processing', difficulty: 'expert', categories: ['focus'] },
    { content: 'proficiency', difficulty: 'expert', categories: ['memory'] },

    // "perceive" distractor family (continued from above)
    { content: 'perceive', difficulty: 'expert', categories: ['reading'], metadata: { family: 'perceive' } },
    { content: 'perceives', difficulty: 'expert', categories: ['reading'], metadata: { family: 'perceive' } },
    { content: 'perceived', difficulty: 'expert', categories: ['reading'], metadata: { family: 'perceive' } },

    // Expert — additional variety
    { content: 'adaptation', difficulty: 'expert', categories: ['memory'] },
    { content: 'reflection', difficulty: 'expert', categories: ['focus'] },
    { content: 'efficiency', difficulty: 'expert', categories: ['focus'] },
    { content: 'perspective', difficulty: 'expert', categories: ['reading'] },
    { content: 'familiarity', difficulty: 'expert', categories: ['memory'] },
    { content: 'orientation', difficulty: 'expert', categories: ['reading'] },

    // Elite — 12-14 letters, dense academic/scientific vocabulary
    { content: 'consolidation', difficulty: 'elite', categories: ['memory'] },
    { content: 'metacognition', difficulty: 'elite', categories: ['focus'] },
    { content: 'visualization', difficulty: 'elite', categories: ['reading'] },
    { content: 'differentiate', difficulty: 'elite', categories: ['memory'] },
    { content: 'reinforcement', difficulty: 'elite', categories: ['memory'] },
    { content: 'characteristic', difficulty: 'elite', categories: ['reading'] },
    { content: 'synchronization', difficulty: 'elite', categories: ['focus'] },
    { content: 'internalization', difficulty: 'elite', categories: ['memory'] },
    { content: 'categorization', difficulty: 'elite', categories: ['memory'] },
    { content: 'interpretation', difficulty: 'elite', categories: ['reading'] },

    // Elite — additional variety
    { content: 'sophistication', difficulty: 'elite', categories: ['memory'] },
    { content: 'classification', difficulty: 'elite', categories: ['memory'] },
    { content: 'representation', difficulty: 'elite', categories: ['reading'] },
    { content: 'transformation', difficulty: 'elite', categories: ['focus'] },

    // Master — 12-15 letters, peak-challenge vocabulary. Capped at 15
    // characters — the Visual Width Validator's 'option' role ceiling
    // (MIN_CONTAINER_WIDTH_PX / (AVG_CHAR_WIDTH_EM * MIN_FONT_PX) ≈ 15.3
    // characters) — every word here must be usable both as a stimulus
    // (display role, more permissive) and as a ChoiceGrid answer option
    // (option role, the tightest constraint in the app), so option-role
    // validity is the real ceiling for this entire dataset, not just this
    // tier.
    { content: 'neuroplasticity', difficulty: 'master', categories: ['memory'] },
    { content: 'unprecedented', difficulty: 'master', categories: ['reading'] },
    { content: 'philosophical', difficulty: 'master', categories: ['memory'] },
    { content: 'comprehensive', difficulty: 'master', categories: ['reading'] },
    { content: 'extraordinary', difficulty: 'master', categories: ['focus'] },
    { content: 'multifaceted', difficulty: 'master', categories: ['memory'] },
    { content: 'unconventional', difficulty: 'master', categories: ['focus'] },
    { content: 'interconnected', difficulty: 'master', categories: ['memory'] },
    { content: 'circumstantial', difficulty: 'master', categories: ['reading'] },
    { content: 'individualized', difficulty: 'master', categories: ['focus'] },

    // Master — additional variety
    { content: 'irreplaceable', difficulty: 'master', categories: ['memory'] },
    { content: 'unmistakable', difficulty: 'master', categories: ['reading'] },
    { content: 'irreversible', difficulty: 'master', categories: ['focus'] },
    { content: 'inexplicable', difficulty: 'master', categories: ['reading'] },
  ],
})
