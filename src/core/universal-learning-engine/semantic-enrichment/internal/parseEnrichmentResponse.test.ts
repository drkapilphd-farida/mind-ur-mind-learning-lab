import { describe, expect, it } from 'vitest'
import { parseEnrichmentResponse } from './parseEnrichmentResponse'

const VALID_JSON = JSON.stringify({
  summary: 'A short summary.',
  concepts: ['force', 'motion'],
  keywords: ['Newton', 'inertia'],
  importantTerms: ['inertia'],
  definitions: [{ term: 'inertia', definition: 'resistance to change in motion' }],
  entities: ['Isaac Newton'],
  learningObjectives: ['Explain the first law of motion'],
  misconceptions: ['Objects need a constant force to keep moving'],
  examples: ['A ball rolling on a frictionless surface'],
  prerequisites: ['basic algebra'],
  dependencies: ['vectors'],
  difficulty: 'intermediate',
  importance: 0.8,
  confidence: 0.9,
})

describe('parseEnrichmentResponse', () => {
  it('parses every real field from a well-formed JSON response', () => {
    const result = parseEnrichmentResponse(VALID_JSON)
    expect(result.enrichment).toEqual({
      semantic: 'A short summary.',
      concepts: ['force', 'motion'],
      keywords: ['Newton', 'inertia'],
      importantTerms: ['inertia'],
      definitions: [{ term: 'inertia', definition: 'resistance to change in motion' }],
      entities: ['Isaac Newton'],
      learningObjectives: ['Explain the first law of motion'],
      misconceptions: ['Objects need a constant force to keep moving'],
      examples: ['A ball rolling on a frictionless surface'],
      prerequisites: ['basic algebra'],
      dependencies: ['vectors'],
      difficulty: 'intermediate',
      importance: 0.8,
    })
    expect(result.confidence).toBe(0.9)
    expect(result.warnings).toEqual([])
  })

  it('extracts JSON wrapped in a markdown code fence', () => {
    const result = parseEnrichmentResponse(`Here is the analysis:\n\`\`\`json\n${VALID_JSON}\n\`\`\`\nHope that helps!`)
    expect(result.enrichment.semantic).toBe('A short summary.')
    expect(result.confidence).toBe(0.9)
  })

  it('returns empty enrichment, null confidence, and a warning for the mock provider\'s natural-language response — a real, expected, non-crashing case', () => {
    const mockResponseText = '[mock Mock Provider reply via Mock Model] Acknowledged: "some prompt"'
    const result = parseEnrichmentResponse(mockResponseText)
    expect(result.enrichment).toEqual({})
    expect(result.confidence).toBeNull()
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('returns empty enrichment for a JSON-like fragment that fails to parse', () => {
    const result = parseEnrichmentResponse('{ "summary": missing_quotes }')
    expect(result.enrichment).toEqual({})
    expect(result.confidence).toBeNull()
    expect(result.warnings).toEqual(['Response contained a JSON-like fragment that failed to parse.'])
  })

  it('returns empty enrichment when a JSON-like opening brace has no matching closing brace', () => {
    const result = parseEnrichmentResponse('{ "summary": "unterminated')
    expect(result.enrichment).toEqual({})
    expect(result.confidence).toBeNull()
    expect(result.warnings).toEqual(['Response contained no JSON object.'])
  })

  it('drops a malformed field instead of defaulting it, while keeping every valid field', () => {
    const result = parseEnrichmentResponse(JSON.stringify({ summary: 'Real summary.', concepts: 'not an array', importance: 0.5 }))
    expect(result.enrichment).toEqual({ semantic: 'Real summary.', importance: 0.5 })
    expect(result.warnings).toContain('"concepts" was not an array — dropped.')
  })

  it('drops non-string entries from an array field but keeps the valid ones', () => {
    const result = parseEnrichmentResponse(JSON.stringify({ keywords: ['real', 42, 'also real', null] }))
    expect(result.enrichment.keywords).toEqual(['real', 'also real'])
    expect(result.warnings).toContain('"keywords" contained non-string entries — those were dropped.')
  })

  it('drops an out-of-range importance value', () => {
    const result = parseEnrichmentResponse(JSON.stringify({ importance: 1.5 }))
    expect(result.enrichment.importance).toBeUndefined()
    expect(result.warnings).toContain('"importance" was not a real number between 0 and 1 — dropped.')
  })

  it('drops an out-of-range confidence value, resulting in a null confidence', () => {
    const result = parseEnrichmentResponse(JSON.stringify({ confidence: -0.1 }))
    expect(result.confidence).toBeNull()
    expect(result.warnings).toContain('"confidence" was not a real number between 0 and 1 — dropped.')
  })

  it('drops an invalid difficulty value', () => {
    const result = parseEnrichmentResponse(JSON.stringify({ difficulty: 'expert' }))
    expect(result.enrichment.difficulty).toBeUndefined()
    expect(result.warnings.some((warning) => warning.includes('difficulty'))).toBe(true)
  })

  it('filters malformed definitions entries while keeping well-formed ones', () => {
    const result = parseEnrichmentResponse(
      JSON.stringify({ definitions: [{ term: 'real', definition: 'a real definition' }, { term: 'missing definition' }, 'not even an object'] }),
    )
    expect(result.enrichment.definitions).toEqual([{ term: 'real', definition: 'a real definition' }])
    expect(result.warnings).toContain('"definitions" contained entries missing a real term/definition string pair — those were dropped.')
  })

  it('omits an empty array rather than keeping an empty list', () => {
    const result = parseEnrichmentResponse(JSON.stringify({ concepts: [] }))
    expect(result.enrichment.concepts).toBeUndefined()
  })

  it('returns empty enrichment when no JSON object is present at all', () => {
    const result = parseEnrichmentResponse('There is no JSON here whatsoever.')
    expect(result.enrichment).toEqual({})
    expect(result.confidence).toBeNull()
    expect(result.warnings).toEqual(['Response contained no JSON object.'])
  })
})
