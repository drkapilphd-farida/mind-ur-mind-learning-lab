// The `legacy` build, not the root `pdfjs-dist` (browser-only) build —
// the root build references DOMMatrix at module load time and crashes
// immediately outside a real browser (confirmed: it throws
// `ReferenceError: DOMMatrix is not defined` under this repo's Node-based
// Vitest environment). Since this module has no 'use client' boundary of
// its own and could in principle be imported from server code in a
// future sprint, the legacy build (pdfjs-dist's own documented
// recommendation "Please use the `legacy` build in Node.js
// environments") is the safe choice for both environments, not just a
// test-only workaround.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { WorkerMessageHandler } from 'pdfjs-dist/legacy/build/pdf.worker.mjs'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import type { ExtractionResult } from '../errors/ExtractionError'
import { buildUniversalLearningDocument } from '../services/buildUniversalLearningDocument'
import { normalizeContent } from '../services/normalizeContent'
import type { LearningContentBlock, LearningSection } from '../types/UniversalLearningDocument'
import { logger } from '@/lib/logger'

// pdfjs-dist's own `PDFWorker` checks `globalThis.pdfjsWorker.WorkerMessageHandler`
// FIRST, before ever attempting to dynamically `import(workerSrc)` — see the
// second production incident fix below. Populating it via a real, static
// import (which Next.js's bundler resolves and bundles correctly, unlike a
// dynamic runtime-string import) means that broken fallback path is never
// reached at all.
;(globalThis as typeof globalThis & { pdfjsWorker?: { WorkerMessageHandler: unknown } }).pdfjsWorker = { WorkerMessageHandler }

export type PdfPageExtraction = {
  numPages: number
  pageTexts: readonly string[]
  // Sprint UCE-3A (additive) — real per-page image *presence* only,
  // detected via the page's own operator list (which real drawing
  // operations it contains) — never rendered, never read as pixels, no
  // OCR. `false` for a page pdfjs-dist reports as image-free.
  pageHasImage: readonly boolean[]
  metadata: Readonly<Record<string, unknown>>
}

// The operator codes that mean "this page paints a real image" — confirmed
// against pdfjs-dist's own type declarations (src/shared/util.d.ts).
// Mask-only variants are deliberately excluded (they render clipping
// masks, not standalone figures/photos).
const IMAGE_PAINT_OPS: readonly number[] = [pdfjsLib.OPS.paintImageXObject, pdfjsLib.OPS.paintInlineImageXObject, pdfjsLib.OPS.paintImageXObjectRepeat]

async function pageHasRealImage(page: pdfjsLib.PDFPageProxy): Promise<boolean> {
  const operatorList = await page.getOperatorList()
  return operatorList.fnArray.some((op) => IMAGE_PAINT_OPS.includes(op))
}

export type ExtractPdfPagesFn = (file: File) => Promise<PdfPageExtraction>

