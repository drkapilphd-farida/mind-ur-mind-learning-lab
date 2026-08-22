import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import type { ExtractionResult } from './errors/ExtractionError'
import { extractDOCX } from './extractors/extractDOCX'
import { extractImage, extractImages } from './extractors/extractImage'
import { extractPDF } from './extractors/extractPDF'
import { extractPlaceholder } from './extractors/extractPlaceholder'
import { extractTXT } from './extractors/extractTXT'

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. The one
// public entry point — dispatches on source.sourceType (from UCE-1's
// UniversalSource, reused, never re-detected here) to the real extractor
// for that format, or an honest placeholder for anything not yet
// supported. Every future Learning Mode calls this, never a raw
// PDF/DOCX/TXT reader directly.
export async function extractUniversalLearningDocument(file: File, source: UniversalSource): Promise<ExtractionResult> {
  try {
    switch (source.sourceType) {
      case 'pdf':
        return await extractPDF(file, source)
      case 'docx':
        return await extractDOCX(file, source)
      case 'txt':
        return await extractTXT(file, source)
      case 'image':
        return await extractImage(file, source)
      case 'doc':
        // Legacy .doc (pre-2007, OLE Compound File) — no parser exists
        // for it anywhere in this codebase (mammoth only parses .docx,
        // same disclosed gap as the wizard's own readability check).
        // Honestly unsupported, not silently faked.
        return { success: false, error: { code: 'unsupported-encoding', message: 'Legacy .doc extraction is not yet supported — only .docx. Please re-save as .docx and upload again.' } }
      default:
        return await extractPlaceholder(source.sourceType)
    }
  } catch {
    return { success: false, error: { code: 'extraction-failed', message: 'Something went wrong while extracting this document. Please try again.' } }
  }
}

// Multi-Image / Batch Photo Upload™ (Phase 3) — additive sibling entry
// point to extractUniversalLearningDocument above, never a replacement
// for it: an ordered set of photos (student-defined page order,
// preserved exactly) becomes ONE combined document. Only ever called for
// a genuine multi-page batch (runQuickIntelligence.ts's own
// `document.storagePaths` check) — a single image keeps going through
// the unmodified single-file dispatcher above, exactly as before this
// sprint.
export async function extractUniversalLearningDocumentFromImages(files: readonly File[], source: UniversalSource): Promise<ExtractionResult> {
  try {
    return await extractImages(files, source)
  } catch {
    return { success: false, error: { code: 'extraction-failed', message: 'Something went wrong while extracting these pages. Please try again.' } }
  }
}
