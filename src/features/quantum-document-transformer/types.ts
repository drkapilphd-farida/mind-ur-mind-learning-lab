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

export const QuizQuestionSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(300),
})

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>

// Feynman Challenge™ — a single prompt inviting the learner to explain the
// document's own core concept back in their own words. `topic` names that
// concept (grounds the prompt in this specific document, never generic);
// `prompt` is the actual challenge text shown to the learner.
export const FeynmanChallengeSchema = z.object({
  topic: z.string().trim().min(1).max(120),
  prompt: z.string().trim().min(1).max(500),
})

export type FeynmanChallenge = z.infer<typeof FeynmanChallengeSchema>

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
// `z.ZodType<QuantumDocumentPayload>` — the same explicit-annotation
// pattern SpiderNoteSchema already uses above — rather than the two
// having to reference each other circularly.
export type QuantumDocumentPayload = {
  ai_summary: string
  spider_notes: SpiderNote
  keywords: string[]
  quiz_questions: QuizQuestion[]
  feynman_challenge: FeynmanChallenge
  mnemonics: Mnemonic[]
  subject_lens: SubjectLens
  reading_text?: string | undefined
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
export function buildQuantumDocumentPayloadSchema(targetLanguage: SupportedLanguage): z.ZodType<QuantumDocumentPayload> {
  return z
    .object({
      ai_summary: z.string().trim().min(1).max(1000),
      spider_notes: SpiderNoteSchema,
      keywords: z.array(z.string().trim().min(1).max(60)).min(1).max(20),
      quiz_questions: z.array(QuizQuestionSchema).min(2).max(3),
      feynman_challenge: FeynmanChallengeSchema,
      mnemonics: z.array(MnemonicSchema).max(10),
      subject_lens: SubjectLensSchema,
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
  spiderNotes: SpiderNote
  keywords: readonly string[]
  quizQuestions: readonly QuizQuestion[]
  feynmanChallenge: FeynmanChallenge
  mnemonics: readonly Mnemonic[]
  subjectLens: SubjectLens
  createdAt: string
}
