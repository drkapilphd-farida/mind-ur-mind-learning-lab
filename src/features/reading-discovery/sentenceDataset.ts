// Reading Discovery™ Sentence Dataset — flat, single complete sentences,
// each with 3 linked "closest meaning" options for Read Naturally™'s
// meaning-selection micro-interaction.
//
// A new lane, not a duplicate: sentenceLibrary.ts already exists but is a
// completely different shape — themed 5-sentence "chapters" with 9
// authored challenge-question types per chapter, built for the separate,
// heavier Sentence Reading™ exercise. It isn't a flat ContentItem pool and
// isn't registered via createDataset, so it can't be queried through
// getContentForExercise. Reading Discovery's Read Naturally™ experiment
// just needs one plain, complete sentence — this dataset fills that gap
// through the platform's existing registration mechanism, the same one
// wordFlashDataset.ts and chunkDataset.ts already use.
//
// Sentence length/vocabulary complexity is the difficulty axis, matching
// the shape every other dataset in this engine already uses. Meaning
// options live in metadata on the SAME record as their sentence — never a
// separate pool — so a sentence and its options can never be mixed with
// another sentence's.
//
// Sprint-2.6B FIX-16 — every record's `correctOptionIndex` (always the
// authored index of the genuinely correct paraphrase, option 0 in every
// record here) is a real, internal-only signal for the new Reading
// Intelligence Model's comprehension/question-accuracy inputs. Reading
// Discovery still never shows right/wrong in the UI — this never
// surfaces as visible feedback, only as one input among several that
// shape the final "Effective Reading Performance" result.
//
// Reading Runtime Engine™ (Sprint-2 Part-2) — expanded from 17 to 45 real,
// hand-authored records (~9 per tier) so Sentence Sprint™'s continuous
// runtime (15-20 real sentences per session) can honestly avoid repeats
// across most real sessions, per your own explicit "curated local content
// library for Version-1" direction. Every record now also carries a real
// `origin: 'authored'` field — the seam a future, separate sprint's
// offline/background AI-expansion job writes `'ai-generated-offline'`
// records into, without this dataset's shape or any caller changing.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const READING_DISCOVERY_SENTENCE_DATASET = createDataset({
  id: 'en-reading-discovery-sentences',
  locale: 'en',
  contentType: 'sentence',
  rawItems: [
    // Beginner — short, everyday
    {
      content: 'The cat sat quietly by the window.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['A cat resting calmly', 'A cat playing outside', 'A dog by the door'] },
    },
    {
      content: 'She smiled and waved at her friend.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['A friendly greeting', 'A sad goodbye', 'An argument between friends'] },
    },
    {
      content: 'The sun rose slowly over the hill.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['A sunrise over a hill', 'A sunset by the ocean', 'A storm rolling in'] },
    },
    {
      content: 'He opened the book and began to read.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Starting to read a book', 'Closing a book to sleep', 'Writing in a notebook'] },
    },
    {
      content: 'The kids ran across the yard, laughing loudly.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Children playing happily outside', 'Children arguing over a toy', 'Children walking to school'] },
    },
    {
      content: 'Rain tapped gently against the kitchen window.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Light rain falling outside', 'A loud thunderstorm', 'Someone knocking at the door'] },
    },
    {
      content: 'The bakery smelled like fresh bread every morning.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['A bakery with a pleasant smell', 'A bakery that just closed', 'A restaurant serving dinner'] },
    },
    {
      content: 'Tom tied his shoes and headed out the door.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Getting ready to leave', 'Coming home for the night', 'Taking a nap on the couch'] },
    },
    {
      content: 'The library was quiet except for turning pages.',
      difficulty: 'beginner',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['A calm, quiet library', 'A loud, busy classroom', 'An empty parking lot'] },
    },

    // Easy — one clear idea, slightly longer
    {
      content: 'Learning becomes easier when reading feels natural.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Reading naturally makes learning easier', 'Learning is always difficult', 'Reading fast improves memory'] },
    },
    {
      content: 'A calm mind helps you focus on the task ahead.',
      difficulty: 'easy',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Calmness supports focus', 'Stress improves performance', 'Focus requires background noise'] },
    },
    {
      content: 'Every small step builds toward a larger goal.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Small steps add up to big progress', 'Only big changes matter', 'Goals should be reached quickly'] },
    },
    {
      content: 'Reading a little each day builds a lasting habit.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Daily reading builds a habit', 'Reading once a week is enough', 'Habits form instantly'] },
    },
    {
      content: 'Taking a short break can help a tired mind reset.',
      difficulty: 'easy',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Breaks help the mind recover', 'Breaks always waste time', 'Tiredness has no real cause'] },
    },
    {
      content: 'A good night of sleep makes the next day feel clearer.',
      difficulty: 'easy',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Sleep improves how clear the mind feels', 'Sleep has no effect on thinking', 'Naps replace a full night of sleep'] },
    },
    {
      content: 'Writing something down often helps you remember it later.',
      difficulty: 'easy',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Writing things down aids memory', 'Writing makes memory worse', 'Only typing helps memory'] },
    },
    {
      content: 'Practicing a skill regularly makes it feel more natural over time.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Regular practice builds natural skill', 'Skills never improve with practice', 'Talent matters more than practice'] },
    },
    {
      content: 'A quiet room can make it easier to think clearly.',
      difficulty: 'easy',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Quiet spaces support clear thinking', 'Noise always helps concentration', 'Thinking clearly requires music'] },
    },

    // Medium — compound ideas
    {
      content: 'Consistent practice gradually strengthens the connections inside the brain.',
      difficulty: 'medium',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Practice strengthens brain connections over time', 'The brain weakens with practice', 'Talent matters more than practice'] },
    },
    {
      content: 'Understanding a sentence often depends on the words that came before it.',
      difficulty: 'medium',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Context shapes understanding', 'Every sentence stands alone', 'Meaning depends only on grammar'] },
    },
    {
      content: 'Curiosity tends to make new information easier to remember.',
      difficulty: 'medium',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Curiosity aids memory', 'Curiosity distracts from learning', 'Memory is unrelated to interest'] },
    },
    {
      content: 'A well-rested mind absorbs new ideas more easily than a tired one.',
      difficulty: 'medium',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Rest improves how well ideas are absorbed', 'Tiredness improves focus', 'Sleep has no effect on learning'] },
    },
    {
      content: 'Breaking a large task into smaller pieces often makes it feel more manageable.',
      difficulty: 'medium',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Smaller steps make big tasks easier', 'Large tasks should never be divided', 'Breaking tasks apart wastes time'] },
    },
    {
      content: 'Reviewing information shortly after learning it helps the memory hold on to it.',
      difficulty: 'medium',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Early review strengthens memory', 'Reviewing information weakens it', 'Memory works the same regardless of timing'] },
    },
    {
      content: 'Distractions pull attention away faster than most people realize.',
      difficulty: 'medium',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Distractions disrupt attention quickly', 'Distractions have little real effect', 'Attention cannot be interrupted'] },
    },
    {
      content: 'People often understand a story better once they picture it happening.',
      difficulty: 'medium',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Visualizing a story improves understanding', 'Picturing a story makes it confusing', 'Understanding depends only on vocabulary'] },
    },
    {
      content: 'Learning a new word tends to stick better when it is used in a real sentence.',
      difficulty: 'medium',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Using new words in context helps them stick', 'New words are best memorized alone', 'Vocabulary has no effect on comprehension'] },
    },

    // Advanced — longer, more abstract
    {
      content: 'The ability to concentrate for extended periods is a skill that can be deliberately trained.',
      difficulty: 'advanced',
      categories: ['focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Concentration can be trained like a skill', 'Concentration is a fixed, unchangeable trait', 'Only children can build concentration'] },
    },
    {
      content: 'Comprehension improves when a reader actively connects new information to what they already know.',
      difficulty: 'advanced',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Linking new ideas to prior knowledge improves comprehension', 'Comprehension depends only on vocabulary size', 'Prior knowledge makes reading harder'] },
    },
    {
      content: 'Subtle changes in sentence structure can shift the emphasis of an entire idea.',
      difficulty: 'advanced',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Sentence structure affects emphasis and meaning', 'Sentence structure has no effect on meaning', 'Only word choice affects meaning'] },
    },
    {
      content: 'A reader who predicts what comes next tends to engage more deeply with a text.',
      difficulty: 'advanced',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Predicting content deepens engagement', 'Predicting content is a distraction', 'Engagement depends only on topic interest'] },
    },
    {
      content: 'The brain tends to fill in missing details automatically, sometimes without the reader noticing.',
      difficulty: 'advanced',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['The brain unconsciously fills in gaps', 'The brain never adds missing details', 'Missing details always go unnoticed'] },
    },
    {
      content: 'Switching frequently between tasks tends to slow down overall performance, even when each task feels quick.',
      difficulty: 'advanced',
      categories: ['focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Frequent task-switching reduces overall performance', 'Switching tasks always improves speed', 'Multitasking has no measurable cost'] },
    },
    {
      content: 'Recalling a memory in a different context than where it was formed can make it harder to retrieve.',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Context mismatch can make memories harder to recall', 'Context has no effect on memory retrieval', 'Memories are always easiest to recall anywhere'] },
    },
    {
      content: 'Skilled readers often skim ahead briefly, gathering clues before slowing down to read carefully.',
      difficulty: 'advanced',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Skilled readers preview text before reading closely', 'Skilled readers only ever read once, slowly', 'Skimming replaces careful reading entirely'] },
    },
    {
      content: 'A brief pause before answering a question can lead to a more thoughtful response.',
      difficulty: 'advanced',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Pausing before answering improves thoughtfulness', 'Pausing always signals uncertainty', 'Fast answers are always better answers'] },
    },

    // Expert — dense, technical vocabulary
    {
      content: "Metacognition, the awareness of one's own thinking process, plays a critical role in effective learning.",
      difficulty: 'expert',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ["Awareness of one's own thinking supports learning", 'Metacognition slows down learning', 'Effective learning depends only on memorization'] },
    },
    {
      content: 'The interplay between working memory and long-term retention shapes how efficiently new concepts are internalized.',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Working memory and long-term retention together shape learning efficiency', 'Working memory has no connection to retention', 'Long-term retention depends only on repetition count'] },
    },
    {
      content: 'Cognitive load theory suggests that comprehension suffers once working memory is asked to hold too much at once.',
      difficulty: 'expert',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Overloading working memory reduces comprehension', 'Working memory has unlimited capacity', 'Cognitive load has no effect on understanding'] },
    },
    {
      content: 'Semantic priming occurs when exposure to one concept subtly speeds recognition of a related concept soon after.',
      difficulty: 'expert',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Related concepts can speed up recognition of each other', 'Concepts are always recognized independently', 'Priming only affects unrelated ideas'] },
    },
    {
      content: 'Sustained attention tends to degrade predictably over time unless deliberately renewed through variation or rest.',
      difficulty: 'expert',
      categories: ['focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Attention naturally fades without renewal', 'Attention stays constant indefinitely', 'Rest has no effect on attention'] },
    },
    {
      content: 'The testing effect describes how retrieving information from memory strengthens it more than simply reviewing it again.',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Actively recalling information strengthens memory more than rereading', 'Rereading is always more effective than recall', 'Testing has no measurable effect on memory'] },
    },
    {
      content: 'Orthographic familiarity, how recognizable a word looks on the page, influences reading speed independently of meaning.',
      difficulty: 'expert',
      categories: ['reading'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['How familiar a word looks affects reading speed', 'Word appearance never affects reading speed', 'Only meaning influences reading speed'] },
    },
    {
      content: 'Interleaving different but related topics during practice tends to improve long-term discrimination between them.',
      difficulty: 'expert',
      categories: ['reading', 'memory'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Mixing related topics during practice improves long-term distinction between them', 'Studying one topic at a time is always superior', 'Interleaving topics has no lasting effect'] },
    },
    {
      content: 'Automaticity in reading, the point where decoding requires little conscious effort, frees attention for deeper comprehension.',
      difficulty: 'expert',
      categories: ['reading', 'focus'],
      metadata: { origin: 'authored', correctOptionIndex: 0, options: ['Effortless decoding frees attention for comprehension', 'Automatic reading reduces comprehension', 'Conscious effort is required to decode every word'] },
    },
  ],
})
