// Goal-Based Training™ — the 6 primary reading goals a learner can choose
// before their Reading Journey. Selection influences recommendation/
// coaching copy and goal-progress display; it never filters or gates
// Sprint-1's Passage/Difficulty Selection screen (locked, untouched).

import type { GoalDefinition, ReadingGoalId } from './readingIntelligenceTypes'

export const READING_GOALS: readonly GoalDefinition[] = [
  {
    id: 'academic-excellence',
    title: 'Academic Excellence',
    description: 'Build strong comprehension and vocabulary for coursework and exams.',
  },
  {
    id: 'faster-reading',
    title: 'Faster Reading',
    description: 'Increase your words-per-minute while holding comprehension steady.',
  },
  {
    id: 'better-comprehension',
    title: 'Better Comprehension',
    description: 'Deepen understanding and retention of what you read.',
  },
  {
    id: 'professional-reading',
    title: 'Professional Reading',
    description: 'Read reports, emails, and documents efficiently for work.',
  },
  {
    id: 'book-reading-mastery',
    title: 'Book Reading Mastery',
    description: 'Build stamina and comfort for longer passages and books.',
  },
  {
    id: 'competitive-exam-prep',
    title: 'Competitive Exam Preparation',
    description: 'Train speed and accuracy under exam-like conditions.',
  },
]

export function getReadingGoal(id: string): GoalDefinition | null {
  return READING_GOALS.find((goal) => goal.id === id) ?? null
}

export function isReadingGoalId(value: string): value is ReadingGoalId {
  return READING_GOALS.some((goal) => goal.id === value)
}
