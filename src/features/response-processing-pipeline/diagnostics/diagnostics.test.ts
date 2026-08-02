import { describe, expect, it } from 'vitest'
import { generateResponseDiagnostics } from './generateResponseDiagnostics'
import { makeResponseEnvelope, makeResponseProcessingValidation } from '../testFixtures'

describe('generateResponseDiagnostics', () => {
  it('collects the request id, provider, validation result, finish reason, usage/error presence, and content length', () => {
    const envelope = makeResponseEnvelope({ requestId: 'req-1', providerId: 'openai', content: 'Hello!', finishReason: 'stop' })
    const validationResult = makeResponseProcessingValidation()

    const diagnostics = generateResponseDiagnostics(envelope, validationResult, true, false)

    expect(diagnostics).toEqual({
      requestId: 'req-1',
      providerId: 'openai',
      validationResult: { valid: true, issues: [] },
      finishReason: 'stop',
      usagePresent: true,
      errorPresent: false,
      contentLength: 6,
    })
  })

  it('reflects errorPresent: true and usagePresent: false independently of envelope content', () => {
    const envelope = makeResponseEnvelope({ content: '' })
    const validationResult = makeResponseProcessingValidation({ valid: false, issues: [{ type: 'missing-usage', detail: 'no usage' }] })

    const diagnostics = generateResponseDiagnostics(envelope, validationResult, false, true)

    expect(diagnostics.usagePresent).toBe(false)
    expect(diagnostics.errorPresent).toBe(true)
    expect(diagnostics.contentLength).toBe(0)
  })
})
