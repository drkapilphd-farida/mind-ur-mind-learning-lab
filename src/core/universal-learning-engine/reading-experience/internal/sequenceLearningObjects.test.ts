import { describe, expect, it } from 'vitest'
import type { LearningAssetObject } from '@/core/universal-learning-engine/learning-assets'
import { makeBundle } from './testFixtures'
import { sequenceLearningObjects } from './sequenceLearningObjects'

describe('sequenceLearningObjects', () => {
  it('places a real prerequisite before whatever real object depends on it', () => {
    const bundle = makeBundle()
    const sequenced = sequenceLearningObjects(bundle.learningObjects)
    const order = sequenced.map((object) => object.objectId)
    expect(order.indexOf('obj-photosynthesis')).toBeLessThan(order.indexOf('obj-respiration'))
  })

  it('orders objects with no unmet prerequisite by real ascending difficulty, then real descending importance', () => {
    const objects: LearningAssetObject[] = [
      { ...bundleObject(), objectId: 'obj-advanced', title: 'Advanced Thing', difficulty: 'advanced', importance: 0.9, prerequisiteObjects: [] },
      { ...bundleObject(), objectId: 'obj-beginner', title: 'Beginner Thing', difficulty: 'beginner', importance: 0.1, prerequisiteObjects: [] },
    ]
    const sequenced = sequenceLearningObjects(objects)
    expect(sequenced.map((object) => object.objectId)).toEqual(['obj-beginner', 'obj-advanced'])
  })

  it('never drops or fabricates an object even if a real cycle existed', () => {
    const cyclical: LearningAssetObject[] = [
      { ...bundleObject(), objectId: 'obj-a', prerequisiteObjects: ['obj-b'] },
      { ...bundleObject(), objectId: 'obj-b', prerequisiteObjects: ['obj-a'] },
    ]
    const sequenced = sequenceLearningObjects(cyclical)
    expect(sequenced).toHaveLength(2)
    expect(new Set(sequenced.map((object) => object.objectId))).toEqual(new Set(['obj-a', 'obj-b']))
  })

  it('ignores a prerequisite that points outside this same chapter own object set', () => {
    const objects: LearningAssetObject[] = [{ ...bundleObject(), objectId: 'obj-a', prerequisiteObjects: ['obj-from-another-chapter'] }]
    const sequenced = sequenceLearningObjects(objects)
    expect(sequenced.map((object) => object.objectId)).toEqual(['obj-a'])
  })
})

function bundleObject(): LearningAssetObject {
  return makeBundle().learningObjects[0] as LearningAssetObject
}
