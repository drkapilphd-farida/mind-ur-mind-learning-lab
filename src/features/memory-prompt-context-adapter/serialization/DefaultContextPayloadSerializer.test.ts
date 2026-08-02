import { describe, expect, it } from 'vitest'
import { createContextPayloadSerializer } from './DefaultContextPayloadSerializer'
import { InvalidContextPayloadError } from './InvalidContextPayloadError'
import { isValidContextPayloadShape } from './isValidContextPayloadShape'
import { makeContextPayload } from '../testFixtures'

describe('DefaultContextPayloadSerializer', () => {
  it('serialize() then deserialize() round-trips to an equal payload', () => {
    const serializer = createContextPayloadSerializer()
    const payload = makeContextPayload()
    const serialized = serializer.serialize(payload)
    expect(serializer.deserialize(serialized)).toEqual(payload)
  })

  it('serialize() stamps the current version', () => {
    const serializer = createContextPayloadSerializer()
    expect(serializer.serialize(makeContextPayload()).version).toBe(1)
  })

  it('validateIntegrity() returns true for a well-formed serialized payload', () => {
    const serializer = createContextPayloadSerializer()
    expect(serializer.validateIntegrity(serializer.serialize(makeContextPayload()))).toBe(true)
  })

  it('validateIntegrity() returns false for an unsupported version', () => {
    const serializer = createContextPayloadSerializer()
    const serialized = serializer.serialize(makeContextPayload())
    expect(serializer.validateIntegrity({ ...serialized, version: 99 })).toBe(false)
  })

  it('validateIntegrity() returns false for a structurally invalid payload', () => {
    const serializer = createContextPayloadSerializer()
    expect(serializer.validateIntegrity({ version: 1, payload: { id: 'x' } })).toBe(false)
  })

  it('deserialize() throws InvalidContextPayloadError for an unsupported version', () => {
    const serializer = createContextPayloadSerializer()
    const serialized = serializer.serialize(makeContextPayload())
    expect(() => serializer.deserialize({ ...serialized, version: 99 })).toThrow(InvalidContextPayloadError)
  })

  it('deserialize() throws InvalidContextPayloadError for a structurally invalid payload', () => {
    const serializer = createContextPayloadSerializer()
    expect(() => serializer.deserialize({ version: 1, payload: {} })).toThrow(InvalidContextPayloadError)
  })
})

describe('isValidContextPayloadShape', () => {
  it('returns true for a valid shape', () => {
    const serializer = createContextPayloadSerializer()
    expect(isValidContextPayloadShape(serializer.serialize(makeContextPayload()).payload)).toBe(true)
  })

  it('returns false when id is missing', () => {
    expect(isValidContextPayloadShape({ sections: [], metadata: {} })).toBe(false)
  })

  it('returns false when sections is not an array', () => {
    expect(isValidContextPayloadShape({ id: 'x', sections: 'not-an-array', metadata: {} })).toBe(false)
  })

  it('returns false when a section has an invalid priority', () => {
    expect(
      isValidContextPayloadShape({
        id: 'x',
        sections: [{ id: 's1', priority: 'not-a-priority', references: [] }],
        metadata: { sessionId: null, sourcePackageId: 'p', sourcePackageVersion: 1, generatedAt: 'x', payloadVersion: 1 },
      }),
    ).toBe(false)
  })

  it('returns false when a section entry is null', () => {
    expect(
      isValidContextPayloadShape({
        id: 'x',
        sections: [null],
        metadata: { sessionId: null, sourcePackageId: 'p', sourcePackageVersion: 1, generatedAt: 'x', payloadVersion: 1 },
      }),
    ).toBe(false)
  })

  it('returns false when a reference entry is null', () => {
    expect(
      isValidContextPayloadShape({
        id: 'x',
        sections: [{ id: 's1', priority: 'high', references: [null] }],
        metadata: { sessionId: null, sourcePackageId: 'p', sourcePackageVersion: 1, generatedAt: 'x', payloadVersion: 1 },
      }),
    ).toBe(false)
  })

  it('returns false when a reference is missing a field', () => {
    expect(
      isValidContextPayloadShape({
        id: 'x',
        sections: [{ id: 's1', priority: 'high', references: [{ memoryId: 'a', priority: 'high' }] }],
        metadata: { sessionId: null, sourcePackageId: 'p', sourcePackageVersion: 1, generatedAt: 'x', payloadVersion: 1 },
      }),
    ).toBe(false)
  })

  it('returns false when metadata is missing', () => {
    expect(isValidContextPayloadShape({ id: 'x', sections: [] })).toBe(false)
  })

  it('returns false when metadata.sessionId is neither a string nor null', () => {
    expect(
      isValidContextPayloadShape({
        id: 'x',
        sections: [],
        metadata: { sessionId: 42, sourcePackageId: 'p', sourcePackageVersion: 1, generatedAt: 'x', payloadVersion: 1 },
      }),
    ).toBe(false)
  })

  it('accepts a null sessionId', () => {
    expect(
      isValidContextPayloadShape({
        id: 'x',
        sections: [],
        metadata: { sessionId: null, sourcePackageId: 'p', sourcePackageVersion: 1, generatedAt: 'x', payloadVersion: 1 },
      }),
    ).toBe(true)
  })
})
