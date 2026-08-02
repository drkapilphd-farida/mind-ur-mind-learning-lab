import { describe, expect, it } from 'vitest'
import { isSupportedPayloadVersion } from './isSupportedPayloadVersion'
import { validateContextPayload } from './validateContextPayload'
import { makeContextPayload, makeContextPayloadReference, makeContextPayloadSection } from '../testFixtures'

describe('isSupportedPayloadVersion', () => {
  it('returns true for the current version', () => {
    expect(isSupportedPayloadVersion(1)).toBe(true)
  })

  it('returns false for an unrecognized version', () => {
    expect(isSupportedPayloadVersion(99)).toBe(false)
  })
})

describe('validateContextPayload', () => {
  it('reports valid: true for a well-formed payload', () => {
    expect(validateContextPayload(makeContextPayload())).toEqual({ valid: true, issues: [] })
  })

  it('detects an empty-payload when there are no references', () => {
    const payload = makeContextPayload({ sections: [] })
    const result = validateContextPayload(payload)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'empty-payload')).toBe(true)
  })

  it('detects a duplicate-reference across sections', () => {
    const payload = makeContextPayload({
      sections: [
        makeContextPayloadSection({ id: 's1', priority: 'high', references: [makeContextPayloadReference({ memoryId: 'a', priority: 'high' })] }),
        makeContextPayloadSection({ id: 's2', priority: 'low', references: [makeContextPayloadReference({ memoryId: 'a', priority: 'low' })] }),
      ],
    })
    const result = validateContextPayload(payload)
    expect(result.issues.some((issue) => issue.type === 'duplicate-reference')).toBe(true)
  })

  it('detects an invalid-mapping when a reference priority does not match its section priority', () => {
    const payload = makeContextPayload({
      sections: [makeContextPayloadSection({ priority: 'high', references: [makeContextPayloadReference({ priority: 'low' })] })],
    })
    const result = validateContextPayload(payload)
    expect(result.issues.some((issue) => issue.type === 'invalid-mapping')).toBe(true)
  })

  it('detects an ordering-violation when sections are not strictly descending priority', () => {
    const payload = makeContextPayload({
      sections: [
        makeContextPayloadSection({ id: 's1', priority: 'low', references: [makeContextPayloadReference({ memoryId: 'a', priority: 'low' })] }),
        makeContextPayloadSection({ id: 's2', priority: 'high', references: [makeContextPayloadReference({ memoryId: 'b', priority: 'high' })] }),
      ],
    })
    const result = validateContextPayload(payload)
    expect(result.issues.some((issue) => issue.type === 'ordering-violation')).toBe(true)
  })

  it('detects incomplete-metadata for an empty sourcePackageId', () => {
    const payload = makeContextPayload({
      metadata: { sessionId: null, sourcePackageId: '', sourcePackageVersion: 1, generatedAt: 'x', payloadVersion: 1 },
    })
    const result = validateContextPayload(payload)
    expect(result.issues.some((issue) => issue.type === 'incomplete-metadata')).toBe(true)
  })

  it('detects incomplete-metadata for an empty generatedAt', () => {
    const payload = makeContextPayload({
      metadata: { sessionId: null, sourcePackageId: 'x', sourcePackageVersion: 1, generatedAt: '', payloadVersion: 1 },
    })
    const result = validateContextPayload(payload)
    expect(result.issues.some((issue) => issue.type === 'incomplete-metadata')).toBe(true)
  })

  it('detects a version-incompatible payload', () => {
    const payload = makeContextPayload({
      metadata: { sessionId: null, sourcePackageId: 'x', sourcePackageVersion: 1, generatedAt: 'x', payloadVersion: 99 },
    })
    const result = validateContextPayload(payload)
    expect(result.issues.some((issue) => issue.type === 'version-incompatible')).toBe(true)
  })
})
