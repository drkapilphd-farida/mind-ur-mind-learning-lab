import type { AiMentorContext, ApplicationQuestionItem, RecallQuestionItem } from '../types/ChapterIntelligenceBlueprint'

export type ConceptExplanation = { concept: string; explanation: string }

export type ParsedBlueprintGeneration = {
  conceptExplanations: readonly ConceptExplanation[]
  memoryHooks: readonly string[]
  associations: readonly string[]
  simpleMemoryNotes: readonly string[]
  recallQuestions: readonly RecallQuestionItem[]
  applicationQuestions: readonly ApplicationQuestionItem[]
  aiMentorContext: AiMentorContext
  warnings: readonly string[]
}

const EMPTY_MENTOR_CONTEXT: AiMentorContext = { beginnerExplanation: null, simpleExplanation: null, realLifeExample: null, commonDoubts: [] }

// Same disciplined "extract a JSON object from the raw response text"
// approach as every sibling UCE parser (each keeps its own private copy
// — see parseEnrichmentResponse.ts/parseStrategyResponse.ts/
// parseBuildsUponResponse.ts — never shared, per this codebase's own
// established convention).
function extractJsonCandidate(rawContent: string): string | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(rawContent)
  const searchIn = fenced?.[1] ?? rawContent

  const start = searchIn.indexOf('{')
  const end = searchIn.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null

  return searchIn.slice(start, end + 1)
}

function readStringArray(value: unknown, fieldName: string, warnings: string[]): readonly string[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    warnings.push(`"${fieldName}" was not an array — dropped.`)
    return []
  }
  const strings = value.filter((item): item is string => typeof item === 'string')
  if (strings.length !== value.length) warnings.push(`"${fieldName}" contained non-string entries — those were dropped.`)
  return strings
}

function readString(value: unknown, fieldName: string, warnings: string[]): string | null {
  if (value === undefined) return null
  if (typeof value === 'string' && value.length > 0) return value
  warnings.push(`"${fieldName}" was not a real, non-empty string — dropped.`)
  return null
}

function readConceptExplanations(value: unknown, warnings: string[]): readonly ConceptExplanation[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    warnings.push('"conceptExplanations" was not an array — dropped.')
    return []
  }
  const entries = value.filter((item): item is ConceptExplanation => {
    return typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).concept === 'string' && typeof (item as Record<string, unknown>).explanation === 'string'
  })
  if (entries.length !== value.length) warnings.push('"conceptExplanations" contained entries missing a real concept/explanation string pair — those were dropped.')
  return entries
}

function readRecallQuestions(value: unknown, warnings: string[]): readonly RecallQuestionItem[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    warnings.push('"recallQuestions" was not an array — dropped.')
    return []
  }
  const entries = value.filter((item): item is RecallQuestionItem => {
    return typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).question === 'string' && typeof (item as Record<string, unknown>).expectedAnswerHint === 'string'
  })
  if (entries.length !== value.length) warnings.push('"recallQuestions" contained malformed entries — those were dropped.')
  return entries
}

function readApplicationQuestions(value: unknown, warnings: string[]): readonly ApplicationQuestionItem[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    warnings.push('"applicationQuestions" was not an array — dropped.')
    return []
  }
  const entries = value.filter((item): item is ApplicationQuestionItem => {
    return typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).scenario === 'string' && typeof (item as Record<string, unknown>).question === 'string'
  })
  if (entries.length !== value.length) warnings.push('"applicationQuestions" contained malformed entries — those were dropped.')
  return entries
}

function readMentorContext(value: unknown, warnings: string[]): AiMentorContext {
  if (value === undefined || typeof value !== 'object' || value === null) {
    if (value !== undefined) warnings.push('"aiMentorContext" was not an object — dropped.')
    return EMPTY_MENTOR_CONTEXT
  }
  const record = value as Record<string, unknown>
  return {
    beginnerExplanation: readString(record.beginnerExplanation, 'aiMentorContext.beginnerExplanation', warnings),
    simpleExplanation: readString(record.simpleExplanation, 'aiMentorContext.simpleExplanation', warnings),
    realLifeExample: readString(record.realLifeExample, 'aiMentorContext.realLifeExample', warnings),
    commonDoubts: readStringArray(record.commonDoubts, 'aiMentorContext.commonDoubts', warnings),
  }
}

// Reading Intelligence Engine™ Upgrade — Sprint-1. Never fabricates a
// field: anything missing, the wrong type, or malformed is dropped (not
// defaulted to fake content) and recorded in `warnings`. A response that
// isn't valid JSON at all returns every field honestly empty/null, never
// a thrown error — the rest of the Blueprint (built entirely from
// already-real aggregation, unaffected by this call) still returns.
export function parseBlueprintGenerationResponse(rawContent: string): ParsedBlueprintGeneration {
  const warnings: string[] = []
  const candidate = extractJsonCandidate(rawContent)
  if (candidate === null) {
    return { conceptExplanations: [], memoryHooks: [], associations: [], simpleMemoryNotes: [], recallQuestions: [], applicationQuestions: [], aiMentorContext: EMPTY_MENTOR_CONTEXT, warnings: ['Response contained no JSON object.'] }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(candidate)
  } catch {
    return {
      conceptExplanations: [],
      memoryHooks: [],
      associations: [],
      simpleMemoryNotes: [],
      recallQuestions: [],
      applicationQuestions: [],
      aiMentorContext: EMPTY_MENTOR_CONTEXT,
      warnings: ['Response contained a JSON-like fragment that failed to parse.'],
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return {
      conceptExplanations: [],
      memoryHooks: [],
      associations: [],
      simpleMemoryNotes: [],
      recallQuestions: [],
      applicationQuestions: [],
      aiMentorContext: EMPTY_MENTOR_CONTEXT,
      warnings: ['Parsed response was not a JSON object.'],
    }
  }

  const record = parsed as Record<string, unknown>

  return {
    conceptExplanations: readConceptExplanations(record.conceptExplanations, warnings),
    memoryHooks: readStringArray(record.memoryHooks, 'memoryHooks', warnings),
    associations: readStringArray(record.associations, 'associations', warnings),
    simpleMemoryNotes: readStringArray(record.simpleMemoryNotes, 'simpleMemoryNotes', warnings),
    recallQuestions: readRecallQuestions(record.recallQuestions, warnings),
    applicationQuestions: readApplicationQuestions(record.applicationQuestions, warnings),
    aiMentorContext: readMentorContext(record.aiMentorContext, warnings),
    warnings,
  }
}