// Production incident fix — this module has no 'use client' boundary; it
// only ever runs server-side, inside a Server Action (`extractPDF` is
// called from `extractUniversalLearningDocument`, itself called from
// `buildAndSaveDocumentUniversalLearningObject.ts`, the real Node.js
// processing pipeline). A prior version of this file explicitly
// configured `GlobalWorkerOptions.workerSrc` to a browser-bundler-style
// `new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url)`
// — its own comment already disclosed this was "NOT interactively
// verified in a real browser." That override was removed on the
// (correct, but incomplete) theory that pdfjs-dist's own Node.js default
// worker path would resolve correctly instead.
//
// Second production incident fix — confirmed via a real, live, browser-
// driven upload against the real running server (not a standalone
// script): pdfjs-dist's own Node.js default worker path *also* doesn't
// survive Next.js's real server bundling. The fake-worker fallback still
// performs a real `await import(workerSrc)` to load its own worker
// module, and inside the actual bundled output
// (`.next/server/vendor-chunks/`) that import fails outright —
// `Cannot find module '.../vendor-chunks/pdf.worker.mjs' imported from
// '.../vendor-chunks/pdfjs-dist.js'` — a real, logged, reproducible
// error (previously invisible: the catch block below discarded it
// without logging). The real, correct fix for pdf.js in any Node/server
// context — never a browser — is `disableWorker: true`: skip the
// worker-loading machinery entirely and parse on the main thread, which
// is what the "fake worker" fallback was already effectively doing
// anyway once its own broken module import is removed from the picture.

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. Real
// PDF text extraction via pdfjs-dist (Mozilla's PDF.js), added as a new
// dependency this sprint (confirmed with the user — same category of
// decision as adding mammoth for DOCX). Extracts every page's real text
// content, in PDF.js's own real reading order, plus the document's real
// page count and any real title/author present in the file's own
// metadata dictionary — never fabricated.
async function defaultExtractPdfPages(file: File): Promise<PdfPageExtraction> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pageTexts: string[] = []
  const pageHasImage: boolean[] = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    // PDF.js returns text items already in the page's real reading order.
    const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ')
    pageTexts.push(pageText)
    pageHasImage.push(await pageHasRealImage(page))
  }

  const documentMetadata = await pdf.getMetadata().catch(() => null)
  const info = (documentMetadata?.info ?? {}) as Record<string, unknown>
  const title = typeof info.Title === 'string' && info.Title.trim().length > 0 ? info.Title.trim() : null
  const author = typeof info.Author === 'string' && info.Author.trim().length > 0 ? info.Author.trim() : null

  return {
    numPages: pdf.numPages,
    pageTexts,
    pageHasImage,
    metadata: { pdfTitle: title, pdfAuthor: author },
  }
}

// Each page becomes its own section — PDF.js exposes no real
// heading/paragraph structure, only positioned text runs per page, so
// "page" is the honest structural unit here (unlike DOCX, where mammoth
// gives real headings).
export async function extractPDF(file: File, source: UniversalSource, extractFn: ExtractPdfPagesFn = defaultExtractPdfPages): Promise<ExtractionResult> {
  let extraction: PdfPageExtraction
  try {
    extraction = await extractFn(file)
  } catch (error) {
    logger.error('pdf extraction failed', { error: error instanceof Error ? error.message : String(error), sourceId: source.id })
    return { success: false, error: { code: 'corrupted-document', message: "We couldn't read this PDF. It may be corrupted, encrypted, or password-protected." } }
  }

  const sections: LearningSection[] = []
  const allParagraphs: string[] = []
  extraction.pageTexts.forEach((pageText, index) => {
    const normalized = normalizeContent(pageText)
    const hasImage = extraction.pageHasImage[index] ?? false
    if (normalized.paragraphs.length === 0 && !hasImage) return

    const blocks: LearningContentBlock[] = normalized.paragraphs.map((text) => ({ type: 'paragraph', text }))
    // PDF operator-list detection has no alt-text signal (unlike DOCX) —
    // `alt` is honestly always null here, never guessed. A generic,
    // clearly-labeled content type is used since per-image format isn't
    // exposed by this detection method.
    if (hasImage) blocks.push({ type: 'image', contentType: 'application/pdf-image', alt: null })

    sections.push({ id: `page-${index + 1}`, heading: `Page ${index + 1}`, blocks })
    allParagraphs.push(...normalized.paragraphs)
  })

  // A page with a detected image but no text still gets a real section
  // (see the loop above) — genuinely useful structural information, not
  // fabricated. But the document as a whole still needs real text
  // somewhere: this engine doesn't OCR, so an image-only PDF has nothing
  // a Learning Mode could actually read yet.
  if (allParagraphs.length === 0) {
    return { success: false, error: { code: 'empty-extraction', message: 'This PDF has no extractable text — it may be a scanned image with no text layer.' } }
  }

  const content = allParagraphs.join('\n\n')
  const title = (extraction.metadata.pdfTitle as string | null) ?? source.name

  const document = buildUniversalLearningDocument(source, title, sections, allParagraphs, content, extraction.numPages, { extraMetadata: extraction.metadata })
  return { success: true, document }
}
