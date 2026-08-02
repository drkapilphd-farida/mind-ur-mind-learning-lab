import type { ModeChunkView } from '@/features/learning-mode-runtime'
import { buildComprehensionQuestions, type ComprehensionQuestion } from '../../presentation/buildComprehensionQuestions'
import type { DocumentComprehensionSignal } from '../../presentation/listDocumentComprehensionSignals'
import type { AssessmentPassage, AssessmentStageId } from '../selectAssessmentPassages'
import { hashString, seededShuffle } from './assessmentQuestionUtils'
import { buildKeywordIdentificationQuestion } from './buildKeywordIdentificationQuestion'
import { buildTrueFalseQuestion } from './buildTrueFalseQuestion'
import { buildFillInTheBlankQuestion } from './buildFillInTheBlankQuestion'
import type { AssessmentQuestion } from './AssessmentQuestion'

// Reading Assessment Engine™ — 2-3 questions per stage, up to 5 for
// Paragraph (the brief's own limits), never more than what a stage's
// real, available enrichment can honestly support.
const MAX_QUESTIONS_PER_STAGE: Record<AssessmentStageId, number> = {
  'word-chunk': 3,
  'phrase-chunk': 3,
  sentence: 3,
  paragraph: 5,
}

// Reading Assessment Engine™ — the question-generation orchestrator.
// Multiple Choice + Main Idea reuse `buildComprehensionQuestions.ts`
// verbatim (zero changes to that file); Keyword Identification/True-
// False/Fill-in-the-Blank are the 3 new builders this sprint adds. Every
// builder already returns null/[] honestly when a passage's real
// enrichment can't support that type — this orchestrator just pools
// whatever came back real and picks a deterministic, seeded subset.
export function buildAssessmentQuestions(passage: AssessmentPassage, allPassages: readonly AssessmentPassage[], comprehensionSignals: readonly DocumentComprehensionSignal[]): readonly AssessmentQuestion[] {
  const comprehensionQuestions = buildComprehensionQuestions(toModeChunkView(passage), comprehensionSignals).map(toAssessmentQuestion)
  const newQuestions = [buildKeywordIdentificationQuestion(passage, allPassages), buildTrueFalseQuestion(passage, allPassages), buildFillInTheBlankQuestion(passage, allPassages)].filter(
    (question): question is AssessmentQuestion => question !== null,
  )

  const allQuestions = [...comprehensionQuestions, ...newQuestions]
  const seed = hashString(`${passage.chunkNodeId}-question-order`)
  return seededShuffle(allQuestions, seed).slice(0, MAX_QUESTIONS_PER_STAGE[passage.stage])
}

function toModeChunkView(passage: AssessmentPassage): ModeChunkView {
  return { chunkNodeId: passage.chunkNodeId, order: 0, content: passage.content, title: null, sectionHeading: null, isCheckpoint: false, enrichment: passage.enrichment }
}

function toAssessmentQuestion(question: ComprehensionQuestion): AssessmentQuestion {
  return { type: question.kind === 'main-idea' ? 'main-idea' : 'multiple-choice', prompt: question.prompt, options: question.options }
}
