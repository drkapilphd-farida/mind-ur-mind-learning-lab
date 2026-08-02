import { describe, expect, it } from 'vitest'
import { createRequestMetadataAssembler } from './DefaultRequestMetadataAssembler'
import { makeFixedClock, makeRequestContext } from '../testFixtures'

describe('DefaultRequestMetadataAssembler (Metadata Assembly)', () => {
  it('assembles metadata from the context, stamped with the clock\'s current time', () => {
    const assembler = createRequestMetadataAssembler(makeFixedClock('2026-01-01T00:00:00.000Z'))
    const context = makeRequestContext({ learnerId: 'learner-1', profileId: 'profile-1' })

    const metadata = assembler.assemble(context)

    expect(metadata).toEqual({ learnerId: 'learner-1', profileId: 'profile-1', source: 'request-execution-pipeline', generatedAt: '2026-01-01T00:00:00.000Z' })
  })
})
