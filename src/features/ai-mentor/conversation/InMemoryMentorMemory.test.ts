import { describe, expect, it } from 'vitest'
import { InMemoryMentorMemory } from './InMemoryMentorMemory'

describe('InMemoryMentorMemory', () => {
  it('returns an empty array for a project with no remembered facts', async () => {
    const memory = new InMemoryMentorMemory()
    expect(await memory.recall('project-1')).toEqual([])
  })

  it('recalls a remembered fact', async () => {
    const memory = new InMemoryMentorMemory()
    await memory.remember('project-1', 'Prefers short sessions')
    expect(await memory.recall('project-1')).toEqual(['Prefers short sessions'])
  })

  it('accumulates multiple facts in order', async () => {
    const memory = new InMemoryMentorMemory()
    await memory.remember('project-1', 'First fact')
    await memory.remember('project-1', 'Second fact')
    expect(await memory.recall('project-1')).toEqual(['First fact', 'Second fact'])
  })

  it('keeps facts scoped to their own learningProjectId', async () => {
    const memory = new InMemoryMentorMemory()
    await memory.remember('project-1', 'Fact for project 1')
    await memory.remember('project-2', 'Fact for project 2')
    expect(await memory.recall('project-1')).toEqual(['Fact for project 1'])
    expect(await memory.recall('project-2')).toEqual(['Fact for project 2'])
  })
})
