import { describe, expect, it } from 'vitest'
import { createAIExecutionSessionManager } from './DefaultAIExecutionSessionManager'
import { makeAIExecutionSession } from '../testFixtures'

describe('DefaultAIExecutionSessionManager', () => {
  it('Session Creation: registers a new session and reports valid: true', () => {
    const manager = createAIExecutionSessionManager()
    const session = makeAIExecutionSession({ id: 'session-1' })

    expect(manager.register(session)).toEqual({ valid: true, issues: [] })
  })

  it('a registered session is discoverable via get/list', () => {
    const manager = createAIExecutionSessionManager()
    const session = makeAIExecutionSession({ id: 'session-1' })
    manager.register(session)

    expect(manager.get('session-1')).toEqual(session)
    expect(manager.list()).toEqual([session])
  })

  it('get returns undefined for an unregistered session id, never throws', () => {
    const manager = createAIExecutionSessionManager()
    expect(manager.get('unknown')).toBeUndefined()
  })

  it('Duplicate session id: rejects a second registration for the same id without overwriting the first', () => {
    const manager = createAIExecutionSessionManager()
    const first = makeAIExecutionSession({ id: 'session-1', state: 'created' })
    const second = makeAIExecutionSession({ id: 'session-1', state: 'running' })

    manager.register(first)
    const result = manager.register(second)

    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-session-id')).toBe(true)
    expect(manager.get('session-1')).toEqual(first)
  })

  it('update() replaces the stored snapshot for an already-registered session', () => {
    const manager = createAIExecutionSessionManager()
    const created = makeAIExecutionSession({ id: 'session-1', state: 'created' })
    manager.register(created)

    const completed = makeAIExecutionSession({ id: 'session-1', state: 'completed' })
    manager.update(completed)

    expect(manager.get('session-1')).toEqual(completed)
  })

  it('update() is a no-op for a session id that was never registered', () => {
    const manager = createAIExecutionSessionManager()

    manager.update(makeAIExecutionSession({ id: 'unknown' }))

    expect(manager.get('unknown')).toBeUndefined()
    expect(manager.list()).toEqual([])
  })
})
