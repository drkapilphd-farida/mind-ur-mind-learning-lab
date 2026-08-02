import { z } from 'zod'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'

// Text Selection & Interactive AI Mentor Copilot™ — the quick actions
// offered on the floating selection toolbar. Kept as a small closed set
// (not a free-form prompt field) so every request maps to one of a few
// well-scoped, well-tested prompt shapes rather than an arbitrary user
// instruction reaching the model.
export const SELECTION_ACTION_TYPES = ['explain_simply', 'real_world_examples', 'simplify', 'translate_explain'] as const

export type SelectionActionType = (typeof SELECTION_ACTION_TYPES)[number]

export const SELECTION_ACTION_LABELS: Record<SelectionActionType, string> = {
  explain_simply: 'Explain Simply',
  real_world_examples: 'Real-World Examples',
  simplify: 'Simplify',
  translate_explain: 'Translate & Explain',
}

// Regional Language Support — the set `translate_explain` actually offers
// a learner: every supported language except English, since "translate
// into a regional language" is meaningless for the one language that
// already isn't regional here. Derived from the same shared
// SUPPORTED_LANGUAGES list the document transformer's own language
// selector reads from, rather than a second hardcoded list that could
// drift out of sync with it.
export const TRANSLATE_EXPLAIN_LANGUAGES = SUPPORTED_LANGUAGES.filter((language) => language.code !== 'en')

const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((language) => language.code) as [SupportedLanguage, ...SupportedLanguage[]]

// `selected_text` is capped well below a full paragraph — this endpoint is
// for a targeted highlight, not a re-run of the whole-document pipeline
// that /api/quantum-documents/transform already owns. `context` is the
// surrounding document text (e.g. a slice of raw_text/reading_text) that
// grounds the explanation without itself being the thing explained.
//
// Regional Language Support — `target_language` only matters for the
// `translate_explain` action; the `.transform` below is the route's real
// fallback logic: honor a client-provided language, otherwise fall back to
// Hindi (the first regional language in the shared list) rather than
// rejecting the request outright. The client's own fallback — preferring
// the document's own already-known language before ever asking the user to
// pick — happens earlier, in SelectionTooltip.tsx; this is the last-resort
// backstop for when neither is available.
export const ExplainSelectionRequestSchema = z
  .object({
    selected_text: z.string().trim().min(1).max(2000),
    context: z.string().trim().max(4000).optional(),
    action_type: z.enum(SELECTION_ACTION_TYPES),
    target_language: z.enum(SUPPORTED_LANGUAGE_CODES).optional(),
  })
  .transform((data) => ({
    ...data,
    target_language: data.action_type === 'translate_explain' ? (data.target_language ?? 'hi') : data.target_language,
  }))

export type ExplainSelectionRequest = z.infer<typeof ExplainSelectionRequestSchema>

export type ExplainSelectionResponse = { success: true; explanation: string } | { success: false; error: string }
