// Sentences dataset — 25 short educational sentences for advanced reading training.
// Used by Flash Sentences™ and future Reading Comprehension exercises.
// All sentences are transformation-focused and cognitively appropriate.

import { createDataset } from '../../contentEngine'

export const SENTENCES_DATASET = createDataset({
  id: 'en-sentences-foundation',
  locale: 'en',
  contentType: 'sentence',
  rawItems: [
    // Beginner: short, simple sentences (5-7 words)
    { content: 'Your mind grows with practice.',     difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: 'Read with focus and speed.',          difficulty: 'beginner', categories: ['reading'] },
    { content: 'Every session makes you stronger.',  difficulty: 'beginner', categories: ['reading', 'focus'] },
    { content: 'The brain learns by doing.',         difficulty: 'beginner', categories: ['reading', 'memory'] },
    { content: 'Stay calm and keep reading.',        difficulty: 'beginner', categories: ['reading', 'focus'] },

    // Easy: medium sentences (7-10 words)
    { content: 'Consistent practice builds lasting reading speed.',       difficulty: 'easy', categories: ['reading'] },
    { content: 'Your eyes can move faster than you think.',               difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'Small improvements each day create big results.',         difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'Focus on understanding, not just moving your eyes.',      difficulty: 'easy', categories: ['reading', 'focus'] },
    { content: 'The best readers practice daily without exception.',      difficulty: 'easy', categories: ['reading'] },
    { content: 'Visualization makes memory more powerful and durable.',   difficulty: 'easy', categories: ['memory', 'visualization'] },
    { content: 'Attention is a skill that improves with training.',       difficulty: 'easy', categories: ['focus'] },

    // Medium: longer sentences (10-15 words)
    { content: 'Reading speed increases when your eyes make fewer fixations per line.', difficulty: 'medium', categories: ['reading'] },
    { content: 'The peripheral vision exercises expand the visual field used during reading.', difficulty: 'medium', categories: ['reading', 'visualization'] },
    { content: 'Tachistoscopic training improves the speed at which the brain processes text.', difficulty: 'medium', categories: ['reading', 'memory'] },
    { content: 'Memory improves when new information connects to things you already know.', difficulty: 'medium', categories: ['memory'] },
    { content: 'Deep focus requires removing distractions and entering a state of flow.',   difficulty: 'medium', categories: ['focus'] },
    { content: 'Pattern recognition is a trainable skill that develops through repetition.', difficulty: 'medium', categories: ['reading', 'memory'] },
    { content: 'The reading brain identifies whole words rather than individual letters.',  difficulty: 'medium', categories: ['reading'] },

    // Advanced: technical or complex sentences (15-20 words)
    { content: 'Subvocalisation—the habit of silently pronouncing each word—is the primary limiter of reading speed in adults.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'Spaced repetition systems exploit the psychological spacing effect to maximise long-term memory retention.', difficulty: 'advanced', categories: ['memory'] },
    { content: 'The parafoveal region of the retina provides preview information that fluent readers use to plan eye movements.', difficulty: 'advanced', categories: ['reading', 'visualization'] },
    { content: 'Executive function training transfers to academic performance through improved working memory capacity.', difficulty: 'advanced', categories: ['focus', 'memory'] },

    // Expert: academic/scientific sentences
    { content: 'Neuroplasticity research demonstrates that targeted cognitive training produces measurable structural changes in the prefrontal cortex.', difficulty: 'expert', categories: ['memory', 'focus'] },
    { content: 'Saccadic suppression during rapid eye movements allows the visual cortex to maintain a stable perceptual experience.', difficulty: 'expert', categories: ['reading'] },
    { content: 'The lexical access time for high-frequency words is significantly shorter than for low-frequency words due to semantic priming effects.', difficulty: 'expert', categories: ['reading', 'memory'] },
  ],
})
