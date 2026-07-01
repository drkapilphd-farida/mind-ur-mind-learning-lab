// Chunk Reading Dataset™ — curated sentences for chunk reading training.
// Sentences are designed so they chunk naturally into 2-6 word groups.
// Registered with the dataset engine; future multilingual datasets add
// sentences with locale: 'hi' / 'gu' etc. without changing any engine code.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const CHUNK_READING_DATASET = createDataset({
  id: 'en-chunk-reading-sentences',
  locale: 'en',
  contentType: 'sentence',
  rawItems: [
    // Beginner — short sentences (8–12 words), clean vocabulary
    { content: 'The mind grows stronger with every practice session each day.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Read with focus and your speed will improve over time.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Every word you see is a chance to train your eye.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'The brain adapts quickly when you give it daily practice.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Small sessions every day build real and lasting reading skill.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Your eyes can learn to see groups of words at once.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Stay calm and let your eyes move smoothly across the text.', difficulty: 'beginner', categories: ['reading'] },
    { content: 'Good readers take in whole phrases in a single clear glance.', difficulty: 'beginner', categories: ['reading'] },

    // Easy — 12–16 words, slightly more varied vocabulary
    { content: 'Training your eyes to capture wider spans of text dramatically improves reading speed.', difficulty: 'easy', categories: ['reading'] },
    { content: 'The secret to fast reading is reducing the number of eye fixations per line.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Peripheral vision plays a vital role in reading more words per glance each session.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Consistent daily practice builds the neural pathways that support faster visual processing.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Reading in chunks trains your brain to process meaning before every individual word is decoded.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Your mind is capable of recognising familiar word patterns much faster than you might expect.', difficulty: 'easy', categories: ['reading'] },
    { content: 'Focus on understanding the meaning of each group of words rather than every single letter.', difficulty: 'easy', categories: ['reading'] },
    { content: 'The wider your visual span becomes the fewer eye stops you need to read a full line.', difficulty: 'easy', categories: ['reading'] },

    // Medium — 16–20 words, richer vocabulary
    { content: 'Skilled readers have trained their visual systems to extract meaning from large groups of words in a single fixation.', difficulty: 'medium', categories: ['reading'] },
    { content: 'The ability to chunk text effectively is the foundation of all advanced reading speed techniques used by experts.', difficulty: 'medium', categories: ['reading'] },
    { content: 'When you stop reading word by word and start reading phrase by phrase your comprehension often improves as well.', difficulty: 'medium', categories: ['reading'] },
    { content: 'The brain processes language in semantic units not individual words which is why chunking aligns with natural cognition.', difficulty: 'medium', categories: ['reading'] },
    { content: 'Reducing subvocalisation and expanding the perceptual span are two complementary strategies that advanced readers develop together over time.', difficulty: 'medium', categories: ['reading'] },
    { content: 'Every session spent practicing chunk reading strengthens the visual cortex connections responsible for rapid parallel word recognition.', difficulty: 'medium', categories: ['reading'] },

    // Advanced — 20+ words, technical vocabulary
    { content: 'Parafoveal word preview — the ability to process words slightly outside the direct line of vision — enables fluent readers to maintain forward momentum without regressive eye movements.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'Tachistoscopic chunk training systematically expands the attentional window available to the visual cortex during each saccade, compressing the time required for a complete perceptual sweep of a line of text.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'The cognitive principle underlying chunk reading is that the brain encodes semantic relationships between adjacent words more efficiently than it processes individual lexical items in isolation.', difficulty: 'advanced', categories: ['reading'] },
    { content: 'Expert readers demonstrate significantly reduced fixation frequency and duration compared to novice readers, primarily because their trained visual systems can extract syntactic and semantic information from larger text regions per eye stop.', difficulty: 'advanced', categories: ['reading'] },

    // Expert — complex, long sentences
    { content: 'Neuroimaging studies of proficient readers reveal that chunked visual processing activates right-hemisphere regions associated with holistic pattern recognition in addition to the classic left-hemisphere language areas engaged during phonological decoding of individual words.', difficulty: 'expert', categories: ['reading'] },
    { content: 'The attentional blink phenomenon — a temporary suppression of visual awareness occurring approximately 200 to 500 milliseconds after detecting a target stimulus — imposes a fundamental constraint on the rate at which successive chunk presentations can be processed, which is why optimal flash duration decreases gradually with practice rather than abruptly.', difficulty: 'expert', categories: ['reading'] },
    { content: 'Spatio-temporal models of reading propose that the visual span — the number of characters or words that can be identified in a single fixation without eye movement — is trainable through deliberate practice targeting the magnocellular visual pathway, which is responsible for rapid, low-resolution spatial processing across the full visual field.', difficulty: 'expert', categories: ['reading'] },
  ],
})
