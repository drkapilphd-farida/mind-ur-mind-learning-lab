import { describe, expect, it, vi, beforeEach } from 'vitest'

const hoisted = vi.hoisted(() => ({
  createClient: vi.fn(),
  listDocuments: vi.fn(),
  advanceBackgroundProcessing: vi.fn(),
  runQuickIntelligence: vi.fn(),
  applyQuickIntelligenceOutcome: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: hoisted.createClient }))
vi.mock('@/services/documents', () => ({ listDocuments: hoisted.listDocuments }))
vi.mock('@/lib/processing/advanceBackgroundProcessing', () => ({ advanceBackgroundProcessing: hoisted.advanceBackgroundProcessing }))
vi.mock('@/lib/processing/runQuickIntelligence', () => ({ runQuickIntelligence: hoisted.runQuickIntelligence, applyQuickIntelligenceOutcome: hoisted.applyQuickIntelligenceOutcome }))

const { pollAllInFlightProcessing } = await import('./pollAllInFlightProcessing')

const FAKE_USER = { id: 'user-1' }

function fakeSupabase(): { auth: { getUser: () => Promise<{ data: { user: typeof FAKE_USER } }> } } {
  return { auth: { getUser: () => Promise.resolve({ data: { user: FAKE_USER } }) } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('pollAllInFlightProcessing', () => {
  it('reports not signed in without touching any document', async () => {
    hoisted.createClient.mockResolvedValue({ auth: { getUser: () => Promise.resolve({ data: { user: null } }) } })
    const result = await pollAllInFlightProcessing()
    expect(result).toEqual({ success: false, error: 'Not signed in.' })
    expect(hoisted.listDocuments).not.toHaveBeenCalled()
  })

  // Sprint PIPELINE-2 — Upload Reliability & Processing Fix™. The real
  // fix this test protects: a document stuck at status:'processing'
  // (Phase 1 never finished, e.g. the learner navigated away from the
  // Processing screen) is now retried here too, not just documents
  // already past Phase 1.
  it('retries every document stuck at status:processing via runQuickIntelligence, not just workspace_ready ones', async () => {
    hoisted.createClient.mockResolvedValue(fakeSupabase())
    hoisted.listDocuments.mockResolvedValue([
      { id: 'doc-stuck-1', status: 'processing' },
      { id: 'doc-stuck-2', status: 'processing' },
      { id: 'doc-in-flight', status: 'workspace_ready' },
    ])
    hoisted.runQuickIntelligence.mockResolvedValue({ outcome: 'workspace-ready' })
    hoisted.applyQuickIntelligenceOutcome.mockResolvedValue({ success: true })
    hoisted.advanceBackgroundProcessing.mockResolvedValue({ outcome: 'advanced' })

    const result = await pollAllInFlightProcessing()

    expect(hoisted.runQuickIntelligence).toHaveBeenCalledTimes(2)
    expect(hoisted.applyQuickIntelligenceOutcome).toHaveBeenCalledTimes(2)
    expect(hoisted.advanceBackgroundProcessing).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ success: true, advancedCount: 3, inFlightCount: 3 })
  })

  it('does not count a Phase-1 recovery that genuinely failed', async () => {
    hoisted.createClient.mockResolvedValue(fakeSupabase())
    hoisted.listDocuments.mockResolvedValue([{ id: 'doc-stuck-1', status: 'processing' }])
    hoisted.runQuickIntelligence.mockResolvedValue({ outcome: 'failed', error: 'boom' })
    hoisted.applyQuickIntelligenceOutcome.mockResolvedValue({ success: false, error: 'boom' })

    const result = await pollAllInFlightProcessing()
    expect(result).toEqual({ success: true, advancedCount: 0, inFlightCount: 1 })
  })

  it('never throws — converts an unexpected exception into a failed result', async () => {
    hoisted.createClient.mockRejectedValue(new Error('connection reset'))
    const result = await pollAllInFlightProcessing()
    expect(result).toEqual({ success: false, error: 'We could not check your document processing right now.' })
  })
})
