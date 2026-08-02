import type { ComprehensionBlock } from '@/features/reading-engine/comprehensionTypes'

// Guided Paragraph Reading Mode™ — real, hand-authored comprehension
// questions matching the 5 passages in
// guidedParagraphReadingModeDataset.ts (`guided-passage-0` ..
// `guided-passage-4`), 5 questions each. Every question and distractor is
// written by hand against the actual passage text — no AI generation,
// following this project's existing dataset convention.
export const GUIDED_PARAGRAPH_READING_MODE_COMPREHENSION_BLOCKS: readonly ComprehensionBlock[] = [
  {
    blockId: 'guided-passage-0',
    questions: [
      {
        id: 'guided-passage-0-q1',
        prompt: 'According to the passage, what is rereading often treated as, incorrectly?',
        options: [
          { id: 'a', text: 'A sign of failure' },
          { id: 'b', text: 'A sign of expertise' },
          { id: 'c', text: 'A waste of time only for beginners' },
          { id: 'd', text: 'A requirement of every book' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'guided-passage-0-q2',
        prompt: 'What is the reader mostly occupied with on the first read-through, per the passage?',
        options: [
          { id: 'a', text: 'Noticing structure and tone' },
          { id: 'b', text: 'Simply following the sentence and tracking what is happening' },
          { id: 'c', text: 'Memorizing exact words' },
          { id: 'd', text: 'Comparing it to other books' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-0-q3',
        prompt: 'What does a second pass free the mind to notice, according to the passage?',
        options: [
          { id: 'a', text: 'Nothing new' },
          { id: 'b', text: 'How an argument builds and quieter connections between ideas' },
          { id: 'c', text: 'Only spelling errors' },
          { id: 'd', text: "The book's page count" },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-0-q4',
        prompt: 'How do skilled readers treat rereading, per the passage?',
        options: [
          { id: 'a', text: 'As an embarrassing correction' },
          { id: 'b', text: 'As a normal part of reading, often without announcing it' },
          { id: 'c', text: 'As something to avoid at all costs' },
          { id: 'd', text: 'As unnecessary for any real reader' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-0-q5',
        prompt: 'According to the passage, giving a passage permission to be read twice is:',
        options: [
          { id: 'a', text: 'Slower reading with no benefit' },
          { id: 'b', text: 'Often the fastest route to actually understanding it' },
          { id: 'c', text: 'Only useful for difficult books' },
          { id: 'd', text: 'A sign the reader is not smart enough' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'guided-passage-1',
    questions: [
      {
        id: 'guided-passage-1-q1',
        prompt: 'How do people imagine their eyes moving across a line of text, per the passage?',
        options: [
          { id: 'a', text: 'Gliding smoothly, like a finger tracing a sentence' },
          { id: 'b', text: 'In slow, deliberate circles' },
          { id: 'c', text: 'Backwards then forwards' },
          { id: 'd', text: 'Not moving at all' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'guided-passage-1-q2',
        prompt: 'According to the passage, where does actual reading happen?',
        options: [
          { id: 'a', text: 'During the jumps between words' },
          { id: 'b', text: 'During the brief pauses, not the jumps' },
          { id: 'c', text: "Nowhere — reading isn't visual" },
          { id: 'd', text: 'Only at the end of a line' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-1-q3',
        prompt: 'What does a slow, uncertain reader typically do, per the passage?',
        options: [
          { id: 'a', text: 'Make long jumps across wide word clusters' },
          { id: 'b', text: 'Make small jumps and sometimes jump backward to recheck' },
          { id: 'c', text: 'Never pause at all' },
          { id: 'd', text: 'Read with eyes closed' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-1-q4',
        prompt: 'What analogy does the passage use to explain the difference between reader types?',
        options: [
          { id: 'a', text: 'A skilled driver glancing further down a road than a nervous beginner' },
          { id: 'b', text: 'A chef tasting a dish twice' },
          { id: 'c', text: 'A runner pacing themselves' },
          { id: 'd', text: 'A musician reading sheet music' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'guided-passage-1-q5',
        prompt: 'According to the passage, what should practice actually target?',
        options: [
          { id: 'a', text: 'Moving the eyes faster in a raw physical sense' },
          { id: 'b', text: 'Training the eyes to land less often and take in more each time' },
          { id: 'c', text: 'Reading with eyes fully closed' },
          { id: 'd', text: 'Avoiding all eye movement' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'guided-passage-2',
    questions: [
      {
        id: 'guided-passage-2-q1',
        prompt: 'What does the passage say feels efficient but usually isn’t?',
        options: [
          { id: 'a', text: 'Reading in silence' },
          { id: 'b', text: 'Reading with a second task running alongside it' },
          { id: 'c', text: 'Reading slowly' },
          { id: 'd', text: 'Rereading a paragraph' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-2-q2',
        prompt: 'According to the passage, what does each attention switch carry?',
        options: [
          { id: 'a', text: 'A small, invisible tax paid in lost comprehension' },
          { id: 'b', text: 'A bonus to memory' },
          { id: 'c', text: 'No real effect' },
          { id: 'd', text: 'An improvement in focus' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'guided-passage-2-q3',
        prompt: 'What often happens to a reader who reads this way, per the passage?',
        options: [
          { id: 'a', text: 'They remember everything perfectly' },
          { id: 'b', text: 'They return to the same page later, unsure if it was ever read' },
          { id: 'c', text: 'They finish books faster than anyone else' },
          { id: 'd', text: 'They never need to reread' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-2-q4',
        prompt: 'Does divided attention behave differently for people who consider themselves capable readers, per the passage?',
        options: [
          { id: 'a', text: 'Yes, capable readers are immune to it' },
          { id: 'b', text: 'No, it behaves this way for everyone regardless of ability' },
          { id: 'c', text: 'Only for readers under 20' },
          { id: 'd', text: "The passage doesn't say" },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-2-q5',
        prompt: 'What kind of fix does the passage suggest?',
        options: [
          { id: 'a', text: "A dramatic overhaul of one's whole schedule" },
          { id: 'b', text: 'Something simple, like closing one tab or silencing one notification' },
          { id: 'c', text: 'Reading only audiobooks instead' },
          { id: 'd', text: 'Giving up on multitasking entirely forever' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'guided-passage-3',
    questions: [
      {
        id: 'guided-passage-3-q1',
        prompt: 'According to the passage, why is motivation an unreliable foundation for a reading habit?',
        options: [
          { id: 'a', text: 'It naturally rises and falls for reasons unrelated to the book' },
          { id: 'b', text: 'It never changes at all' },
          { id: 'c', text: 'It only affects beginners' },
          { id: 'd', text: "It's the most reliable foundation, actually" },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'guided-passage-3-q2',
        prompt: 'What does a small, repeated ritual remove, per the passage?',
        options: [
          { id: 'a', text: 'The need to ever finish a book' },
          { id: 'b', text: 'The daily decision of whether to read' },
          { id: 'c', text: 'The value of reading itself' },
          { id: "d", text: "The reader's motivation entirely" },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-3-q3',
        prompt: 'What specific details does the passage give as examples of a ritual?',
        options: [
          { id: 'a', text: 'Reading more this year, in general' },
          { id: 'b', text: 'Ten minutes after breakfast, always in the same seat by the window' },
          { id: 'c', text: 'Reading only on weekends' },
          { id: 'd', text: 'Reading whatever feels interesting that day' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-3-q4',
        prompt: 'According to the passage, are the specific ritual details just decoration?',
        options: [
          { id: 'a', text: 'Yes, purely decorative' },
          { id: 'b', text: 'No, they are the actual mechanism the habit attaches to' },
          { id: 'c', text: "Yes, they don't matter at all" },
          { id: 'd', text: "The passage doesn't say" },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-3-q5',
        prompt: 'What happens to a reader who waits to feel like reading before starting, per the passage?',
        options: [
          { id: 'a', text: 'They read constantly, every single day' },
          { id: 'b', text: 'They read only when the mood happens to cooperate' },
          { id: 'c', text: 'They become the most consistent reader of all' },
          { id: 'd', text: 'Nothing changes for them' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    blockId: 'guided-passage-4',
    questions: [
      {
        id: 'guided-passage-4-q1',
        prompt: 'According to the passage, how is finishing every book often treated?',
        options: [
          { id: 'a', text: 'As a matter of basic discipline' },
          { id: 'b', text: 'As a waste of time always' },
          { id: 'c', text: 'As something only children worry about' },
          { id: 'd', text: 'As irrelevant to real readers' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'guided-passage-4-q2',
        prompt: 'What does the passage say a reasonable test for continuing a book is?',
        options: [
          { id: 'a', text: 'Whether it is still doing real work: teaching, interesting, or building toward a payoff' },
          { id: 'b', text: 'Whether it was expensive' },
          { id: 'c', text: 'Whether a friend recommended it' },
          { id: 'd', text: 'Whether it is a bestseller' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'guided-passage-4-q3',
        prompt: 'According to the passage, what does continuing mostly serve, once a book has stopped offering anything?',
        options: [
          { id: 'a', text: 'A private, quiet sense of obligation to an earlier decision' },
          { id: 'b', text: "The reader's genuine enjoyment" },
          { id: "c", text: "The author's royalties" },
          { id: 'd', text: "Nothing at all — there's no real reason" },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'guided-passage-4-q4',
        prompt: 'How does the passage describe learning to set a book aside without guilt?',
        options: [
          { id: 'a', text: 'As a lapse in reading skill' },
          { id: 'b', text: 'As a real reading skill in its own quiet way' },
          { id: 'c', text: 'As something only lazy readers do' },
          { id: 'd', text: 'As irrelevant to becoming a better reader' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'guided-passage-4-q5',
        prompt: 'What does protecting attention this way keep reading feeling like, per the passage?',
        options: [
          { id: 'a', text: 'A choice being made again and again' },
          { id: 'b', text: 'An old debt being slowly repaid' },
          { id: 'c', text: 'A punishment' },
          { id: 'd', text: 'A competition with other readers' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
]
