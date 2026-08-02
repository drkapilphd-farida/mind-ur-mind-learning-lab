export type DocumentStructureAnalysis = {
  structureLabel: string
}

// AI Learning Studio™ Sprint ALS-3's "Structure Detection" stage. Honest,
// disclosed: with no stored file content, structure is inferred only
// from format, not by parsing real headings/sections. A real Universal
// Content Engine™ (future sprint) replaces this with genuine structural
// parsing; this stays truthful about that limit rather than pretending
// to have found chapters that were never read.
export function detectDocumentStructure(mimeType: string | null): DocumentStructureAnalysis {
  if (mimeType !== null && mimeType.startsWith('image/')) {
    return { structureLabel: 'A single visual page' }
  }
  if (mimeType === 'application/pdf' || mimeType === 'application/msword' || (mimeType !== null && mimeType.includes('wordprocessingml'))) {
    return { structureLabel: 'A structured, multi-section document' }
  }
  return { structureLabel: 'A continuous block of text' }
}
