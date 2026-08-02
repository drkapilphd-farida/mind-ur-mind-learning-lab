// Memory Discovery™ Sentence Recall Dataset — complete sentences, each
// with 3 linked "similar" decoy sentences for Sentence Recall™'s
// recognition-among-near-misses micro-interaction.
//
// Registered under the SAME contentType as Reading Discovery's sentence
// dataset ('sentence') — this is additional content for a shared pool,
// not a duplicate: Reading Discovery's entries carry `metadata.options`
// (gist/meaning choices); these carry `metadata.similarSentences` (near-
// identical decoy sentences for a "which one did you actually see"
// recognition task). Both live in the one 'sentence' lane rather than
// forking a new content type, since the underlying content (a single
// complete sentence) is identical in shape.
//
// Premium content, deliberately not school-language: every sentence is a
// genuinely curious fact or observation spanning Human Brain, Psychology,
// Amazing Facts, Space, Innovation, Nature, Sports, History, Reading, and
// Curiosity — never "Sunny day" / "Cat" / "Garden" / "School" style filler.
//
// Decoys are deliberately close in length, topic, and structure to the
// target — genuine near-misses, not obviously-wrong distractors — since
// the point is recognition, not guessing.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const MEMORY_DISCOVERY_SENTENCE_RECALL_DATASET = createDataset({
  id: 'en-memory-discovery-sentence-recall',
  locale: 'en',
  contentType: 'sentence',
  rawItems: [
    // beginner
    {
      content: 'Scientists discovered that the brain remembers meaning before details.',
      difficulty: 'beginner',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Scientists discovered that the body remembers meaning before details.',
          'Scientists discovered that the brain forgets meaning before details.',
          'Scientists discovered that the brain remembers details before meaning.',
        ],
      },
    },
    {
      content: 'Octopuses can taste light through their skin.',
      difficulty: 'beginner',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Octopuses can taste sound through their skin.',
          'Octopuses can see light through their skin.',
          'Dolphins can taste light through their skin.',
        ],
      },
    },
    {
      content: 'Some athletes visualize an entire race before running it.',
      difficulty: 'beginner',
      categories: ['memory', 'focus'],
      metadata: {
        similarSentences: [
          'Some athletes visualize an entire race after running it.',
          'Some coaches visualize an entire race before running it.',
          'Some athletes memorize an entire race before running it.',
        ],
      },
    },
    {
      content: 'Curious minds often remember more than cautious ones.',
      difficulty: 'beginner',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Curious minds often remember less than cautious ones.',
          'Cautious minds often remember more than curious ones.',
          'Curious minds often forget more than cautious ones.',
        ],
      },
    },

    // easy
    {
      content: 'People often recall the beginning and end of a list best.',
      difficulty: 'easy',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'People often recall the middle of a list best.',
          'People rarely recall the beginning and end of a list.',
          'People often recall the beginning and end of a story best.',
        ],
      },
    },
    {
      content: 'Astronauts train memory differently before long missions.',
      difficulty: 'easy',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Astronauts train vision differently before long missions.',
          'Pilots train memory differently before long missions.',
          'Astronauts train memory differently after long missions.',
        ],
      },
    },
    {
      content: 'Some birds can remember thousands of hiding spots.',
      difficulty: 'easy',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Some birds can remember hundreds of hiding spots.',
          'Some squirrels can remember thousands of hiding spots.',
          'Some birds can forget thousands of hiding spots.',
        ],
      },
    },
    {
      content: 'Reading one meaningful paragraph is better than reading ten without attention.',
      difficulty: 'easy',
      categories: ['memory', 'reading'],
      metadata: {
        similarSentences: [
          'Reading ten meaningful paragraphs is better than reading one without attention.',
          'Reading one meaningful paragraph is worse than reading ten without attention.',
          'Writing one meaningful paragraph is better than reading ten without attention.',
        ],
      },
    },

    // medium
    {
      content: 'The brain forms new connections every time it learns something.',
      difficulty: 'medium',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'The brain loses old connections every time it learns something.',
          'The body forms new connections every time it learns something.',
          'The brain forms new connections every time it forgets something.',
        ],
      },
    },
    {
      content: 'Many breakthrough ideas begin as a small, odd observation.',
      difficulty: 'medium',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Many breakthrough ideas begin as a large, obvious observation.',
          'Many failed ideas begin as a small, odd observation.',
          'Many breakthrough plans begin as a small, odd observation.',
        ],
      },
    },
    {
      content: 'Honey found in ancient tombs can still be eaten today.',
      difficulty: 'medium',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Honey found in ancient tombs has always spoiled by now.',
          'Bread found in ancient tombs can still be eaten today.',
          'Honey found in modern tombs can still be eaten today.',
        ],
      },
    },
    {
      content: 'Ancient libraries once stored knowledge on clay tablets.',
      difficulty: 'medium',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Ancient libraries once stored knowledge on stone tablets.',
          'Modern libraries once stored knowledge on clay tablets.',
          'Ancient temples once stored knowledge on clay tablets.',
        ],
      },
    },
    {
      content: 'Some chess masters recognize thousands of patterns instantly.',
      difficulty: 'medium',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Some chess beginners recognize thousands of patterns instantly.',
          'Some chess masters recognize hundreds of patterns instantly.',
          'Some chess masters memorize thousands of patterns instantly.',
        ],
      },
    },

    // advanced
    {
      content: 'Confidence in a memory does not always mean it is accurate.',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Confidence in a memory always means it is accurate.',
          'Doubt in a memory does not always mean it is accurate.',
          'Confidence in a decision does not always mean it is accurate.',
        ],
      },
    },
    {
      content: 'Some stars we see at night have already stopped existing.',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Some stars we see at night have never stopped existing.',
          'Some planets we see at night have already stopped existing.',
          'Some stars we see at day have already stopped existing.',
        ],
      },
    },
    {
      content: 'Certain trees can send warning signals to their neighbors.',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Certain trees can send warning signals to their roots.',
          'Certain animals can send warning signals to their neighbors.',
          'Certain trees can receive warning signals from their neighbors.',
        ],
      },
    },
    {
      content: 'Unanswered questions tend to stay in memory longer than answered ones.',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Answered questions tend to stay in memory longer than unanswered ones.',
          'Unanswered questions tend to fade from memory faster than answered ones.',
          'Unanswered problems tend to stay in memory longer than answered ones.',
        ],
      },
    },

    // expert
    {
      content: 'The brain can rewire itself well into old age.',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'The brain stops rewiring itself well into old age.',
          'The body can rewire itself well into old age.',
          'The brain can rewire itself only in early age.',
        ],
      },
    },
    {
      content: 'Some of the most useful inventions came from failed experiments.',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Some of the most useless inventions came from failed experiments.',
          'Some of the most useful inventions came from successful experiments.',
          'Some of the most useful theories came from failed experiments.',
        ],
      },
    },
    {
      content: 'Entire ancient languages have been reconstructed from fragments.',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: {
        similarSentences: [
          'Entire ancient languages have been lost despite the fragments.',
          'Entire modern languages have been reconstructed from fragments.',
          'Entire ancient alphabets have been reconstructed from fragments.',
        ],
      },
    },
  ],
})
