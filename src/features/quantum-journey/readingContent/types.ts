// Rich Indian-Centric Content Database™ — same shape as, and directly
// interoperable with, quantumReadingSprintDataset.ts's own ReadingSet/
// ReadingMCQ types (so this pool can feed QuantumReadingSprintPhase and
// pair with RetentionCheckPhase exactly like that file's own built-in
// passages already do). Kept as an independent own-copy here rather than
// importing those types, since this module intentionally has its own
// category/length-tier metadata that file has no concept of.
export type JourneyReadingMCQ = { question: string; options: readonly [string, string, string, string]; correctIndex: number }

export type JourneyReadingCategory =
  | 'short-stories'
  | 'science-explained'
  | 'indian-civics'
  | 'geography'
  | 'social-media'
  | 'quantum-mind-programs'
  | 'cricket-and-celebrities'
  | 'sports'

export const JOURNEY_READING_CATEGORY_LABELS: Record<JourneyReadingCategory, string> = {
  'short-stories': 'Short Stories',
  'science-explained': 'Science Explained',
  'indian-civics': 'Indian Civics & Governance',
  geography: 'Geography',
  'social-media': 'Social Media',
  'quantum-mind-programs': 'Quantum Mind Programs',
  'cricket-and-celebrities': 'Cricketers & Celebrities',
  sports: 'Sports',
}

// Progressive Reading™ — which length tier a passage belongs to. Week 1
// draws from 'short', Week 2 from 'medium', Week 3 from 'long' (see
// getReadingMode.ts's own pool-selection logic) — reading duration/length
// grows naturally as the journey progresses, without needing 21 distinct
// tiers.
export type JourneyLengthTier = 'short' | 'medium' | 'long'

export type JourneyReadingSet = {
  id: string
  category: JourneyReadingCategory
  lengthTier: JourneyLengthTier
  text: string
  comprehensionQuestions: readonly [JourneyReadingMCQ, JourneyReadingMCQ]
  retentionQuestions: readonly [JourneyReadingMCQ, JourneyReadingMCQ]
}

// Definition shape authors actually write content in — `correctAnswer` is
// the real option text, never a hand-placed index (the exact discipline
// quantumReadingSprintDataset.ts's own comment explains: a shuffled index
// placed by hand has previously shipped as a real bug). buildReadingSet
// below shuffles options and derives the index automatically.
export type JourneyReadingQuestionDef = { question: string; options: readonly [string, string, string, string]; correctAnswer: string }

export type JourneyReadingSetDef = {
  id: string
  category: JourneyReadingCategory
  lengthTier: JourneyLengthTier
  text: string
  comprehensionQuestions: readonly [JourneyReadingQuestionDef, JourneyReadingQuestionDef]
  retentionQuestions: readonly [JourneyReadingQuestionDef, JourneyReadingQuestionDef]
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j] as T
    copy[j] = temp as T
  }
  return copy
}

function buildQuestion(def: JourneyReadingQuestionDef): JourneyReadingMCQ {
  const shuffledOptions = shuffle(def.options)
  const correctIndex = shuffledOptions.indexOf(def.correctAnswer)
  if (correctIndex === -1) {
    throw new Error(`buildQuestion: correctAnswer "${def.correctAnswer}" not found among options for "${def.question}"`)
  }
  return { question: def.question, options: shuffledOptions as [string, string, string, string], correctIndex }
}

export function buildReadingSet(def: JourneyReadingSetDef): JourneyReadingSet {
  return {
    id: def.id,
    category: def.category,
    lengthTier: def.lengthTier,
    text: def.text,
    comprehensionQuestions: [buildQuestion(def.comprehensionQuestions[0]), buildQuestion(def.comprehensionQuestions[1])],
    retentionQuestions: [buildQuestion(def.retentionQuestions[0]), buildQuestion(def.retentionQuestions[1])],
  }
}
