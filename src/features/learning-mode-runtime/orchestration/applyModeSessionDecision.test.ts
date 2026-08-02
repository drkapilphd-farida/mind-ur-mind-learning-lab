import { describe, expect, it, vi } from 'vitest'
import { continueRuntime, previousChunk } from '@/core/adaptive-learning-runtime'
import type { LearningMode } from '@/core/learning-mode-integration'
import { FIXED_NOW, makeSessionSnapshot } from '../testFixtures'
import { applyModeSessionDecision } from './applyModeSessionDecision'

const readingMode: LearningMode = {
  type: 'quantum-speed-reading',
  capabilities: { sessionType: 'reading', supportedChunkStrategies: ['sequential', 'priority-first', 'dependency-first', 'review-first', 'adaptive-queue'], supportsCheckpoints: true },
}

const memoryMode: LearningMode = {
  type: 'memory',
  capabilities: { sessionType: 'memory', supportedChunkStrategies: ['review-first', 'adaptive-queue', 'sequential'], supportsCheckpoints: true },
}

describe('applyModeSessionDecision', () => {
  it('restores the real runtime from a real snapshot, applies a real decision, and returns the next real snapshot', async () => {
    const { ulo, snapshot } = await makeSessionSnapshot()

    const outcome = applyModeSessionDecision(readingMode, snapshot, ulo, (runtime, targetUlo) => continueRuntime(runtime, targetUlo, { now: FIXED_NOW }))

    expect(outcome.success).toBe(true)
    if (!outcome.success) return
    expect(outcome.snapshot.completedChunkIds).toEqual(['chunk-1'])
    expect(outcome.runtime.position.chunkNodeId).toBe('chunk-2')
  })

  it('carries `method` forward from the incoming snapshot, unchanged, exactly like `strategy` already survives via restoreFromSnapshot (ALS-15)', async () => {
    const { ulo, snapshot } = await makeSessionSnapshot('learner-1', 'memory')
    const withMethod = { ...snapshot, method: 'story' }

    const outcome = applyModeSessionDecision(memoryMode, withMethod, ulo, (runtime, targetUlo) => continueRuntime(runtime, targetUlo, { now: FIXED_NOW }))

    expect(outcome.success).toBe(true)
    if (!outcome.success) return
    expect(outcome.snapshot.method).toBe('story')
  })

  it('works identically for a genuinely different Learning Mode (proves mode-agnosticism)', async () => {
    const { ulo, snapshot } = await makeSessionSnapshot('learner-1', 'memory')

    const outcome = applyModeSessionDecision(memoryMode, snapshot, ulo, (runtime, targetUlo) => continueRuntime(runtime, targetUlo, { now: FIXED_NOW }))

    expect(outcome.success).toBe(true)
    if (!outcome.success) return
    expect(outcome.snapshot.sessionType).toBe('memory')
    expect(outcome.snapshot.completedChunkIds).toEqual(['chunk-1'])
  })

  it('forwards real dispatched events to the mode adapter when one is registered', async () => {
    const { ulo, snapshot } = await makeSessionSnapshot()
    const onChunkCompleted = vi.fn()
    const modeWithAdapter = { ...readingMode, adapter: { type: 'quantum-speed-reading' as const, onChunkCompleted } }

    applyModeSessionDecision(modeWithAdapter, snapshot, ulo, (runtime, targetUlo) => continueRuntime(runtime, targetUlo, { now: FIXED_NOW }))

    expect(onChunkCompleted).toHaveBeenCalledTimes(1)
  })

  it('propagates a real restore failure (wrong ULO) without applying any decision', async () => {
    const { snapshot } = await makeSessionSnapshot()
    const wrongUlo = (await makeSessionSnapshot()).ulo
    const mismatched = { ...wrongUlo, id: 'a-genuinely-different-ulo-id' }

    const outcome = applyModeSessionDecision(readingMode, snapshot, mismatched, (runtime, targetUlo) => continueRuntime(runtime, targetUlo))

    expect(outcome.success).toBe(false)
    expect(!outcome.success && outcome.error.code).toBe('ulo-mismatch')
  })

  it('propagates a real decision failure (no previous chunk from the first position)', async () => {
    const { ulo, snapshot } = await makeSessionSnapshot()

    const outcome = applyModeSessionDecision(readingMode, snapshot, ulo, (runtime, targetUlo) => previousChunk(runtime, targetUlo, { now: FIXED_NOW }))

    expect(outcome.success).toBe(false)
    expect(!outcome.success && outcome.error.code).toBe('no-previous-chunk')
  })
})
