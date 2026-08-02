import type { AIRefinedStrategy } from '../types/ConceptAnalysis'

// Same JSON-extraction approach as semantic-enrichment's
// parseEnrichmentResponse.ts / knowledge-graph's parseBuildsUponResponse.ts
// (small, named, non-behavioral duplication — not shared logic that
// could drift, just the same simple bracket-matching technique applied
// to a different response shape).
function extractJsonCandidate(rawContent: string): string | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(rawContent)
  const searchIn = fenced?.[1] ?? rawContent

  const start = searchIn.indexOf('{')
  const end = searchIn.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null

  return searchIn.slice(start, end + 1)
}

function readNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

// AI Learning Analysis Engine™ (UCE-5). Pure. Never fabricates: a
// response that isn't valid JSON at all (the normal, expected case with
// the default mock provider) returns `undefined` — the caller
// (buildLearningAnalysis.ts) simply omits `aiRefinedStrategy` for that
// concept rather than inventing placeholder text. Every field must be
// a real, non-empty string / a real number in [0,1] or the whole result
// is rejected — a partially-valid response isn't split into "some
// fields kept," since these three notes are meant to read as one
// coherent recommendation, not independently-sourced fragments.
export function parseStrategyResponse(rawContent: string): AIRefinedStrategy | undefined {
  const candidate = extractJsonCandidate(rawContent)
  if (candidate === null) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(candidate)
  } catch {
    return undefined
  }

  if (typeof parsed !== 'object' || parsed === null) return undefined
  const record = parsed as Record<string, unknown>

  const readingStrategyNotes = readNonEmptyString(record.readingStrategyNotes)
  const revisionStrategyNotes = readNonEmptyString(record.revisionStrategyNotes)
  const practiceStrategyNotes = readNonEmptyString(record.practiceStrategyNotes)
  const confidence = record.confidence

  if (!readingStrategyNotes || !revisionStrategyNotes || !practiceStrategyNotes) return undefined
  if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) return undefined

  return { readingStrategyNotes, revisionStrategyNotes, practiceStrategyNotes, confidence }
}
