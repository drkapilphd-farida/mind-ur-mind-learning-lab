// Flash Recall & Retention Sprint™ — redesigned around True RSVP (Rapid
// Serial Visual Presentation): one continuous, uninterrupted word-by-word
// stream, read start to finish with zero mid-exercise stops, followed by a
// single post-session 3-question comprehension check. This replaces the
// previous "6 rounds, each its own 12-word flash + immediate question"
// design — that repeatedly broke the reading flow, exactly what this
// redesign removes.
//
// The passage below is the same real, hand-authored content the previous
// 6 rounds used (no AI, no lorem ipsum, nothing thrown away) — now read as
// one continuous six-sentence passage instead of six separate interrupted
// flashes.
export type FlashRecallSprintQuizQuestion = {
  id: string
  question: string
  options: readonly string[]
  correctOptionIndex: number
}

export const FLASH_RECALL_SPRINT_SENTENCES: readonly string[] = [
  'Quiet practice each morning slowly builds confidence that carries through busy days.',
  'A calm reader always trusts their eyes to keep moving steadily forward.',
  'Small wins that repeat daily quietly become a much bigger habit eventually.',
  'Curiosity always keeps your mind open even when the material feels difficult.',
  'Real focus truly grows the moment you stop rushing toward the ending.',
  'Patience during daily practice matters far more than raw natural talent alone.',
]

export const FLASH_RECALL_SPRINT_PASSAGE = FLASH_RECALL_SPRINT_SENTENCES.join(' ')

// True RSVP units — one word per flash, exactly what "word-by-word" means.
// Feeding this straight into the UNCHANGED useReadingRuntime works exactly
// right with zero changes there: each unit's dwell time is
// `countWords(unit) * 60000/targetWpm`, and countWords of a single word is
// always 1, so every word gets an identical, precisely WPM-paced dwell —
// true RSVP timing, entirely for free from the locked engine.
export const FLASH_RECALL_SPRINT_WORDS: readonly string[] = FLASH_RECALL_SPRINT_PASSAGE.split(/\s+/).filter(Boolean)

export const FLASH_RECALL_SPRINT_QUESTIONS: readonly FlashRecallSprintQuizQuestion[] = [
  {
    id: 'flash-recall-q1',
    question: 'According to the passage, what does quiet daily practice build over time?',
    options: ['Confidence that carries through busy days', 'A faster reading speed only', 'A larger vocabulary', 'Immediate perfection'],
    correctOptionIndex: 0,
  },
  {
    id: 'flash-recall-q2',
    question: 'What does the passage say a calm reader trusts their eyes to do?',
    options: ['Stop frequently to rest', 'Keep moving steadily forward', 'Jump back to reread often', 'Close between sentences'],
    correctOptionIndex: 1,
  },
  {
    id: 'flash-recall-q3',
    question: 'According to the passage, what matters far more than raw natural talent?',
    options: ['Expensive tools', 'Natural talent itself', 'Patience during daily practice', 'Reading only when motivated'],
    correctOptionIndex: 2,
  },
] as const
