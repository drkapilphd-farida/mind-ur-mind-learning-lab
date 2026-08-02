import { extractTextFromDocx, extractTextFromTxt, type TextExtractionResult } from '@/lib/documentTextExtraction'
import { validateDocumentFile } from '@/lib/validateDocumentFile'
import { buildUniversalSource, extensionOf } from '../services/buildUniversalSource'
import type { UniversalSource, UniversalSourceType } from '../types/UniversalSource'
import type { ParseResult, UniversalUploadParser, UniversalValidationResult } from '../types/UniversalUploadParser'
import { detectSourceType } from '../validators/detectSourceType'
import { validateUniversalUpload, type ValidateDocumentFileFn } from '../validators/validateUniversalUpload'

export type ExtractTextFn = (file: File) => Promise<TextExtractionResult>

export type UniversalUploadParserDependencies = {
  validateFn: ValidateDocumentFileFn
  extractDocxFn: ExtractTextFn
  extractTxtFn: ExtractTextFn
}

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const TXT_MIME_TYPE = 'text/plain'

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-1.
// createUniversalUploadParser() is a small dependency-injection factory
// (per the brief's own quality bullet) — every real dependency defaults
// to the actual, existing, already-approved function
// (validateDocumentFile, extractTextFromDocx/Txt), never reimplemented
// here. Tests inject fakes through this factory rather than re-testing
// those functions' own already-covered logic. `universalUploadParser`
// below is the real, default-configured singleton every call site uses.
export function createUniversalUploadParser(overrides: Partial<UniversalUploadParserDependencies> = {}): UniversalUploadParser {
  const deps: UniversalUploadParserDependencies = {
    validateFn: overrides.validateFn ?? validateDocumentFile,
    extractDocxFn: overrides.extractDocxFn ?? extractTextFromDocx,
    extractTxtFn: overrides.extractTxtFn ?? extractTextFromTxt,
  }

  function detectType(file: File): UniversalSourceType {
    return detectSourceType(file)
  }

  async function validate(file: File): Promise<UniversalValidationResult> {
    return validateUniversalUpload(file, deps.validateFn)
  }

  // Non-text structural metadata only — per "the parser should produce
  // UniversalSource™ ONLY. Not extracted text," nothing here ever carries
  // real document content.
  async function extractMetadata(file: File): Promise<Readonly<Record<string, unknown>>> {
    return {
      extension: extensionOf(file.name),
      declaredMimeType: file.type,
      sizeBytes: file.size,
    }
  }

  async function prepare(file: File, sourceType: UniversalSourceType, metadata: Readonly<Record<string, unknown>>): Promise<UniversalSource> {
    return buildUniversalSource(file, sourceType, metadata)
  }

  async function parse(file: File): Promise<ParseResult> {
    const sourceType = detectType(file)

    const validation = await validate(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // The same real-content readability check
    // NewLearningProjectWizard.tsx already performs today — same 2
    // formats, same condition, same underlying functions, just reached
    // through this engine now instead of called directly.
    if (file.type === DOCX_MIME_TYPE) {
      const extraction = await deps.extractDocxFn(file)
      if (!extraction.success) {
        return { success: false, error: { code: 'unreadable-file', message: extraction.error } }
      }
    } else if (file.type === TXT_MIME_TYPE) {
      const extraction = await deps.extractTxtFn(file)
      if (!extraction.success) {
        return { success: false, error: { code: 'unreadable-file', message: extraction.error } }
      }
    }

    const metadata = await extractMetadata(file)
    const source = await prepare(file, sourceType, metadata)
    return { success: true, source }
  }

  return { detectType, validate, extractMetadata, prepare, parse }
}

export const universalUploadParser: UniversalUploadParser = createUniversalUploadParser()
