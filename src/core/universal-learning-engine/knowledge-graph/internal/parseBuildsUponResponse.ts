export type ParsedBuildsUponRelationship = {
  concept: string
  buildsOnConcept: string
  confidence: number
}

// Same JSON-extraction approach as semantic-enrichment's
// parseEnrichmentResponse.ts (small, named, non-behavioral duplication —
// not shared logic that could drift, just the same simple bracket-
// matching technique applied to a different response shape).
function extractJsonCandidate(rawContent: string): string | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(rawContent)
  const searchIn = fenced?.[1] ?? rawContent

  const start = searchIn.indexOf('{')
  const end = searchIn.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null

  return searchIn.slice(start, end + 1)
}

function normalize(label: string): string {
  return label.trim().toLowerCase()
}

// Learning Knowledge Graph™ (UCE-4). Pure. Never fabricates a
// relationship: a response that isn't valid JSON at all (the normal,
// expected case with the default mock provider — see semantic-
// enrichment's own precedent) returns an empty array, not a thrown
// error. Every entry is validated against the REAL `chunkConcepts`/
// `alreadyIntroducedConcepts` lists this specific prompt offered the
// model — an entry naming a concept that wasn't actually offered (a
// hallucinated concept name) is dropped, never accepted.
export function parseBuildsUponResponse(rawContent: string, chunkConcepts: readonly string[], alreadyIntroducedConcepts: readonly string[]): readonly ParsedBuildsUponRelationship[] {
  const candidate = extractJsonCandidate(rawContent)
  if (candidate === null) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(candidate)
  } catch {
    return []
  }

  if (typeof parsed !== 'object' || parsed === null) return []
  const relationships = (parsed as Record<string, unknown>).relationships
  if (!Array.isArray(relationships)) return []

  const validConceptLabels = new Set(chunkConcepts.map(normalize))
  const validPriorConceptLabels = new Set(alreadyIntroducedConcepts.map(normalize))

  const results: ParsedBuildsUponRelationship[] = []
  for (const entry of relationships) {
    if (typeof entry !== 'object' || entry === null) continue
    const record = entry as Record<string, unknown>
    const concept = record.concept
    const buildsOnConcept = record.buildsOnConcept
    const confidence = record.confidence

    if (typeof concept !== 'string' || !validConceptLabels.has(normalize(concept))) continue
    if (typeof buildsOnConcept !== 'string' || !validPriorConceptLabels.has(normalize(buildsOnConcept))) continue
    if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) continue

    results.push({ concept, buildsOnConcept, confidence })
  }

  return results
}
