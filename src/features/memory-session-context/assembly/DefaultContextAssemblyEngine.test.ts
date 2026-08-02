import { describe, expect, it } from 'vitest'
import { createContextAssemblyEngine } from './DefaultContextAssemblyEngine'
import { makeContextEntry } from '../testFixtures'

describe('DefaultContextAssemblyEngine', () => {
  it('builds the initial context by returning the incoming entries when nothing existing', () => {
    const engine = createContextAssemblyEngine()
    const incoming = [makeContextEntry({ id: 'a', memoryReferenceId: 'mem-a' })]
    expect(engine.assemble([], incoming)).toEqual(incoming)
  })

  it('preserves the ordering of existing entries and appends new ones after them', () => {
    const engine = createContextAssemblyEngine()
    const existing = [makeContextEntry({ id: 'a', memoryReferenceId: 'mem-a' })]
    const incoming = [makeContextEntry({ id: 'b', memoryReferenceId: 'mem-b' })]
    const merged = engine.assemble(existing, incoming)
    expect(merged.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('prevents duplicate entries by memoryReferenceId already present in existing entries', () => {
    const engine = createContextAssemblyEngine()
    const existing = [makeContextEntry({ id: 'a', memoryReferenceId: 'mem-a' })]
    const incoming = [makeContextEntry({ id: 'a-duplicate', memoryReferenceId: 'mem-a' })]
    const merged = engine.assemble(existing, incoming)
    expect(merged.map((e) => e.id)).toEqual(['a'])
  })

  it('prevents duplicate entries within a single incoming batch, keeping the first occurrence', () => {
    const engine = createContextAssemblyEngine()
    const incoming = [
      makeContextEntry({ id: 'first', memoryReferenceId: 'mem-a' }),
      makeContextEntry({ id: 'second', memoryReferenceId: 'mem-a' }),
    ]
    const merged = engine.assemble([], incoming)
    expect(merged.map((e) => e.id)).toEqual(['first'])
  })

  it('never mutates the given arrays — returns a new array', () => {
    const engine = createContextAssemblyEngine()
    const existing = [makeContextEntry({ id: 'a', memoryReferenceId: 'mem-a' })]
    const incoming = [makeContextEntry({ id: 'b', memoryReferenceId: 'mem-b' })]
    const merged = engine.assemble(existing, incoming)
    expect(merged).not.toBe(existing)
    expect(existing.map((e) => e.id)).toEqual(['a'])
  })
})
