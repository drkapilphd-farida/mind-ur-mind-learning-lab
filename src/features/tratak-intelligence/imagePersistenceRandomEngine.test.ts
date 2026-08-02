import { describe, expect, it } from 'vitest'
import { selectRandomImagePersistenceImage } from './imagePersistenceRandomEngine'
import type { ImagePersistenceImageDefinition } from './imagePersistencePool'

function image(id: string): ImagePersistenceImageDefinition {
  return { id, category: 'mandala', src: `/images/image-persistence/${id}.jpg`, alt: id, anchorXPercent: 50, anchorYPercent: 50 }
}

const POOL = [image('a'), image('b'), image('c')]

describe('selectRandomImagePersistenceImage', () => {
  it('always returns a real member of the pool', () => {
    for (let i = 0; i < 50; i++) {
      const picked = selectRandomImagePersistenceImage(POOL, null)
      expect(POOL.some((candidate) => candidate.id === picked.id)).toBe(true)
    }
  })

  it('never repeats the excluded image when more than one image exists', () => {
    for (let i = 0; i < 50; i++) {
      const picked = selectRandomImagePersistenceImage(POOL, 'a')
      expect(picked.id).not.toBe('a')
    }
  })

  it('returns the only image when the pool has just one, even if excluded', () => {
    const soloPool = [image('only')]
    const picked = selectRandomImagePersistenceImage(soloPool, 'only')
    expect(picked.id).toBe('only')
  })

  it('eventually returns every non-excluded pool member over many draws', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) {
      seen.add(selectRandomImagePersistenceImage(POOL, 'a').id)
    }
    expect(seen).toEqual(new Set(['b', 'c']))
  })
})
