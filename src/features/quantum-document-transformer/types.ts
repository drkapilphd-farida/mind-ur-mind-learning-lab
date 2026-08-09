import { z } from 'zod'
import type { SupportedLanguage } from './supportedLanguages'

// A node in the spider/mind-map tree — recursive, so `z.lazy` is required.
// `label` is the only required field per node; `children` defaults to an
// empty array for leaf nodes rather than requiring the model to emit `[]`
// explicitly every time.
export type SpiderNote = {
  label: string
  children: readonly SpiderNote[]
}

export const SpiderNoteSchema: z.ZodType<SpiderNote> = z.lazy(() =>
  z.object({
    label: z.string().trim().min(1).max(120),
    children: z.array(SpiderNoteSchema).max(12).default([]),
  }),
)

// "Read less, remember more" — a keyword paired with a Lucide icon name
// chosen by the model. `icon` is validated only as a non-empty string
// here, deliberately lenient (not a z.enum against KEYWORD_ICON_MAP) —
// rejecting an entire otherwise-good document because the model picked
// an icon name half a step outside the whitelist would be a worse
// outcome than just falling back to a generic icon for that one
// keyword. The whitelist/fallback resolution happens once, at render
// time, in resolveKeywordIcon (keywordIcons.ts) — never at parse time.
export const KeywordSchema = z.object({
  word: z.string().trim().min(1).max(60),
  icon: z.string().trim().min(1).max(40),
})

export type KeywordWithIcon = z.infer<typeof KeywordSchema>

// Smart Dynamic MCQ Assessment™ — the model returns the correct option's
// exact TEXT (`correct_answer`), never a hand-placed index. Mirroring
// readingContent/types.ts's `buildQuestion()` discipline: a model- or
// author-supplied index that silently drifts from its options array is a
// real bug class this codebase already hit once, so the index is always
// *derived* after the fact (see deriveMcqQuizQuestions below), never
// trusted directly from the model.
export const McqQuestionDraftSchema = z
  .object({
    question: z.string().trim().min(1).max(300),
    options: z.array(z.string().trim().min(1).max(150)).length(4),
    correct_answer: z.string().trim().min(1).max(150),
  })
  .refine((data) => data.options.includes(data.correct_answer), {
    message: 'correct_answer must be one of the provided options',
    path: ['correct_answer'],
  })

export type McqQuestionDraft = z.infer<typeof McqQuestionDraftSchema>

// The final, persisted MCQ shape — `correctIndex` here was derived by
// deriveMcqQuizQuestions, never supplied directly by the model. Field
// naming (`correctIndex`, not `correct_index`) deliberately matches
// quantum-journey/readingContent/types.ts's `JourneyReadingMCQ` shape.
export const McqQuizQuestionSchema = z.object({
  question: z.string().trim().min(1).max(300),
  options: z.array(z.string().trim().min(1).max(150)).length(4),
  correctIndex: z.number().int().min(0).max(3),
})

export type McqQuizQuestion = z.infer<typeof McqQuizQuestionSchema>

// Active Recall Quiz™ v1 shape — kept only so quantum_documents rows
// saved before the Smart Dynamic MCQ Assessment™ upgrade still
// re-validate and reopen correctly in getQuantumDocumentById.ts. No
// document is ever generated in this shape again (see
// buildQuantumDocumentPayloadSchema below, which only ever produces
// McqQuestionDraft); QuantumDocumentRecallQuizView.tsx (the old flip-card
// UI) stays wired to exactly this legacy shape.
export const LegacyQuizQuestionSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(300),
})

export type LegacyQuizQuestion = z.infer<typeof LegacyQuizQuestionSchema>

// What a *stored* document's quiz_questions can honestly be: either
// shape, depending on when it was generated. Never used for validating a
// fresh generation (buildQuantumDocumentPayloadSchema below is stricter,
// MCQ-only) — only for re-reading whatever a past row actually contains.
export const QuizQuestionSchema = z.union([McqQuizQuestionSchema, LegacyQuizQuestionSchema])

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>

export function isMcqQuizQuestion(question: QuizQuestion): question is McqQuizQuestion {
  return 'options' in question
}

function shuffleOptions(options: readonly string[]): string[] {
  const copy = [...options]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j] as string
    copy[j] = temp as string
  }
  return copy
}

