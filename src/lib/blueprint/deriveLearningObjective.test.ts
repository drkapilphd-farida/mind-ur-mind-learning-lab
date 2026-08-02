import { describe, expect, it } from 'vitest'
import { deriveLearningObjective } from './deriveLearningObjective'

describe('deriveLearningObjective', () => {
  it('embeds the real document title, quoted, in a generic (non-fabricated) objective', () => {
    expect(deriveLearningObjective('Cell Biology Notes')).toBe('Understand and retain the key ideas in "Cell Biology Notes."')
  })

  it('varies with the real title rather than returning a fixed string', () => {
    expect(deriveLearningObjective('Document A')).not.toBe(deriveLearningObjective('Document B'))
  })
})
