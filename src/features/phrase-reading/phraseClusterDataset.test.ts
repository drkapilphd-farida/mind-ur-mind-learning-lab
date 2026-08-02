import { describe, it, expect } from 'vitest'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { PHRASE_LEVEL_CLUSTERS, getPhraseClustersForLevel, phraseClusterWordCount } from './phraseClusterDataset'
import type { PhraseReadingLevel } from './phraseDifficulty'

const LEVELS: PhraseReadingLevel[] = [1, 2, 3, 4, 5]

// Roughly matches PHRASE_READING_LENGTH_LABEL's declared word counts (1=2,
// 2=3, 3=4, 4=5). Level 5 here still checks the legacy, now-inert
// PHRASE_LEVEL_CLUSTERS[5] remix (see phraseClusterDataset.ts's comment on
// LEVEL_5_CLUSTERS) — the live "Advanced Phrase Reading" content lives in
// phraseAdvancedLibrary.ts instead, with its own word-range test.
const EXPECTED_WORD_RANGE: Record<PhraseReadingLevel, [number, number]> = {
  1: [2, 2],
  2: [3, 3],
  3: [4, 4],
  4: [4, 7],
  5: [3, 7],
}

describe('PHRASE_LEVEL_CLUSTERS', () => {
  it('defines clusters for every one of the 5 levels', () => {
    for (const level of LEVELS) {
      expect(PHRASE_LEVEL_CLUSTERS[level].length).toBeGreaterThan(0)
    }
  })

  it('every cluster has at least 4 distinct members (1 stimulus + 3 distractors)', () => {
    for (const level of LEVELS) {
      for (const cluster of PHRASE_LEVEL_CLUSTERS[level]) {
        expect(cluster.members.length).toBeGreaterThanOrEqual(4)
        expect(new Set(cluster.members).size).toBe(cluster.members.length)
      }
    }
  })

  it('every member passes the Visual Width Validator as an option', () => {
    for (const level of LEVELS) {
      for (const cluster of PHRASE_LEVEL_CLUSTERS[level]) {
        for (const member of cluster.members) {
          expect(isVisuallyValid(member, 'option')).toBe(true)
        }
      }
    }
  })

  it('every member\'s word count matches its level\'s declared range', () => {
    for (const level of LEVELS) {
      const [min, max] = EXPECTED_WORD_RANGE[level]
      for (const cluster of PHRASE_LEVEL_CLUSTERS[level]) {
        for (const member of cluster.members) {
          const count = phraseClusterWordCount(member)
          expect(count).toBeGreaterThanOrEqual(min)
          expect(count).toBeLessThanOrEqual(max)
        }
      }
    }
  })

  it('Level 1-4 members carry no terminal punctuation — phrases, never sentences', () => {
    for (const level of [1, 2, 3, 4] as const) {
      for (const cluster of PHRASE_LEVEL_CLUSTERS[level]) {
        for (const member of cluster.members) expect(member.endsWith('.')).toBe(false)
      }
    }
  })
})

describe('PhraseCluster optional fields (Challenge Library content)', () => {
  it('every level (1-5) has at least one missing-word-eligible cluster', () => {
    for (const level of LEVELS) {
      expect(PHRASE_LEVEL_CLUSTERS[level].some((c) => c.missingWord)).toBe(true)
    }
  })

  it('every level 2-5 has at least one phrase-completion-eligible cluster', () => {
    for (const level of [2, 3, 4, 5] as const) {
      expect(PHRASE_LEVEL_CLUSTERS[level].some((c) => c.completion)).toBe(true)
    }
  })

  it('every level 3-5 has at least one meaning-match-eligible cluster', () => {
    for (const level of [3, 4, 5] as const) {
      expect(PHRASE_LEVEL_CLUSTERS[level].some((c) => c.meaningMatch)).toBe(true)
    }
  })

  it('every missingWord template carries a blank and exactly 4 visually valid options', () => {
    for (const level of LEVELS) {
      for (const cluster of PHRASE_LEVEL_CLUSTERS[level]) {
        if (!cluster.missingWord) continue
        expect(cluster.missingWord.template).toContain('______')
        expect(cluster.missingWord.options).toHaveLength(4)
        expect(new Set(cluster.missingWord.options).size).toBe(4)
        for (const option of cluster.missingWord.options) expect(isVisuallyValid(option, 'option')).toBe(true)
      }
    }
  })

  it('every completion stem carries a blank and exactly 4 visually valid options', () => {
    for (const level of LEVELS) {
      for (const cluster of PHRASE_LEVEL_CLUSTERS[level]) {
        if (!cluster.completion) continue
        expect(cluster.completion.stem).toContain('______')
        expect(cluster.completion.options).toHaveLength(4)
        expect(new Set(cluster.completion.options).size).toBe(4)
        for (const option of cluster.completion.options) expect(isVisuallyValid(option, 'option')).toBe(true)
      }
    }
  })

  it('every meaningMatch has a correct paraphrase and exactly 3 distinct, visually valid distractors', () => {
    for (const level of LEVELS) {
      for (const cluster of PHRASE_LEVEL_CLUSTERS[level]) {
        if (!cluster.meaningMatch) continue
        expect(isVisuallyValid(cluster.meaningMatch.correctParaphrase, 'option')).toBe(true)
        expect(cluster.meaningMatch.distractors).toHaveLength(3)
        expect(cluster.meaningMatch.distractors).not.toContain(cluster.meaningMatch.correctParaphrase)
        for (const distractor of cluster.meaningMatch.distractors) expect(isVisuallyValid(distractor, 'option')).toBe(true)
      }
    }
  })
})

describe('getPhraseClustersForLevel', () => {
  it('returns the requested count when enough clusters are fresh', () => {
    const clusters = getPhraseClustersForLevel(2, 4, new Set(), 1)
    expect(clusters).toHaveLength(4)
  })

  it('excludes clusters whose members have already been shown, when enough fresh ones remain', () => {
    const used = new Set(PHRASE_LEVEL_CLUSTERS[1][0]!.members)
    const clusters = getPhraseClustersForLevel(1, 4, used, 1)
    for (const cluster of clusters) {
      expect(cluster.members).not.toEqual(PHRASE_LEVEL_CLUSTERS[1][0]!.members)
    }
  })

  it('falls back to the full pool (allowing reuse) rather than under-filling when exclusion would leave too few', () => {
    const used = new Set(PHRASE_LEVEL_CLUSTERS[1].flatMap((c) => c.members))
    const clusters = getPhraseClustersForLevel(1, 4, used, 1)
    expect(clusters).toHaveLength(4)
  })

  it('is deterministic for a given seed', () => {
    const first = getPhraseClustersForLevel(3, 5, new Set(), 42)
    const second = getPhraseClustersForLevel(3, 5, new Set(), 42)
    expect(second).toEqual(first)
  })
})