// Smart Dynamic MCQ Assessment™ — turns the model's draft questions
// (options + the correct option's text) into the final, storable shape
// (shuffled options + a derived correctIndex). `correct_answer` is
// guaranteed present among `options` by McqQuestionDraftSchema's own
// `.refine()`, so `indexOf` below can never legitimately return -1 — if
// it somehow did, that's a real bug worth a loud failure, not a silently
// wrong "correct" answer at index 0.
export function deriveMcqQuizQuestions(drafts: readonly McqQuestionDraft[]): McqQuizQuestion[] {
  return drafts.map((draft) => {
    const shuffled = shuffleOptions(draft.options)
    const correctIndex = shuffled.indexOf(draft.correct_answer)
    if (correctIndex === -1) {
      throw new Error(`deriveMcqQuizQuestions: correct_answer "${draft.correct_answer}" not found among shuffled options for "${draft.question}"`)
    }
    return { question: draft.question, options: shuffled as [string, string, string, string], correctIndex }
  })
}

// Feynman Challenge™ — a single prompt inviting the learner to explain the
// document's own core concept back in their own words. `topic` names that
// concept (grounds the prompt in this specific document, never generic);
// `prompt` is the actual challenge text shown to the learner.
export const FeynmanChallengeSchema = z.object({
  topic: z.string().trim().min(1).max(120),
  prompt: z.string().trim().min(1).max(500),
})

export type FeynmanChallenge = z.infer<typeof FeynmanChallengeSchema>

// Interactive Feynman Challenge™ — the on-demand evaluation request a
// learner triggers by typing their own explanation and clicking
// "Evaluate with AI". Deliberately NOT part of QuantumDocumentPayload or
// buildQuantumDocumentPayloadSchema above: this is a separate,
// user-initiated call (see /api/quantum-document-transformer/
// feynman-evaluate), not a field the main document-generation call ever
// produces — `topic`/`prompt` here are just the ALREADY-generated
// challenge echoed back for grounding, never re-generated.
export const FeynmanEvaluationRequestSchema = z.object({
  topic: z.string().trim().min(1).max(120),
  prompt: z.string().trim().min(1).max(500),
  learner_explanation: z.string().trim().min(1).max(1500),
})

export type FeynmanEvaluationRequest = z.infer<typeof FeynmanEvaluationRequestSchema>

export type FeynmanEvaluationResponse = { success: true; score: number; feedback: string } | { success: false; error: string }

// Smart Mnemonics™ — one real memory hook per genuinely difficult
// term/formula/date the model found in the document. `min(0)`, not
// `min(1)`: a short or simple document may honestly have nothing worth a
// memory trick, and forcing at least one would mean fabricating one.
export const MnemonicSchema = z.object({
  term: z.string().trim().min(1).max(120),
  hook: z.string().trim().min(1).max(300),
})

export type Mnemonic = z.infer<typeof MnemonicSchema>

export const SubjectLensInsightSchema = z.object({
  label: z.string().trim().min(1).max(80),
  detail: z.string().trim().min(1).max(500),
})

export type SubjectLensInsight = z.infer<typeof SubjectLensInsightSchema>

// Subject-Specific Lens™ — `subject` is the model's own real classification
// of this document (e.g. "Physics", "Literature"), and `insights` is a
// small set of structured call-outs whose `label` vocabulary follows that
// subject (e.g. "Key Formula"/"Step-by-Step Logic" for STEM vs. "Central
// Theme"/"Narrative Sequence" for humanities) — the model chooses the
// labels per document rather than this schema hardcoding one fixed set
// that wouldn't fit every subject.
export const SubjectLensSchema = z.object({
  subject: z.string().trim().min(1).max(80),
  insights: z.array(SubjectLensInsightSchema).min(1).max(8),
})

export type SubjectLens = z.infer<typeof SubjectLensSchema>

