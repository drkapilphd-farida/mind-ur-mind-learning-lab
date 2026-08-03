// Smart Dynamic MCQ Assessment™ — scales the number of AI-generated
// multiple-choice questions with how much material there actually is to
// test, instead of a fixed 2-3 regardless of document length. Computed
// deterministically from the real word count of the text actually sent
// to the model (never guessed by the model itself) — the AI prompt is
// then told this exact target, and buildQuantumDocumentPayloadSchema's
// lenient 3-20 range accepts whatever count the model actually lands on.
const THRESHOLDS = [
  { maxWords: 300, questionCount: 3 },
  { maxWords: 800, questionCount: 5 },
  { maxWords: 2000, questionCount: 8 },
  { maxWords: 4000, questionCount: 12 },
  { maxWords: 8000, questionCount: 16 },
] as const

const MAX_QUIZ_QUESTIONS = 20

export function computeTargetQuizQuestionCount(wordCount: number): number {
  const tier = THRESHOLDS.find((threshold) => wordCount <= threshold.maxWords)
  return tier ? tier.questionCount : MAX_QUIZ_QUESTIONS
}
