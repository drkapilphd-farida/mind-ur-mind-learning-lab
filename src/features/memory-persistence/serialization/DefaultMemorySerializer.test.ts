import { describe, expect, it } from 'vitest'
import { createMemorySerializer } from './DefaultMemorySerializer'
import { InvalidMemoryPayloadError } from './InvalidMemoryPayloadError'
import { makeMemory } from '../testFixtures'
import type { SerializedMemory } from '../contracts'

describe('DefaultMemorySerializer', () => {
  const serializer = createMemorySerializer()

  it('serialize() produces version 1 with every field in the payload', () => {
    const memory = makeMemory({ pinned: true })
    const serialized = serializer.serialize(memory)

    expect(serialized.version).toBe(1)
    expect(serialized.payload).toMatchObject({ id: memory.id, type: memory.type, pinned: true })
  })

  it('deserialize(serialize(memory)) round-trips to an equal Memory', () => {
    const memory = makeMemory({ metadata: { learnerId: 'learner-1', source: 'test', tags: ['a', 'b'] } })
    const roundTripped = serializer.deserialize(serializer.serialize(memory))
    expect(roundTripped).toEqual(memory)
  })

  it('validate() accepts a well-formed version-1 payload', () => {
    expect(serializer.validate(serializer.serialize(makeMemory()))).toBe(true)
  })

  it('validate() rejects an unknown version', () => {
    const serialized: SerializedMemory = { version: 99, payload: {} }
    expect(serializer.validate(serialized)).toBe(false)
  })

  it('validate() rejects a payload missing a required field', () => {
    const serialized = serializer.serialize(makeMemory())
    const { id: _omitted, ...incompletePayload } = serialized.payload
    expect(serializer.validate({ version: 1, payload: incompletePayload })).toBe(false)
  })

  it('validate() rejects a payload with a wrong-typed field', () => {
    const serialized = serializer.serialize(makeMemory())
    expect(serializer.validate({ version: 1, payload: { ...serialized.payload, pinned: 'yes' } })).toBe(false)
  })

  it('validate() rejects a payload with malformed (incomplete) metadata', () => {
    const serialized = serializer.serialize(makeMemory())
    expect(serializer.validate({ version: 1, payload: { ...serialized.payload, metadata: { learnerId: 'x' } } })).toBe(false)
  })

  it('validate() rejects a payload where metadata is not an object at all', () => {
    const serialized = serializer.serialize(makeMemory())
    expect(serializer.validate({ version: 1, payload: { ...serialized.payload, metadata: 'not-an-object' } })).toBe(false)
    expect(serializer.validate({ version: 1, payload: { ...serialized.payload, metadata: null } })).toBe(false)
  })

  it('deserialize() throws InvalidMemoryPayloadError for an invalid payload', () => {
    expect(() => serializer.deserialize({ version: 1, payload: {} })).toThrow(InvalidMemoryPayloadError)
  })

  it('deserialize() throws InvalidMemoryPayloadError for an unknown version', () => {
    expect(() => serializer.deserialize({ version: 2, payload: {} })).toThrow(InvalidMemoryPayloadError)
  })
})
