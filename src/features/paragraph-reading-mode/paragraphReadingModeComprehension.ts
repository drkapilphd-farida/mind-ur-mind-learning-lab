import type { ComprehensionBlock } from '@/features/reading-engine/comprehensionTypes'

// True Multi-Line Comfort Window Sprint — real, hand-authored comprehension
// questions matching the 5 new long-form passages in
// paragraphReadingModeDataset.ts (`passage-0` .. `passage-4`), 5 questions
// each. Replaces the earlier 32 questions written against the previous,
// much shorter 8-paragraph dataset (now retired). Every question and
// distractor is written by hand against the actual passage text — no AI
// generation, following this project's existing dataset convention.
export const PARAGRAPH_READING_MODE_COMPREHENSION_BLOCKS: readonly ComprehensionBlock[] = [
  {
    blockId: 'passage-0',
    questions: [
      {
        id: 'passage-0-q1',
        prompt: 'According to the passage, what is the "comforting story" people tell about strong readers?',
        options: [
          { id: 'a', text: 'That they were simply born with talent' },
          { id: 'b', text: 'That they read every day without fail' },
          { id: 'c', text: 'That they attended special schools' },
          { id: 'd', text: 'That they never struggle with long sentences' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'passage-0-q2',
        prompt: 'What does the passage say separated strong readers from everyone else?',
        options: [
          { id: 'a', text: 'Raw ability' },
          { id: 'b', text: 'Repetition and returning to the page' },
          { id: 'c', text: 'Reading only easy books' },
          { id: 'd', text: 'Natural eyesight' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-0-q3',
        prompt: 'According to the passage, what does talent decide?',
        options: [
          { id: 'a', text: 'How far a person eventually goes' },
          { id: 'b', text: 'Only how a person starts' },
          { id: 'c', text: 'Nothing at all' },
          { id: 'd', text: 'Whether someone becomes a reader' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-0-q4',
        prompt: 'What replaces talent in doing "that work," per the passage?',
        options: [
          { id: 'a', text: 'Consistency' },
          { id: 'b', text: 'Intelligence' },
          { id: 'c', text: 'Expensive books' },
          { id: 'd', text: 'A tutor' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'passage-0-q5',
        prompt: 'What does the passage call "encouraging news"?',
        options: [
          { id: 'a', text: 'That reading is reserved for a lucky few' },
          { id: 'b', text: 'That the skill is not reserved for a lucky few' },
          { id: 'c', text: 'That talent can be bought' },
          { id: 'd', text: 'That practice is unnecessary' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'passage-1',
    questions: [
      {
        id: 'passage-1-q1',
        prompt: 'According to the passage, why does a reading session often fail?',
        options: [
          { id: 'a', text: 'The material is too difficult' },
          { id: 'b', text: 'Small interruptions the reader barely notices' },
          { id: 'c', text: 'The book is too long' },
          { id: 'd', text: 'The reader reads too slowly' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-1-q2',
        prompt: 'What does the passage say focus arrives from, more than willpower alone?',
        options: [
          { id: 'a', text: 'A space that stops asking for attention' },
          { id: 'b', text: 'A strict schedule' },
          { id: 'c', text: 'Loud music' },
          { id: 'd', text: 'Reading in public' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'passage-1-q3',
        prompt: 'What kind of background sound does the passage say is acceptable?',
        options: [
          { id: 'a', text: 'Loud, exciting sound' },
          { id: 'b', text: 'A steady, unremarkable kind that never demands notice' },
          { id: 'c', text: 'No sound is ever acceptable' },
          { id: 'd', text: 'Music with lyrics' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-1-q4',
        prompt: 'Why does good lighting matter, according to the passage?',
        options: [
          { id: 'a', text: 'It looks nicer' },
          { id: 'b', text: 'Eyes working hard to see have little patience left for the sentence' },
          { id: 'c', text: 'It saves electricity' },
          { id: 'd', text: 'It has no real effect' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-1-q5',
        prompt: 'What does the passage say readers should decide before opening the book?',
        options: [
          { id: 'a', text: 'Which chapter to skip' },
          { id: 'b', text: 'That the next twenty minutes belong entirely to the page' },
          { id: 'c', text: 'How many pages to read' },
          { id: 'd', text: 'Whether to read at all' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'passage-2',
    questions: [
      {
        id: 'passage-2-q1',
        prompt: 'What does the passage call "almost exactly" how real fluency develops?',
        options: [
          { id: 'a', text: 'Reading more slowly to eventually read faster' },
          { id: 'b', text: 'Reading only difficult books' },
          { id: 'c', text: 'Reading without understanding' },
          { id: 'd', text: 'Reading in silence' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'passage-2-q2',
        prompt: 'According to the passage, what is a reader who rushes actually doing?',
        options: [
          { id: 'a', text: 'Reading in the fullest sense' },
          { id: 'b', text: 'Scanning shapes and collecting a vague impression' },
          { id: 'c', text: 'Memorizing every word' },
          { id: 'd', text: 'Building strong instincts' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-2-q3',
        prompt: 'What does slowing down deliberately allow the mind to notice, per the passage?',
        options: [
          { id: 'a', text: 'How ideas connect and where an argument shifts' },
          { id: 'b', text: 'The page number' },
          { id: 'c', text: "The book's price" },
          { id: 'd', text: 'Nothing new' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'passage-2-q4',
        prompt: 'According to the passage, is speed without comprehension a shortcut?',
        options: [
          { id: 'a', text: 'Yes, always' },
          { id: 'b', text: 'No, it skips the step where real understanding is built' },
          { id: 'c', text: 'Yes, but only for fiction' },
          { id: 'd', text: "The passage doesn't say" },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-2-q5',
        prompt: "What does patience become later, according to the passage's closing idea?",
        options: [
          { id: 'a', text: 'Boredom' },
          { id: 'b', text: 'Speed, earned honestly' },
          { id: 'c', text: 'A waste of time' },
          { id: 'd', text: 'Irrelevant' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'passage-3',
    questions: [
      {
        id: 'passage-3-q1',
        prompt: 'What is the difference between the two readers described in the passage?',
        options: [
          { id: 'a', text: 'One reads intensely in bursts, the other reads modestly but daily' },
          { id: 'b', text: 'One reads fiction, the other reads nonfiction' },
          { id: 'c', text: 'One reads on paper, the other reads on a screen' },
          { id: 'd', text: 'One reads faster than the other' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'passage-3-q2',
        prompt: 'According to the passage, which reader ends up understanding more?',
        options: [
          { id: 'a', text: 'The one who reads intensely for a week then disappears' },
          { id: 'b', text: 'The one who reads modestly but daily' },
          { id: 'c', text: 'Neither — they end up the same' },
          { id: 'd', text: "The passage doesn't say" },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-3-q3',
        prompt: 'What does a daily habit signal to the brain, per the passage?',
        options: [
          { id: 'a', text: 'That the material matters enough to return to' },
          { id: 'b', text: 'That the material should be forgotten' },
          { id: 'c', text: 'That reading is a chore' },
          { id: 'd', text: 'Nothing in particular' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'passage-3-q4',
        prompt: 'What happens to information gained through an intense, brief flood of reading, according to the passage?',
        options: [
          { id: 'a', text: 'It is remembered forever' },
          { id: 'b', text: 'Most of it fades within days' },
          { id: 'c', text: 'It becomes more valuable over time' },
          { id: 'd', text: 'It transfers instantly to long-term memory' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-3-q5',
        prompt: 'According to the passage, how does expertise usually accumulate?',
        options: [
          { id: 'a', text: 'All at once, in a single ambitious weekend' },
          { id: 'b', text: 'Quietly, in ordinary daily sessions' },
          { id: 'c', text: 'Only through formal education' },
          { id: 'd', text: 'Randomly, with no clear pattern' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'passage-4',
    questions: [
      {
        id: 'passage-4-q1',
        prompt: 'According to the passage, when does the most valuable part of reading often happen?',
        options: [
          { id: 'a', text: 'While skimming quickly' },
          { id: 'b', text: 'After the page has already been turned, during reflection' },
          { id: 'c', text: 'Before opening the book' },
          { id: 'd', text: 'Only while taking notes' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-4-q2',
        prompt: 'What happens to readers who skip the reflection step, per the passage?',
        options: [
          { id: 'a', text: 'They understand more' },
          { id: 'b', text: 'They move quickly but retain very little' },
          { id: 'c', text: 'They read faster forever' },
          { id: 'd', text: 'Nothing changes' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-4-q3',
        prompt: 'What kind of question does the passage suggest asking while reading?',
        options: [
          { id: 'a', text: 'Does this match what I already know?' },
          { id: 'b', text: 'How many pages are left?' },
          { id: 'c', text: 'What time is it?' },
          { id: 'd', text: 'Who wrote this book?' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'passage-4-q4',
        prompt: 'According to the passage, what often happens to readers who never pause to reflect?',
        options: [
          { id: 'a', text: "They can easily explain every book they've read" },
          { id: 'b', text: 'They struggle to explain what a book was actually about' },
          { id: 'c', text: 'They read much slower than average' },
          { id: 'd', text: 'They remember every detail perfectly' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'passage-4-q5',
        prompt: 'What does the passage compare reading to, when done as reflection?',
        options: [
          { id: 'a', text: 'A one-directional flow of words' },
          { id: 'b', text: 'A real conversation' },
          { id: 'c', text: 'A race against time' },
          { id: 'd', text: 'A memorization exercise' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
]
