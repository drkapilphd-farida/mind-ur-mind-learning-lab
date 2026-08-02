import '@/features/flash-intelligence/wordFlashDataset'
import '@/features/chunk-reading/chunkDataset'
import './sentenceDataset'
import './paragraphDataset'
import type { ContentItem, ContentType, DifficultyTier } from '@/types/exercise-engine'
import { pickUniqueByContent } from './loadContent'
import type { ReadingSprintId } from './readingSprints'
import type { SprintContentItem, SprintContentProvider } from './sprintContentProvider'

// Dataset content is stored lowercase; Reading Discovery's approved UI
// displays title-case words/phrases — a display-only transform, mirrors
// `loadContent.ts`'s own identical helper.
function toTitleCase(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

const SPRINT_CONTENT_TYPE: Record<Exclude<ReadingSprintId, 'meaning'>, ContentType> = {
  word: 'word',
  phrase: 'chunk',
  sentence: 'sentence',
  paragraph: 'paragraph',
}

function getTextItems(contentType: ContentType, tier: DifficultyTier, targetCount: number, seed: number, excludeIds: readonly string[]): readonly SprintContentItem[] {
  const records = pickUniqueByContent(contentType, tier, targetCount, seed, new Set(excludeIds), new Set())
  const titleCase = contentType === 'word' || contentType === 'chunk'
  return records.map((item) => ({ kind: 'text', id: item.id, text: titleCase ? toTitleCase(item.content) : item.content }))
}

type QuestionMetadata = { question: string; options: string[]; correctOptionIndex: number }

function isQuestionMetadata(metadata: Record<string, unknown> | undefined): metadata is QuestionMetadata {
  return (
    typeof metadata?.question === 'string' &&
    Array.isArray(metadata.options) &&
    metadata.options.every((option): option is string => typeof option === 'string') &&
    typeof metadata.correctOptionIndex === 'number'
  )
}

function toQuestionItem(item: ContentItem & { metadata: QuestionMetadata }): SprintContentItem {
  const optionIds = item.metadata.options.map((_label, index) => `${item.id}-option-${index}`)
  return {
    kind: 'question',
    id: item.id,
    question: {
      id: item.id,
      prompt: item.metadata.question,
      options: item.metadata.options.map((label, index) => ({ id: optionIds[index]!, label })),
      // Sprint-2.6B FIX-16 — real, internal-only ground truth for the
      // Reading Intelligence Model. Never read by `ComprehensionCard`.
      correctOptionId: optionIds[item.metadata.correctOptionIndex] ?? optionIds[0]!,
    },
  }
}

// Reading Understanding's real comprehension questions are pooled from
// BOTH the sentence and paragraph datasets' own real `metadata.question`
// fields — per Sprint-2.6B FIX-20, this is now the ONLY place in the
// whole session real questions are asked. Sprint-2.5 FIX-03 —
// `excludeIds` (real ids already used earlier this same session, e.g. by
// Sentence/Paragraph Sprint's own real reading) keeps the exact same
// real sentence/paragraph from ever surfacing twice, whether as reading
// content or as a question.
function getMeaningQuestionItems(tier: DifficultyTier, targetCount: number, seed: number, excludeIds: readonly string[]): readonly SprintContentItem[] {
  const excludeSet = new Set(excludeIds)
  const sentenceItems = pickUniqueByContent('sentence', tier, targetCount, seed, new Set(excludeSet), new Set())
  const paragraphItems = pickUniqueByContent('paragraph', tier, targetCount, seed + 1, new Set(excludeSet), new Set())
  const pool = [...sentenceItems, ...paragraphItems].filter((item): item is ContentItem & { metadata: QuestionMetadata } => isQuestionMetadata(item.metadata))
  return pool.slice(0, targetCount).map(toQuestionItem)
}

// Reading Runtime Engine™ (Sprint-2 Part-2) — the real Version-1
// implementation of `SprintContentProvider`. Every real item comes from
// this platform's existing dataset engine (`getContentForExercise`, via
// the exact real `pickUniqueByContent` dedup-by-text helper
// `loadContent.ts` already established) — the same real cross-tier
// fallback (`pickWithDifficultyFallback`) that engine already has
// honestly under-fills rather than repeats when a pool is genuinely
// exhausted. No AI call anywhere in this file. A future, separate
// sprint's `aiGeneratedSprintContentProvider` implements this exact same
// interface against `origin: 'ai-generated-offline'` records an offline
// job will have written, and swaps in with a one-line change — this
// runtime never needs to know the difference.
export const localSprintContentProvider: SprintContentProvider = {
  getItems(sprint, tier, request) {
    const seed = Date.now()
    const excludeIds = request.excludeIds ?? []
    if (sprint === 'meaning') return getMeaningQuestionItems(tier, request.targetCount, seed, excludeIds)
    return getTextItems(SPRINT_CONTENT_TYPE[sprint], tier, request.targetCount, seed, excludeIds)
  },
}
