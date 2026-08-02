import { extractTextFromTxt, type TextExtractionResult } from '@/lib/documentTextExtraction'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import type { ExtractionResult } from '../errors/ExtractionError'
import { buildUniversalLearningDocument } from '../services/buildUniversalLearningDocument'
import { normalizeContent } from '../services/normalizeContent'
import type { LearningSection } from '../types/UniversalLearningDocument'

export type ExtractTextFn = (file: File) => Promise<TextExtractionResult>

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. Reuses
// UCE-1's own extractTextFromTxt (the exact function
// documentTextExtraction.ts already provides for the wizard's readability
// check) for the raw read — never reimplemented. Plain text has no real
// structure to preserve, so every paragraph becomes its own 'paragraph'
// block in one heading-less section.
export async function extractTXT(file: File, source: UniversalSource, extractFn: ExtractTextFn = extractTextFromTxt): Promise<ExtractionResult> {
  const result = await extractFn(file)
  if (!result.success) {
    return { success: false, error: { code: 'unreadable-document', message: result.error } }
  }

  const normalized = normalizeContent(result.text)
  if (normalized.paragraphs.length === 0) {
    return { success: false, error: { code: 'empty-extraction', message: 'This text file has no readable content.' } }
  }

  const sections: readonly LearningSection[] = [
    { id: 'section-0', heading: null, blocks: normalized.paragraphs.map((text) => ({ type: 'paragraph' as const, text })) },
  ]

  const document = buildUniversalLearningDocument(source, source.name, sections, normalized.paragraphs, normalized.content, null)
  return { success: true, document }
}
