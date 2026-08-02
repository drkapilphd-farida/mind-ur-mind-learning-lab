import { describe, expect, it } from 'vitest'
import { validateUniversalUpload } from './validateUniversalUpload'

function makeFile(): File {
  return new File([new Uint8Array([1, 2, 3])], 'sample.pdf', { type: 'application/pdf' })
}

describe('validateUniversalUpload', () => {
  it('passes through a valid result, preserving the warning', async () => {
    const result = await validateUniversalUpload(makeFile(), async () => ({ valid: true, warning: 'large-file' }))
    expect(result).toEqual({ valid: true, warning: 'large-file' })
  })

  it('maps unsupported-type to the engine error model with the existing message text', async () => {
    const result = await validateUniversalUpload(makeFile(), async () => ({ valid: false, reason: 'unsupported-type' }))
    expect(result).toEqual({ valid: false, error: { code: 'unsupported-type', message: "That file type isn't supported for what you selected." } })
  })

  it('maps too-large to file-too-large with the existing message text', async () => {
    const result = await validateUniversalUpload(makeFile(), async () => ({ valid: false, reason: 'too-large' }))
    expect(result).toEqual({ valid: false, error: { code: 'file-too-large', message: 'This file is too large. Please choose a file up to 50 MB.' } })
  })

  it('maps corrupted to corrupted-file with the existing message text', async () => {
    const result = await validateUniversalUpload(makeFile(), async () => ({ valid: false, reason: 'corrupted' }))
    expect(result).toEqual({ valid: false, error: { code: 'corrupted-file', message: "This file doesn't look valid. Please check it and try again." } })
  })

  it('maps an unexpected throw to unknown-error rather than propagating', async () => {
    const result = await validateUniversalUpload(makeFile(), async () => {
      throw new Error('boom')
    })
    expect(result).toEqual({ valid: false, error: { code: 'unknown-error', message: 'Something went wrong while checking this file. Please try again.' } })
  })
})
