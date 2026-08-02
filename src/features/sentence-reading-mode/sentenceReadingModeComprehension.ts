import type { ComprehensionBlock } from '@/features/reading-engine/comprehensionTypes'

// Comprehension Checkpoint Sprint — real, hand-authored comprehension
// questions for Sentence Reading Mode™, one block per existing dataset
// Level (`level-1`/`level-2`/`level-3`, matching the 6-sentence groupings
// already defined in sentenceReadingModeDataset.ts), 5 questions each.
// Every question and distractor is written by hand against the actual
// sentence text — no AI generation, following this project's existing
// "real, hand-authored content" dataset convention.
export const SENTENCE_READING_MODE_COMPREHENSION_BLOCKS: readonly ComprehensionBlock[] = [
  {
    blockId: 'level-1',
    questions: [
      {
        id: 'level-1-q1',
        prompt: 'According to these sentences, what does reading open?',
        options: [
          { id: 'a', text: 'New worlds' },
          { id: 'b', text: 'New languages' },
          { id: 'c', text: 'New friendships' },
          { id: 'd', text: 'New careers' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'level-1-q2',
        prompt: 'What builds real skill, according to the sentences?',
        options: [
          { id: 'a', text: 'Luck' },
          { id: 'b', text: 'Practice' },
          { id: 'c', text: 'Talent' },
          { id: 'd', text: 'Speed' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'level-1-q3',
        prompt: 'What kind of steps create lasting change?',
        options: [
          { id: 'a', text: 'Big, dramatic steps' },
          { id: 'b', text: 'Small steps' },
          { id: 'c', text: 'No steps at all' },
          { id: 'd', text: 'Fast steps' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'level-1-q4',
        prompt: 'What kind of mind reads best, per the sentences?',
        options: [
          { id: 'a', text: 'A busy mind' },
          { id: 'b', text: 'A calm mind' },
          { id: 'c', text: 'A distracted mind' },
          { id: 'd', text: 'A tired mind' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'level-1-q5',
        prompt: 'What does every page teach, according to the sentences?',
        options: [
          { id: 'a', text: 'Nothing new' },
          { id: 'b', text: 'Something new' },
          { id: 'c', text: 'The same lesson' },
          { id: 'd', text: 'Only vocabulary' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'level-2',
    questions: [
      {
        id: 'level-2-q1',
        prompt: 'What did every skilled reader start out as?',
        options: [
          { id: 'a', text: 'A curious beginner' },
          { id: 'b', text: 'An expert' },
          { id: 'c', text: 'A reluctant student' },
          { id: 'd', text: 'A fast reader' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'level-2-q2',
        prompt: 'What does consistent daily practice slowly turn effort into?',
        options: [
          { id: 'a', text: 'Frustration' },
          { id: 'b', text: 'Real ability' },
          { id: 'c', text: 'Boredom' },
          { id: 'd', text: 'Confusion' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'level-2-q3',
        prompt: 'What kind of mind absorbs new information far more clearly?',
        options: [
          { id: 'a', text: 'A busy, multitasking mind' },
          { id: 'b', text: 'A calm, focused mind' },
          { id: 'c', text: 'A worried mind' },
          { id: 'd', text: 'A rushed mind' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'level-2-q4',
        prompt: 'What do good readers learn to do with their eyes, per the sentences?',
        options: [
          { id: 'a', text: 'Trust them and keep moving forward' },
          { id: 'b', text: 'Close them while reading' },
          { id: 'c', text: 'Move them backward often' },
          { id: 'd', text: 'Ignore what they see' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'level-2-q5',
        prompt: 'According to the sentences, what can curiosity open that pure discipline alone cannot reach?',
        options: [
          { id: 'a', text: 'Doors' },
          { id: 'b', text: 'Books' },
          { id: 'c', text: 'Shortcuts' },
          { id: 'd', text: 'Arguments' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
  {
    blockId: 'level-3',
    questions: [
      {
        id: 'level-3-q1',
        prompt: 'What did the most capable readers learn to trust first, before their instincts?',
        options: [
          { id: 'a', text: 'Their eyes' },
          { id: 'b', text: 'Their memory' },
          { id: 'c', text: "Their friends' opinions" },
          { id: 'd', text: 'Their notes' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'level-3-q2',
        prompt: 'How does progress typically arrive, according to the sentences?',
        options: [
          { id: 'a', text: 'As a straight line' },
          { id: 'b', text: 'Rarely as a straight line, but still arriving for those who keep showing up' },
          { id: 'c', text: 'Never, for most people' },
          { id: 'd', text: 'Only for naturally gifted readers' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'level-3-q3',
        prompt: 'According to the sentences, wisdom comes less from reading quickly and more from what?',
        options: [
          { id: 'a', text: 'Reflecting honestly on what was learned' },
          { id: 'b', text: 'Reading as many books as possible' },
          { id: 'c', text: 'Reading only difficult texts' },
          { id: 'd', text: 'Avoiding reflection entirely' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'level-3-q4',
        prompt: 'What can a single small habit, repeated patiently, do over time?',
        options: [
          { id: 'a', text: 'Slowly reshape an entire skill' },
          { id: 'b', text: 'Instantly create expertise' },
          { id: 'c', text: 'Have no real effect' },
          { id: 'd', text: 'Replace the need for practice' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'level-3-q5',
        prompt: 'How do the best readers respond when a sentence grows longer and more complicated?',
        options: [
          { id: 'a', text: 'They panic' },
          { id: 'b', text: 'They stay relaxed' },
          { id: 'c', text: 'They skip it' },
          { id: 'd', text: 'They read it out loud' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
]
