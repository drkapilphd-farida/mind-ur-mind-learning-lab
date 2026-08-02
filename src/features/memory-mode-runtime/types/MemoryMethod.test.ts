import { describe, expect, it } from 'vitest'
import { MEMORY_METHODS, MemoryMethodIdSchema, getMemoryMethodDefinition } from './MemoryMethod'

describe('MemoryMethod', () => {
  it('names exactly the six real Memory Methods this sprint\'s own brief lists, each with a real, non-empty label and description', () => {
    expect(MEMORY_METHODS.map((method) => method.id)).toEqual(['story', 'visualization', 'association', 'chunking', 'journey', 'recall-practice'])
    for (const method of MEMORY_METHODS) {
      expect(method.label.length).toBeGreaterThan(0)
      expect(method.description.length).toBeGreaterThan(0)
    }
  })

  it('only gives an instruction prompt to the three methods whose real treatment is a coaching prompt over the same content, never to the three with a structural treatment instead', () => {
    const withInstruction = MEMORY_METHODS.filter((method) => method.instruction !== null).map((method) => method.id)
    const withoutInstruction = MEMORY_METHODS.filter((method) => method.instruction === null).map((method) => method.id)

    expect(withInstruction).toEqual(['story', 'visualization', 'association'])
    expect(withoutInstruction).toEqual(['chunking', 'journey', 'recall-practice'])
  })

  it('getMemoryMethodDefinition resolves each real id to its own real definition', () => {
    for (const method of MEMORY_METHODS) {
      expect(getMemoryMethodDefinition(method.id)).toEqual(method)
    }
  })

  it('MemoryMethodIdSchema accepts exactly the six real ids and rejects anything else, honestly', () => {
    for (const method of MEMORY_METHODS) {
      expect(MemoryMethodIdSchema.safeParse(method.id).success).toBe(true)
    }
    expect(MemoryMethodIdSchema.safeParse('flashcards').success).toBe(false)
    expect(MemoryMethodIdSchema.safeParse('').success).toBe(false)
  })
})
