import { describe, expect, it } from 'vitest'
import { normalizeConceptLabel } from './normalizeConceptLabel'

describe('normalizeConceptLabel', () => {
  it('lowercases the label', () => {
    expect(normalizeConceptLabel('NEWTON\'S LAW')).toBe('newton\'s law')
  })

  it('trims leading and trailing whitespace', () => {
    expect(normalizeConceptLabel('  force  ')).toBe('force')
  })

  it('collapses internal whitespace to a single space', () => {
    expect(normalizeConceptLabel('inertia   and   motion')).toBe('inertia and motion')
  })

  it('produces the same key for labels differing only in case/whitespace', () => {
    expect(normalizeConceptLabel('Newton\'s Law')).toBe(normalizeConceptLabel(' newton\'s  law '))
  })

  it('does not stem or resolve synonyms — different words stay different', () => {
    expect(normalizeConceptLabel('force')).not.toBe(normalizeConceptLabel('forces'))
  })
})
