import { describe, expect, it } from 'vitest'
import { extractPlaceholder } from './extractPlaceholder'

describe('extractPlaceholder', () => {
  it('returns an honest, unsuccessful extraction-failed result for each reserved source type', async () => {
    for (const sourceType of ['image', 'voice', 'website', 'youtube', 'cloud-storage'] as const) {
      const result = await extractPlaceholder(sourceType)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('extraction-failed')
        expect(result.error.message.toLowerCase()).toContain('not yet supported')
      }
    }
  })
})
