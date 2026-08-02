import type { ChunkDefinition, ChunkDifficulty, ChunkEnrichment } from '@/core/universal-learning-engine/learning-chunk'

export type ParsedEnrichment = {
  enrichment: Partial<ChunkEnrichment>
  confidence: number | null
  warnings: readonly string[]
}

const DIFFICULTY_VALUES: readonly ChunkDifficulty[] = ['beginner', 'intermediate', 'advanced']

function extractJsonCandidate(rawContent: string): string | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(rawContent)
  const searchIn = fenced?.[1] ?? rawContent

  const start = searchIn.indexOf('{')
  const end = searchIn.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null

  return searchIn.slice(start, end + 1)
}

function readStringArray(value: unknown, fieldName: string, warnings: string[]): readonly string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    warnings.push(`"${fieldName}" was not an array — dropped.`)
    return undefined
  }

  const strings = value.filter((item): item is string => typeof item === 'string')
  if (strings.length !== value.length) warnings.push(`"${fieldName}" contained non-string entries — those were dropped.`)
  return strings.length > 0 ? strings : undefined
}

function readDefinitions(value: unknown, warnings: string[]): readonly ChunkDefinition[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    warnings.push('"definitions" was not an array — dropped.')
    return undefined
  }

  const definitions = value.filter((item): item is ChunkDefinition => {
    return typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).term === 'string' && typeof (item as Record<string, unknown>).definition === 'string'
  })
  if (definitions.length !== value.length) warnings.push('"definitions" contained entries missing a real term/definition string pair — those were dropped.')
  return definitions.length > 0 ? definitions : undefined
}

function readUnitInterval(value: unknown, fieldName: string, warnings: string[]): number | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    warnings.push(`"${fieldName}" was not a real number between 0 and 1 — dropped.`)
    return undefined
  }
  return value
}

function readDifficulty(value: unknown, warnings: string[]): ChunkDifficulty | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'string' && (DIFFICULTY_VALUES as readonly string[]).includes(value)) return value as ChunkDifficulty
  warnings.push(`"difficulty" was not one of ${DIFFICULTY_VALUES.join('/')} — dropped.`)
  return undefined
}

function readSummary(value: unknown, warnings: string[]): string | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'string' && value.length > 0) return value
  warnings.push('"summary" was not a real, non-empty string — dropped.')
  return undefined
}

// Semantic Enrichment Engine™ — UCE-3B. Pure. Never fabricates a field:
// anything missing, the wrong type, or out of range is dropped (not
// defaulted) and recorded in `warnings`. A response that isn't valid
// JSON at all — the normal, expected case with the default mock
// provider (confirmed by reading MockProviderAdapter.ts directly: its
// text is natural-language prose, not JSON) — returns an empty
// `enrichment` and a `warnings` entry, never a thrown error. A genuine
// AI response was received; it just didn't contain usable structured
// data this time.
export function parseEnrichmentResponse(rawContent: string): ParsedEnrichment {
  const warnings: string[] = []
  const candidate = extractJsonCandidate(rawContent)
  if (candidate === null) {
    return { enrichment: {}, confidence: null, warnings: ['Response contained no JSON object.'] }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(candidate)
  } catch {
    return { enrichment: {}, confidence: null, warnings: ['Response contained a JSON-like fragment that failed to parse.'] }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { enrichment: {}, confidence: null, warnings: ['Parsed response was not a JSON object.'] }
  }

  const record = parsed as Record<string, unknown>

  const enrichment: Partial<ChunkEnrichment> = {}
  const semantic = readSummary(record.summary, warnings)
  if (semantic !== undefined) enrichment.semantic = semantic

  const concepts = readStringArray(record.concepts, 'concepts', warnings)
  if (concepts !== undefined) enrichment.concepts = concepts

  const keywords = readStringArray(record.keywords, 'keywords', warnings)
  if (keywords !== undefined) enrichment.keywords = keywords

  const importantTerms = readStringArray(record.importantTerms, 'importantTerms', warnings)
  if (importantTerms !== undefined) enrichment.importantTerms = importantTerms

  const definitions = readDefinitions(record.definitions, warnings)
  if (definitions !== undefined) enrichment.definitions = definitions

  const entities = readStringArray(record.entities, 'entities', warnings)
  if (entities !== undefined) enrichment.entities = entities

  const learningObjectives = readStringArray(record.learningObjectives, 'learningObjectives', warnings)
  if (learningObjectives !== undefined) enrichment.learningObjectives = learningObjectives

  const misconceptions = readStringArray(record.misconceptions, 'misconceptions', warnings)
  if (misconceptions !== undefined) enrichment.misconceptions = misconceptions

  const examples = readStringArray(record.examples, 'examples', warnings)
  if (examples !== undefined) enrichment.examples = examples

  const prerequisites = readStringArray(record.prerequisites, 'prerequisites', warnings)
  if (prerequisites !== undefined) enrichment.prerequisites = prerequisites

  const dependencies = readStringArray(record.dependencies, 'dependencies', warnings)
  if (dependencies !== undefined) enrichment.dependencies = dependencies

  const difficulty = readDifficulty(record.difficulty, warnings)
  if (difficulty !== undefined) enrichment.difficulty = difficulty

  const importance = readUnitInterval(record.importance, 'importance', warnings)
  if (importance !== undefined) enrichment.importance = importance

  const confidence = readUnitInterval(record.confidence, 'confidence', warnings) ?? null

  return { enrichment, confidence, warnings }
}