// The exact shape the model must return, forced via Anthropic tool-use
// (see src/lib/ai/tools/quantumDocumentIntelligenceTool.ts) — this schema
// is the second, independent check: a tool-use call can still return
// malformed or out-of-range data, so the raw tool input is always parsed
// through this before it's trusted or persisted (per
// ENGINEERING_CONSTITUTION.md §17, "AI-generated content that will be
// persisted to the database is validated for length and structure before
// storage").
//
// The TS type is declared by hand (not inferred from the schema below) so
// buildQuantumDocumentPayloadSchema's return type can be written as
// `z.ZodType<QuantumDocumentGenerationDraft>` — the same explicit-
// annotation pattern SpiderNoteSchema already uses above — rather than
// the two having to reference each other circularly. `quiz_questions`
// here is always the final, derived MCQ shape (McqQuizQuestion) — every
// freshly generated document is MCQ-only; deriveMcqQuizQuestions runs
// between schema validation and this type being handed back (see
// generateQuantumDocumentIntelligence.ts).
export type QuantumDocumentPayload = {
  ai_summary: string
  one_sentence_summary: string
  spider_notes: SpiderNote
  keywords: KeywordWithIcon[]
  quiz_questions: McqQuizQuestion[]
  feynman_challenge: FeynmanChallenge
  mnemonics: Mnemonic[]
  subject_lens: SubjectLens
  short_story: string
  recall_questions: string[]
  reading_text?: string | undefined
}

// The raw shape validated straight off the model's tool-use response,
// before deriveMcqQuizQuestions turns each question's model-supplied
// `correct_answer` text into a shuffled `correctIndex`. Identical to
// QuantumDocumentPayload except quiz_questions is still draft-shaped.
export type QuantumDocumentGenerationDraft = Omit<QuantumDocumentPayload, 'quiz_questions'> & {
  quiz_questions: McqQuestionDraft[]
}

// Multi-Language Support — `reading_text` (the document's content
// translated into the target language, for RSVP speed reading) is only
// ever requested from the model when translating to a non-English target
// (see generateQuantumDocumentIntelligence.ts): asking Claude to
// reproduce the entire original text verbatim for the English case would
// cost real output tokens for zero value, since the already-extracted
// original text already covers that. `buildQuantumDocumentPayloadSchema`
// is parametrized by targetLanguage so the runtime check enforces
// `reading_text`'s presence only when it was actually asked for.
//
// Smart Dynamic MCQ Assessment™ — quiz_questions accepts 3-20 questions
// (not a fixed 2-3): the AI prompt/tool are told an exact target count
// computed from real document length (computeTargetQuizQuestionCount),
// but validation here stays a lenient range rather than an exact match —
// a model that lands a little under or over its target still produces a
// usable document instead of a hard failure.
export function buildQuantumDocumentPayloadSchema(targetLanguage: SupportedLanguage): z.ZodType<QuantumDocumentGenerationDraft> {
  return z
    .object({
      ai_summary: z.string().trim().min(1).max(1000),
      one_sentence_summary: z.string().trim().min(1).max(240),
      spider_notes: SpiderNoteSchema,
      keywords: z.array(KeywordSchema).min(1).max(20),
      quiz_questions: z.array(McqQuestionDraftSchema).min(3).max(20),
      feynman_challenge: FeynmanChallengeSchema,
      mnemonics: z.array(MnemonicSchema).max(10),
      subject_lens: SubjectLensSchema,
      short_story: z.string().trim().min(1).max(1200),
      recall_questions: z.array(z.string().trim().min(1).max(300)).min(3).max(6),
      reading_text: z.string().trim().min(1).optional(),
    })
    .refine((data) => targetLanguage === 'en' || (typeof data.reading_text === 'string' && data.reading_text.length > 0), {
      message: 'reading_text is required when translating to a non-English target language',
      path: ['reading_text'],
    })
}

export type QuantumDocument = {
  id: string
  title: string
  rawText: string
  readingText: string
  targetLanguage: SupportedLanguage
  aiSummary: string
  // Null for a document generated before this field existed —
  // getQuantumDocumentById.ts never fabricates one for an old row.
  oneSentenceSummary: string | null
  spiderNotes: SpiderNote
  keywords: readonly KeywordWithIcon[]
  quizQuestions: readonly QuizQuestion[]
  feynmanChallenge: FeynmanChallenge
  mnemonics: readonly Mnemonic[]
  subjectLens: SubjectLens
  shortStory: string | null
  recallQuestions: readonly string[]
  createdAt: string
}
