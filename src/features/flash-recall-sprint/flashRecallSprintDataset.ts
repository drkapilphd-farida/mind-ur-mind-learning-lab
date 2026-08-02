import type { ComprehensionQuestion } from '@/features/reading-engine/comprehensionTypes'

export type FlashRecallRound = {
  id: string
  passage: string
  question: ComprehensionQuestion
}

// Flash Recall & Retention Sprint™ — Quantum Speed Reading™ V2, fourth and
// final advanced training exercise. Deliberately its own folder/content,
// separate from every V1 flash exercise (word-flash, symbol-flash,
// mixed-flash, number-flash, peripheral-flash) and every Reading Mode — no
// shared files, no route collision. Real, hand-authored 12-word passages
// (no AI, no API, no lorem ipsum), each fed to the UNCHANGED
// useReadingRuntime as a single unit: at a fixed 12-word length, choosing
// a target WPM from FlashRecallSprintSettings's own narrow [150,175,200,225]
// band keeps the resulting single-unit dwell time (word count *
// 60000/targetWpm) reliably inside the required 3-5 second flash window
// (150 WPM -> 4.8s, 225 WPM -> 3.2s) without inventing any separate timer
// — this is the same "dose real content to a target duration" approach
// used by Rapid Visual Span Expander's timed rounds, just applied to a
// single flashed passage instead of many short flashes.
export const FLASH_RECALL_SPRINT_ROUNDS: readonly FlashRecallRound[] = [
  {
    id: 'round-1',
    passage: 'Quiet practice each morning slowly builds confidence that carries through busy days.',
    question: {
      id: 'round-1-q1',
      prompt: 'What does quiet daily practice build, according to the passage?',
      options: [
        { id: 'a', text: 'Confidence' },
        { id: 'b', text: 'Wealth' },
        { id: 'c', text: 'Fear' },
        { id: 'd', text: 'Boredom' },
      ],
      correctOptionId: 'a',
    },
  },
  {
    id: 'round-2',
    passage: 'A calm reader always trusts their eyes to keep moving steadily forward.',
    question: {
      id: 'round-2-q1',
      prompt: 'What does a calm reader trust their eyes to do?',
      options: [
        { id: 'a', text: 'Keep moving steadily forward' },
        { id: 'b', text: 'Close for a rest' },
        { id: 'c', text: 'Look away often' },
        { id: 'd', text: 'Blink rapidly' },
      ],
      correctOptionId: 'a',
    },
  },
  {
    id: 'round-3',
    passage: 'Small wins that repeat daily quietly become a much bigger habit eventually.',
    question: {
      id: 'round-3-q1',
      prompt: 'What do small wins that repeat daily quietly become?',
      options: [
        { id: 'a', text: 'A much bigger habit' },
        { id: 'b', text: 'A distraction' },
        { id: 'c', text: 'A mistake' },
        { id: 'd', text: 'Irrelevant' },
      ],
      correctOptionId: 'a',
    },
  },
  {
    id: 'round-4',
    passage: 'Curiosity always keeps your mind open even when the material feels difficult.',
    question: {
      id: 'round-4-q1',
      prompt: 'What does curiosity keep open, according to the passage?',
      options: [
        { id: 'a', text: 'Your mind' },
        { id: 'b', text: 'A door' },
        { id: 'c', text: 'A book' },
        { id: 'd', text: 'Your eyes' },
      ],
      correctOptionId: 'a',
    },
  },
  {
    id: 'round-5',
    passage: 'Real focus truly grows the moment you stop rushing toward the ending.',
    question: {
      id: 'round-5-q1',
      prompt: 'When does real focus grow, according to the passage?',
      options: [
        { id: 'a', text: 'When you stop rushing toward the ending' },
        { id: 'b', text: 'When you rush even faster' },
        { id: 'c', text: 'When you multitask' },
        { id: 'd', text: 'When you give up' },
      ],
      correctOptionId: 'a',
    },
  },
  {
    id: 'round-6',
    passage: 'Patience during daily practice matters far more than raw natural talent alone.',
    question: {
      id: 'round-6-q1',
      prompt: 'What matters far more than raw natural talent, according to the passage?',
      options: [
        { id: 'a', text: 'Patience during daily practice' },
        { id: 'b', text: 'Luck' },
        { id: 'c', text: 'Speed' },
        { id: 'd', text: 'Money' },
      ],
      correctOptionId: 'a',
    },
  },
] as const

export const TOTAL_FLASH_RECALL_SPRINT_ROUNDS = FLASH_RECALL_SPRINT_ROUNDS.length
