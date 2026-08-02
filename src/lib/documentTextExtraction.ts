export type TextExtractionResult = { success: true; text: string } | { success: false; error: string }

// Universal Upload Experience™ (Sprint LW-1C.2) — real, client-side text
// extraction for the 2 formats where it's genuinely achievable without a
// backend: plain text (trivial) and .docx (via mammoth, browser-
// compatible). This text is NOT persisted anywhere yet — `documents` has
// no content-storage column (see constants/documents/index.ts's own
// disclosure) — extraction here proves the file's real content and
// produces text a caller can show/use client-side; a future sprint that
// adds a `documents.content_text` column would call these same functions
// and persist the result, no extraction logic changes needed.
//
// AI Learning Studio™ Sprint ALS-19 — Production Polish™. `mammoth` is
// now dynamically imported inside `extractTextFromDocx` instead of
// statically at the top of this file — a bundle-size audit found the
// Upload Wizard's own route bundle (`/preview/learning-projects/new`)
// was the one outlier in the whole app at 204 kB of own JS (every other
// route's own bundle is under 41 kB), and traced it to mammoth's real
// ~2.5 MB source being shipped to every visitor regardless of whether
// they ever upload a real .docx file. Behavior, signature, and error
// handling are byte-for-byte unchanged — only *when* mammoth's bytes are
// fetched changes, from "on page load" to "the first time a real .docx
// is actually parsed."

export async function extractTextFromTxt(file: File): Promise<TextExtractionResult> {
  try {
    const text = await file.text()
    if (text.trim().length === 0) {
      return { success: false, error: 'This text file appears to be empty.' }
    }
    return { success: true, text }
  } catch {
    return { success: false, error: "We couldn't read this text file." }
  }
}

// Legacy .doc (pre-2007, OLE Compound File binary) is deliberately NOT
// handled here — mammoth only parses .docx. Real .doc text extraction
// needs a heavier parser (or a server-side conversion step) genuinely out
// of this sprint's scope; disclosed in the production handoff, not
// silently faked with an empty/fake result.
export async function extractTextFromDocx(file: File): Promise<TextExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const { default: mammoth } = await import('mammoth')
    const result = await mammoth.extractRawText({ arrayBuffer })
    if (result.value.trim().length === 0) {
      return { success: false, error: "We couldn't find any text in this document." }
    }
    return { success: true, text: result.value }
  } catch {
    return { success: false, error: "We couldn't read this document. It may be corrupted or password-protected." }
  }
}
