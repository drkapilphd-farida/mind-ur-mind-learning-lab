import type { ContentExtractor } from '../contracts'
import type { Document, ExtractedContent, ExtractedContentSection } from '../types'

// A generic four-part reading structure — not derived from the
// document's real bytes (no PDF parsing this sprint), the same honesty
// stance Sprint 1/2's mock Learning Blueprint™ generator takes for its
// fixed chapter titles. Independent of that generator's own template
// pool (a different, locked bounded context) rather than importing
// from it.
const SECTION_TEMPLATES = [
  { title: 'Introduction', text: 'An opening overview of the material, setting up the ideas that follow.' },
  { title: 'Core Content', text: 'The primary ideas and information this document conveys.' },
  { title: 'Supporting Details', text: 'Additional explanation, examples, and context around the core content.' },
  { title: 'Conclusion', text: 'A closing summary tying the material together.' },
] as const

// Implements ContentExtractor for PDF documents. Mock today — no real
// PDF parsing or OCR, per this sprint's explicit scope — but genuinely
// complete: it never returns an empty ExtractedContent, and the
// document's own real title is woven into `rawText` rather than
// invented, so downstream stages have something real to anchor to. A
// future real PDF extractor implements the same ContentExtractor
// interface; nothing that depends on this class needs to change.
export class MockPdfContentExtractor implements ContentExtractor {
  async extract(document: Document): Promise<ExtractedContent> {
    const sections: readonly ExtractedContentSection[] = SECTION_TEMPLATES.map((template, index) => ({
      id: `section-${index}`,
      title: template.title,
      text: template.text,
    }))

    const rawText = [`${document.title}.`, ...sections.map((section) => section.text)].join(' ')

    return { documentId: document.id, rawText, sections }
  }
}
