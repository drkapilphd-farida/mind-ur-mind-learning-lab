import { computeReadability } from './computeReadability'
import { detectLanguage } from './detectLanguage'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import type { LearningSection, UniversalLearningDocument } from '../types/UniversalLearningDocument'

export type BuildUniversalLearningDocumentOptions = {
  idFactory?: () => string
  extraMetadata?: Readonly<Record<string, unknown>>
}

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. Pure
// given its injected id factory (defaults to crypto.randomUUID() for
// production use, overridable for tests — same DI pattern as UCE-1's
// buildUniversalSource). Every extractor calls this as its final
// assembly step, so language detection / readability metrics are
// computed exactly once, in exactly one place, never duplicated per
// format.
export function buildUniversalLearningDocument(
  source: UniversalSource,
  title: string,
  sections: readonly LearningSection[],
  paragraphs: readonly string[],
  content: string,
  pageCount: number | null,
  options: BuildUniversalLearningDocumentOptions = {},
): UniversalLearningDocument {
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const readability = computeReadability(paragraphs)

  return {
    id: idFactory(),
    title,
    language: detectLanguage(content),
    metadata: {
      characterCount: readability.characterCount,
      paragraphCount: readability.paragraphCount,
      estimatedReadingMinutes: readability.estimatedReadingMinutes,
      ...options.extraMetadata,
    },
    content,
    sections,
    paragraphs,
    wordCount: readability.wordCount,
    pageCount,
    source,
  }
}
