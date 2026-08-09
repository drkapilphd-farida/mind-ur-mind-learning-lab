import type Anthropic from '@anthropic-ai/sdk'
import type { SupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'
import { KEYWORD_ICON_NAMES } from '@/features/quantum-document-transformer/keywordIcons'

const BASE_REQUIRED_FIELDS = [
  'ai_summary',
  'one_sentence_summary',
  'spider_notes',
  'keywords',
  'quiz_questions',
  'feynman_challenge',
  'mnemonics',
  'subject_lens',
  'short_story',
  'recall_questions',
] as const

// Anthropic tool-use `input_schema` (JSON Schema, not a Zod schema) — forcing
// the model to call this tool is what makes the response format strict, per
// ENGINEERING_CONSTITUTION.md §17 ("Tool definitions are typed with Zod
// schemas and TypeScript types"): this JSON Schema is a hand-written mirror
// of src/features/quantum-document-transformer/types.ts's
// buildQuantumDocumentPayloadSchema, which is the real, independent
// validation step run on whatever the model actually returns — this schema
// only constrains what shape the model *attempts*, it is never trusted on
// its own.
//
// Multi-Language Support — a function of targetLanguage rather than a
// static const: `reading_text` only becomes a required field when
// translating to a non-English target (see
// generateQuantumDocumentIntelligence.ts for why the English case skips it
// entirely rather than asking the model to reproduce the original text for
// free).
//
// Smart Dynamic MCQ Assessment™ — also a function of targetQuestionCount
// (computeTargetQuizQuestionCount.ts), embedded straight into the
// quiz_questions field's own description so the model sees the exact
// target inline with the schema, not just in prose elsewhere in the
// prompt.
export function buildQuantumDocumentIntelligenceTool(targetLanguage: SupportedLanguage, targetQuestionCount: number): Anthropic.Tool {
  return {
    name: 'return_document_intelligence',
    description: 'Return the structured study-material payload generated from the uploaded document.',
    input_schema: {
      type: 'object',
      // Standard JSON Schema recursion: `spiderNote` is defined once here and
      // referenced by both itself (`children`) and `spider_notes` below.
      definitions: {
        spiderNote: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            children: {
              type: 'array',
              items: { $ref: '#/definitions/spiderNote' },
            },
          },
          required: ['label'],
        },
      },
      properties: {
        ai_summary: {
          type: 'string',
          description: 'A concise 3-line core summary of the document.',
        },
        one_sentence_summary: {
          type: 'string',
          description: 'A single, powerful sentence capturing the core essence of the whole document — the one thing to remember if nothing else.',
        },
        spider_notes: { $ref: '#/definitions/spiderNote' },
        keywords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              icon: { type: 'string', enum: [...KEYWORD_ICON_NAMES], description: 'The single best-matching icon name from the enum for this specific keyword — not a default/repeated choice.' },
            },
            required: ['word', 'icon'],
          },
          description: 'Key anchor terms from the document, ordered by importance, each paired with the icon that best represents it.',
        },
        quiz_questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: { type: 'array', items: { type: 'string' }, description: 'Exactly 4 answer options.' },
              correct_answer: { type: 'string', description: "The exact text of the correct option, copied verbatim from options." },
            },
            required: ['question', 'options', 'correct_answer'],
          },
          description: `Exactly ${targetQuestionCount} multiple-choice active-recall questions, each with 4 options and the correct answer's exact text.`,
        },
        feynman_challenge: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: "The document's own core concept, named specifically." },
            prompt: { type: 'string', description: 'A challenge inviting the learner to explain that concept in 3 simple, non-academic sentences.' },
          },
          required: ['topic', 'prompt'],
          description: 'Feynman Challenge — a prompt asking the learner to explain the core concept simply, in their own words.',
        },
        mnemonics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              term: { type: 'string', description: 'The difficult term, formula, or date.' },
              hook: { type: 'string', description: 'A clever memory hook, trick, or visual anchor for it.' },
            },
            required: ['term', 'hook'],
          },
          description: 'Smart Mnemonics — a memory hook for each genuinely difficult term/formula/date. Empty array if the document has none.',
        },
        subject_lens: {
          type: 'object',
          properties: {
            subject: { type: 'string', description: 'The real subject/domain of this document (e.g. Physics, Literature, History).' },
            insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', description: 'A subject-appropriate insight label (e.g. "Key Formula" for STEM, "Central Theme" for humanities).' },
                  detail: { type: 'string' },
                },
                required: ['label', 'detail'],
              },
            },
          },
          required: ['subject', 'insights'],
          description: 'Subject-Specific Lens — structured insights whose vocabulary is tailored to the document’s real subject.',
        },
        short_story: {
          type: 'string',
          description: 'A short, engaging 5-6 line mnemonic narrative story that weaves the document’s core concepts together so they stick in memory effortlessly — a character, a journey, or a scenario, not a dry restatement of facts.',
        },
        recall_questions: {
          type: 'array',
          items: { type: 'string' },
          description: '3-6 open-ended active-recall questions for self-testing (no options, no single correct answer to check against) — distinct from quiz_questions, meant for quick, low-pressure self-reflection rather than scoring.',
        },
        reading_text: {
          type: 'string',
          description: "The document's full content translated into the target language, ready for word-by-word speed reading. Only provide this when the target language is not English.",
        },
      },
      required: targetLanguage === 'en' ? [...BASE_REQUIRED_FIELDS] : [...BASE_REQUIRED_FIELDS, 'reading_text'],
    },
  }
}
