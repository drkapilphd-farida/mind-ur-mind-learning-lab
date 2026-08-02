import { describe, expect, it } from 'vitest'
import type { StreamChunk } from '../types'
import { createStreamAssembler } from './DefaultStreamAssembler'

function chunk(sequenceNumber: number, content: string, isFinal = false): StreamChunk {
  return { sequenceNumber, content, isFinal }
}

describe('DefaultStreamAssembler', () => {
  it('Response Assembly: assemblePartialResponse joins chunk content in sequence order', () => {
    const assembler = createStreamAssembler()
    const chunks = [chunk(0, 'Hel'), chunk(1, 'lo, '), chunk(2, 'wor')]

    expect(assembler.assemblePartialResponse(chunks)).toBe('Hello, wor')
  })

  it('Response Assembly: assembles correctly regardless of input array order', () => {
    const assembler = createStreamAssembler()
    const chunks = [chunk(2, 'C'), chunk(0, 'A'), chunk(1, 'B')]

    expect(assembler.assemblePartialResponse(chunks)).toBe('ABC')
  })

  it('Response Assembly: assembleFinalResponse joins all chunks including the final one', () => {
    const assembler = createStreamAssembler()
    const chunks = [chunk(0, 'A'), chunk(1, 'B'), chunk(2, 'C', true)]

    expect(assembler.assembleFinalResponse(chunks)).toBe('ABC')
  })

  it('returns an empty string for an empty chunk array', () => {
    const assembler = createStreamAssembler()

    expect(assembler.assemblePartialResponse([])).toBe('')
    expect(assembler.assembleFinalResponse([])).toBe('')
  })

  it('does not mutate the input chunk array', () => {
    const assembler = createStreamAssembler()
    const chunks = [chunk(1, 'B'), chunk(0, 'A')]
    const before = [...chunks]

    assembler.assemblePartialResponse(chunks)

    expect(chunks).toEqual(before)
  })

  it('Determinism: two independently-constructed assemblers produce identical output', () => {
    const assemblerA = createStreamAssembler()
    const assemblerB = createStreamAssembler()
    const chunks = [chunk(0, 'A'), chunk(1, 'B')]

    expect(assemblerA.assemblePartialResponse(chunks)).toEqual(assemblerB.assemblePartialResponse(chunks))
  })
})
