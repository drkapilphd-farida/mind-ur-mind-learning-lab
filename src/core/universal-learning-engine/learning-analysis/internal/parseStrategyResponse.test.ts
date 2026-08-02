import { describe, expect, it } from 'vitest'
import { parseStrategyResponse } from './parseStrategyResponse'

const VALID = { readingStrategyNotes: 'Read slowly.', revisionStrategyNotes: 'Review weekly.', practiceStrategyNotes: 'Solve problems.', confidence: 0.8 }

describe('parseStrategyResponse', () => {
  it('parses a valid response', () => {
    expect(parseStrategyResponse(JSON.stringify(VALID))).toEqual(VALID)
  })

  it('extracts JSON wrapped in a markdown code fence', () => {
    expect(parseStrategyResponse(`\`\`\`json\n${JSON.stringify(VALID)}\n\`\`\``)).toEqual(VALID)
  })

  it('returns undefined for the mock provider\'s natural-language response, not a crash', () => {
    expect(parseStrategyResponse('[mock Mock Provider reply via Mock Model] Acknowledged: "..."')).toBeUndefined()
  })

  it('returns undefined for a JSON-like fragment that fails to parse', () => {
    expect(parseStrategyResponse('{ "readingStrategyNotes": missing_quotes }')).toBeUndefined()
  })

  it('rejects the whole result when one field is missing, rather than returning a partial object', () => {
    const { revisionStrategyNotes: _omitted, ...partial } = VALID
    expect(parseStrategyResponse(JSON.stringify(partial))).toBeUndefined()
  })

  it('rejects an empty-string note', () => {
    expect(parseStrategyResponse(JSON.stringify({ ...VALID, readingStrategyNotes: '' }))).toBeUndefined()
  })

  it('rejects an out-of-range confidence', () => {
    expect(parseStrategyResponse(JSON.stringify({ ...VALID, confidence: 1.5 }))).toBeUndefined()
  })

  it('rejects a missing confidence', () => {
    const { confidence: _omitted, ...partial } = VALID
    expect(parseStrategyResponse(JSON.stringify(partial))).toBeUndefined()
  })
})
