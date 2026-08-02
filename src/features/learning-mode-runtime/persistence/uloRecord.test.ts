import { describe, expect, it } from 'vitest'
import { makeULO } from '../testFixtures'
import { fromUniversalLearningObjectRecord, toUniversalLearningObjectRecord } from './uloRecord'

describe('uloRecord', () => {
  it('round-trips a real ULO through the record shape without loss', async () => {
    const ulo = await makeULO()
    const record = toUniversalLearningObjectRecord(ulo)

    expect(record.document_id).toBe(ulo.documentId)
    expect(record.ulo_id).toBe(ulo.id)
    expect(record.ulo_version_revision).toBe(ulo.version.revision)

    const restored = fromUniversalLearningObjectRecord(record.data)
    expect(restored).toEqual(ulo)
  })

  it('returns null, honestly, for data that is not shaped like a real ULO', () => {
    expect(fromUniversalLearningObjectRecord({ not: 'a ulo' })).toBeNull()
    expect(fromUniversalLearningObjectRecord(null)).toBeNull()
    expect(fromUniversalLearningObjectRecord('a string')).toBeNull()
    expect(fromUniversalLearningObjectRecord([])).toBeNull()
  })
})
