import type { UniversalSource } from '@/core/universal-learning-engine/upload'

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2.
// LearningContentBlock™ — the smallest structural unit every extractor
// produces. PDF.js exposes no real heading/list/table structure (only
// positioned text runs per page), so extractPDF.ts only ever emits
// 'paragraph'/'image' blocks; extractDOCX.ts (via mammoth's real HTML
// output) can emit all five kinds; extractTXT.ts only ever emits
// 'paragraph' blocks (plain text has no structure to preserve).
//
// Sprint UCE-3A (additive) — 'image' records only a real embedded
// image's genuine presence and content-type, never its pixel content:
// no OCR, no description, no vision-model call. `alt` is real text when
// the source format provides it (DOCX can); PDF detection (an operator-
// list scan, not rendering) has no alt-text signal, so PDF-sourced image
// blocks always carry `alt: null` — honest, never guessed.
export type LearningContentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: readonly string[] }
  | { type: 'table'; rows: readonly (readonly string[])[] }
  | { type: 'image'; contentType: string; alt: string | null }

// A section groups blocks under one heading (or `null` for content before
// the first heading / for formats with no heading concept, like TXT).
export type LearningSection = {
  id: string
  heading: string | null
  blocks: readonly LearningContentBlock[]
}

// Universal Learning Document™ — the ONE structure every future Learning
// Mode consumes. Never a raw PDF/DOCX/TXT again.
export type UniversalLearningDocument = {
  id: string
  title: string
  // No real language-detection library exists yet — always null this
  // sprint ("if detection is uncertain, language = null. Never guess," per
  // the brief; see services/detectLanguage.ts).
  language: string | null
  // Readability stats (characterCount, paragraphCount,
  // estimatedReadingMinutes) plus format-specific facts (e.g. a PDF's
  // real document-metadata title/author, when present) — metadata only,
  // per the brief. Never extracted content duplicated here.
  metadata: Readonly<Record<string, unknown>>
  content: string
  sections: readonly LearningSection[]
  paragraphs: readonly string[]
  wordCount: number
  // Real page count for PDF (pdfjs-dist's numPages). `null` for DOCX/TXT —
  // neither format has a real, renderer-independent page concept; an
  // honest omission, never a fabricated single-page count.
  pageCount: number | null
  // UCE-1's own object, embedded by reference — never re-derived or
  // re-validated here.
  source: UniversalSource
}
