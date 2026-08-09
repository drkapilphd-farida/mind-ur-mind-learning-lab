'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  SpiderNoteSchema,
  QuizQuestionSchema,
  FeynmanChallengeSchema,
  MnemonicSchema,
  SubjectLensSchema,
  type QuantumDocument,
} from '../types'
import { isSupportedLanguage, DEFAULT_LANGUAGE } from '../supportedLanguages'

export type GetQuantumDocumentByIdResult =
  | { success: true; document: QuantumDocument }
  | { success: false; error: string }

// Document History & Library — loads one past document's full saved
// payload straight from quantum_documents, no AI call and no new token
// cost (the whole point of "reopen," not "regenerate"). The structured
// jsonb columns are re-validated through the exact same Zod schemas the
// transform Route Handler uses to validate a fresh AI response — a
// stored row is still untrusted-until-checked data, the same as a live
// tool-use response would be, and a genuinely malformed/legacy row
// (e.g. one that predates a column added by a later migration) is
// reported as unreadable rather than papered over with fabricated empty
// sections.
export async function getQuantumDocumentById(documentId: string): Promise<GetQuantumDocumentByIdResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to view your document history.' }
  }

  const { data: row, error } = await supabase
    .from('quantum_documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !row) {
    return { success: false, error: 'This document could not be found.' }
  }

  // "Read less, remember more" — keyword_icons is a new, separate
  // `word -> icon name` column (never null-checked against keywords'
  // own length/order, since the two are matched by word, not index).
  // A pre-upgrade row simply has keyword_icons = null, and every word
  // falls back to a generic icon at render time (resolveKeywordIcon) —
  // never a validation failure just because a row predates this column.
  const keywordIcons = (row.keyword_icons ?? {}) as Record<string, string>

  const spiderNotesResult = SpiderNoteSchema.safeParse(row.spider_notes)
  const quizQuestionsResult = z.array(QuizQuestionSchema).safeParse(row.quiz_questions)
  const feynmanChallengeResult = FeynmanChallengeSchema.safeParse(row.feynman_challenge)
  const subjectLensResult = SubjectLensSchema.safeParse(row.subject_lens)
  // Genuinely allowed to be empty by the original schema (a simple
  // document can have no mnemonics) — a missing/null column (a row from
  // before this column existed) is treated the same honest way, not as a
  // validation failure.
  const mnemonicsResult = z.array(MnemonicSchema).safeParse(row.mnemonics ?? [])

  if (!spiderNotesResult.success || !quizQuestionsResult.success || !feynmanChallengeResult.success || !subjectLensResult.success || !mnemonicsResult.success) {
    return { success: false, error: 'This document is missing some saved data and can’t be reopened right now.' }
  }

  const document: QuantumDocument = {
    id: row.id,
    title: row.title,
    rawText: row.raw_text,
    readingText: row.reading_text ?? row.raw_text,
    targetLanguage: isSupportedLanguage(row.target_language) ? row.target_language : DEFAULT_LANGUAGE,
    aiSummary: row.ai_summary ?? '',
    oneSentenceSummary: row.one_sentence_summary,
    spiderNotes: spiderNotesResult.data,
    keywords: (row.keywords ?? []).map((word) => ({ word, icon: keywordIcons[word] ?? 'tag' })),
    quizQuestions: quizQuestionsResult.data,
    feynmanChallenge: feynmanChallengeResult.data,
    mnemonics: mnemonicsResult.data,
    subjectLens: subjectLensResult.data,
    shortStory: row.short_story,
    recallQuestions: row.recall_questions ?? [],
    createdAt: row.created_at,
  }

  return { success: true, document }
}
