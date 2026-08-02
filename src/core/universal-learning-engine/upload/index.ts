// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-1. The one
// import path every consumer (today: the Upload Wizard; later: every
// future Learning Mode) uses — never import from parsers/validators/
// services directly.

export { createUniversalUploadParser, universalUploadParser } from './parsers/universalUploadParser'
export type { UniversalUploadParserDependencies, ExtractTextFn } from './parsers/universalUploadParser'
export type { UniversalSource, UniversalSourceType, UniversalUploadStatus } from './types/UniversalSource'
export type { UniversalUploadParser, UniversalValidationResult, ParseResult } from './types/UniversalUploadParser'
export type { UniversalUploadError, UniversalUploadErrorCode } from './errors/UniversalUploadError'
