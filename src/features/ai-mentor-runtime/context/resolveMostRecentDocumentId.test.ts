import { describe, expect, it } from 'vitest'
import { makeSessionSnapshot } from '@/features/learning-mode-runtime/testFixtures'
import { resolveMostRecentDocumentId } from './resolveMostRecentDocumentId'

describe('resolveMostRecentDocumentId', () => {
  it('returns null, honestly, when there are no real sessions of any kind', () => {
    expect(resolveMostRecentDocumentId([], [], [])).toBeNull()
  })

  it('returns the real documentId of whichever real snapshot has the most recent capturedAt, across every list', async () => {
    const { snapshot: older } = await makeSessionSnapshot('learner-1', 'reading')
    const { snapshot: newer } = await makeSessionSnapshot('learner-1', 'memory')

    const olderSnapshot = { ...older, documentId: 'doc-older', capturedAt: '2026-01-01T00:00:00.000Z' }
    const newerSnapshot = { ...newer, documentId: 'doc-newer', capturedAt: '2026-01-02T00:00:00.000Z' }

    expect(resolveMostRecentDocumentId([olderSnapshot], [newerSnapshot], [])).toBe('doc-newer')
    expect(resolveMostRecentDocumentId([newerSnapshot], [olderSnapshot], [])).toBe('doc-newer')
  })
})
