import type { Document } from '@/types/documents'

export type DocumentContentAnalysis = {
  formatLabel: string
  estimatedReadingMinutes: number
}

const FORMAT_LABELS: Readonly<Record<string, string>> = {
  'application/pdf': 'PDF document',
  'text/plain': 'text document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word document',
  'application/msword': 'Word document',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/heic': 'image',
  'image/heif': 'image',
}

// AI Learning Studio™ Sprint ALS-3's "Content Analysis" stage. Honest,
// disclosed estimate from real metadata only — no file content is stored
// anywhere yet (see constants/documents/index.ts's own disclosure), so
// this is deliberately a size-derived approximation, not a claim of
// having read the material. ~6 bytes/word and ~200 words/minute are
// standard, disclosed rules of thumb, not fabricated per-document facts.
export function analyzeDocumentContent(document: Pick<Document, 'mimeType' | 'sizeBytes'>): DocumentContentAnalysis {
  const estimatedWordCount = Math.max(1, Math.round((document.sizeBytes ?? 0) / 6))
  const estimatedReadingMinutes = Math.max(1, Math.round(estimatedWordCount / 200))
  const formatLabel = (document.mimeType !== null && FORMAT_LABELS[document.mimeType]) || 'document'

  return { formatLabel, estimatedReadingMinutes }
}
