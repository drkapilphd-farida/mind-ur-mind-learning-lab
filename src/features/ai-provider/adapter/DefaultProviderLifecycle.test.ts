import { describe, expect, it } from 'vitest'
import { createProviderLifecycle } from './DefaultProviderLifecycle'

describe('DefaultProviderLifecycle', () => {
  it('starts not ready', () => {
    expect(createProviderLifecycle().isReady()).toBe(false)
  })

  it('becomes ready after initialize()', async () => {
    const lifecycle = createProviderLifecycle()
    await lifecycle.initialize()
    expect(lifecycle.isReady()).toBe(true)
  })

  it('becomes not ready again after shutdown()', async () => {
    const lifecycle = createProviderLifecycle()
    await lifecycle.initialize()
    await lifecycle.shutdown()
    expect(lifecycle.isReady()).toBe(false)
  })

  it('can be re-initialized after shutdown', async () => {
    const lifecycle = createProviderLifecycle()
    await lifecycle.initialize()
    await lifecycle.shutdown()
    await lifecycle.initialize()
    expect(lifecycle.isReady()).toBe(true)
  })
})
