import { describe, expect, it, vi } from 'vitest'

// Production AI Cost Optimization — Task 4. Real service-layer test for
// document deletion. `getDocument` (ownership check) runs through the
// caller's own real client (`@/lib/supabase/server`); the real Storage
// removal and the real row deletion both run through the service-role
// client (`@/lib/supabase/service`) — mirroring the same two-client split
// `buildAndSaveDocumentUniversalLearningObject.ts` already established.

const DOCUMENT_ROW = {
  id: 'doc-1',
  user_id: 'user-1',
  learning_project_id: 'project-1',
  title: 'A real document',
  storage_path: 'user-1/doc-1/notes.txt',
  mime_type: 'text/plain',
  size_bytes: 200,
  status: 'ready',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

function makeServerClient(documentRow: typeof DOCUMENT_ROW | null): { from: () => unknown } {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: documentRow, error: null }),
          }),
        }),
      }),
    }),
  }
}

describe('deleteDocument', () => {
  it('removes the real stored file and deletes the document row when the caller genuinely owns it', async () => {
    const remove = vi.fn(() => Promise.resolve({ error: null }))
    const deleteEq2 = vi.fn(() => Promise.resolve({ error: null }))
    const deleteEq1 = vi.fn(() => ({ eq: deleteEq2 }))
    const serviceDeleteFn = vi.fn(() => ({ delete: () => ({ eq: deleteEq1 }) }))

    vi.resetModules()
    vi.doMock('@/lib/supabase/server', () => ({ createClient: () => Promise.resolve(makeServerClient(DOCUMENT_ROW)) }))
    vi.doMock('@/lib/supabase/service', () => ({
      createServiceClient: () => ({
        storage: { from: () => ({ remove }) },
        from: serviceDeleteFn,
      }),
    }))

    const { deleteDocument } = await import('./index')
    const result = await deleteDocument('user-1', 'doc-1')

    expect(result).toEqual({ success: true })
    expect(remove).toHaveBeenCalledWith(['user-1/doc-1/notes.txt'])
    expect(deleteEq1).toHaveBeenCalledWith('id', 'doc-1')
    expect(deleteEq2).toHaveBeenCalledWith('user_id', 'user-1')

    vi.doUnmock('@/lib/supabase/server')
    vi.doUnmock('@/lib/supabase/service')
  })

  it('returns a real, honest failure when the document cannot be found for this caller', async () => {
    vi.resetModules()
    vi.doMock('@/lib/supabase/server', () => ({ createClient: () => Promise.resolve(makeServerClient(null)) }))
    vi.doMock('@/lib/supabase/service', () => ({ createServiceClient: () => ({}) }))

    const { deleteDocument } = await import('./index')
    const result = await deleteDocument('user-1', 'doc-missing')

    expect(result).toEqual({ success: false, error: 'This document could not be found.' })

    vi.doUnmock('@/lib/supabase/server')
    vi.doUnmock('@/lib/supabase/service')
  })
})
