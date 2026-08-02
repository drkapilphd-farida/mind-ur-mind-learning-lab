import { describe, expect, it } from 'vitest'
import { diagnoseSupabaseError, toSupabaseOperationError } from './diagnoseSupabaseError'

describe('diagnoseSupabaseError', () => {
  it('names the exact migration when documents.status rejects workspace_ready', () => {
    const diagnosis = diagnoseSupabaseError({
      code: '23514',
      message: 'new row for relation "documents" violates check constraint "documents_status_check"',
    })
    expect(diagnosis).toContain('MIGRATION MISSING')
    expect(diagnosis).toContain('20260728000001_add_workspace_ready_to_documents_status.sql')
  })

  it('names the exact migration when document_processing_progress does not exist', () => {
    const diagnosis = diagnoseSupabaseError({
      code: '42P01',
      message: 'relation "public.document_processing_progress" does not exist',
    })
    expect(diagnosis).toContain('MIGRATION MISSING')
    expect(diagnosis).toContain('20260728000002_create_document_processing_progress.sql')
  })

  it('never hides an unrecognized real error — always returns the raw code and message', () => {
    const diagnosis = diagnoseSupabaseError({ code: '42501', message: 'permission denied for table documents' })
    expect(diagnosis).toBe('[42501] permission denied for table documents')
  })

  it('is honest about a missing error code rather than fabricating one', () => {
    const diagnosis = diagnoseSupabaseError({ message: 'something genuinely unexpected happened' })
    expect(diagnosis).toBe('[no-code] something genuinely unexpected happened')
  })
})

describe('toSupabaseOperationError', () => {
  it('preserves the real Postgres error code as a property on the thrown Error', () => {
    const error = toSupabaseOperationError('markDocumentWorkspaceReady failed', { code: '23514', message: 'violates check constraint "documents_status_check"' })
    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe('23514')
    expect(error.message).toBe('markDocumentWorkspaceReady failed: violates check constraint "documents_status_check"')
  })
})
