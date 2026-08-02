import { describe, expect, it } from 'vitest'
import { buildReadingNavigationContract } from './buildReadingNavigationContract'

describe('buildReadingNavigationContract', () => {
  it('Navigation Contracts: allowed access has no redirect', () => {
    expect(buildReadingNavigationContract({ allowed: true })).toEqual({ allowed: true, redirectHref: null })
  })

  it('Navigation Contracts: disallowed access redirects to the next eligible exercise', () => {
    const access = {
      allowed: false as const,
      nextExercise: { exerciseId: 'ex-1', title: 'Exercise 1', summary: 'summary', href: '/labs/quantum-speed-reading/ex-1' },
    }

    expect(buildReadingNavigationContract(access)).toEqual({
      allowed: false,
      redirectHref: '/labs/quantum-speed-reading/ex-1',
    })
  })

  it('Navigation Contracts: disallowed access with no next exercise has a null redirect', () => {
    expect(buildReadingNavigationContract({ allowed: false, nextExercise: null })).toEqual({
      allowed: false,
      redirectHref: null,
    })
  })

  it('Determinism: identical inputs produce identical output', () => {
    expect(buildReadingNavigationContract({ allowed: true })).toEqual(
      buildReadingNavigationContract({ allowed: true }),
    )
  })
})
