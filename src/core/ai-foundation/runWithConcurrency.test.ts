import { describe, expect, it } from 'vitest'
import { runWithConcurrency } from './runWithConcurrency'

describe('runWithConcurrency', () => {
  it('resolves every item in original order, regardless of completion order', async () => {
    const items = [30, 10, 20]
    const results = await runWithConcurrency(items, 3, (item) => new Promise<number>((resolve) => setTimeout(() => resolve(item * 2), item)))
    expect(results).toEqual([60, 20, 40])
  })

  it('never runs more than `concurrency` workers at once', async () => {
    let active = 0
    let maxActive = 0
    const items = [1, 2, 3, 4, 5, 6, 7]

    await runWithConcurrency(items, 2, async (item) => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 5))
      active -= 1
      return item
    })

    expect(maxActive).toBeLessThanOrEqual(2)
  })

  it('handles an empty item list', async () => {
    const results = await runWithConcurrency<number, number>([], 3, async (item) => item)
    expect(results).toEqual([])
  })

  it('clamps concurrency to the number of items', async () => {
    const results = await runWithConcurrency([1, 2], 10, async (item) => item * 10)
    expect(results).toEqual([10, 20])
  })
})
