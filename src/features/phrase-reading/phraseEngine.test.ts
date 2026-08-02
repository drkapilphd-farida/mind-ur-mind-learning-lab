import { describe, it, expect } from 'vitest'
import type { PhraseCluster } from './phraseClusterDataset'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { PHRASE_READING_DATASET } from './phraseDataset'
import {
  buildPhraseReadingRound,
  computePhraseLevelPassed,
  computePhraseReadingRhythm,
  computePhraseSessionWpm,
  computePhraseWpmImprovement,
  totalWordsInPhrases,
} from './phraseEngine'

function cluster(a: string, b: string, c: string, d: string): PhraseCluster {
  return { members: [a, b, c, d] }
}

const SAMPLE_CLUSTERS: PhraseCluster[] = [
  cluster('increase reading speed', 'increase learning speed', 'improve reading speed', 'increase reading skill'),
  cluster('develop strong focus', 'develop sharp focus', 'build strong focus', 'develop strong memory'),
  cluster('expand visual span', 'expand visual range', 'expand mental span', 'narrow visual span'),
  cluster('build lasting habits', 'build daily habits', 'build strong habits', 'break lasting habits'),
]

describe('buildPhraseReadingRound', () => {
  it('shows exactly one member per cluster, drawn from that cluster', () => {
    const round = buildPhraseReadingRound(SAMPLE_CLUSTERS, 1, 1)
    expect(round.phrases).toHaveLength(SAMPLE_CLUSTERS.length)
    for (const phrase of round.phrases) {
      expect(SAMPLE_CLUSTERS.some((c) => c.members.includes(phrase))).toBe(true)
    }
  })

  it('a question\'s distractors are the OTHER, unshown members of the SAME cluster as its stimulus — never a different cluster', () => {
    const round = buildPhraseReadingRound(SAMPLE_CLUSTERS, 4, 7)
    for (const question of round.questions) {
      const owningCluster = SAMPLE_CLUSTERS.find((c) => c.members.includes(question.stimulus))
      expect(owningCluster).toBeDefined()
      for (const option of question.options) {
        expect(owningCluster!.members).toContain(option)
      }
      expect(question.options[question.correctIndex]).toBe(question.stimulus)
      expect(new Set(question.options).size).toBe(4)
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildPhraseReadingRound(SAMPLE_CLUSTERS, 2, 99)
    const second = buildPhraseReadingRound(SAMPLE_CLUSTERS, 2, 99)
    expect(second).toEqual(first)
  })

  it('returns an empty round (never fabricates) when given no clusters', () => {
    const round = buildPhraseReadingRound([], 1, 1)
    expect(round.phrases).toEqual([])
    expect(round.questions).toEqual([])
  })

  it('skips a question rather than fabricating distractors when a cluster has fewer than 4 members', () => {
    const round = buildPhraseReadingRound([{ members: ['only one member'] }], 1, 1)
    expect(round.questions).toHaveLength(0)
  })

  it('defaults to exact-recognition and reports it back on the round', () => {
    const round = buildPhraseReadingRound(SAMPLE_CLUSTERS, 1, 1)
    expect(round.challengeType).toBe('exact-recognition')
  })
})

describe('buildPhraseReadingRound — Challenge Library type-aware question building', () => {
  const CLUSTERS_WITH_FIELDS: PhraseCluster[] = [
    {
      members: ['increase reading speed', 'increase learning speed', 'improve reading speed', 'increase reading skill'],
      missingWord: { template: 'Increase Reading ______', options: ['Speed', 'Memory', 'Focus', 'Knowledge'] },
      completion: { stem: 'Increase Reading ______', options: ['Speed', 'Memory Power', 'Sharp Focus', 'Deep Knowledge'] },
      meaningMatch: { correctParaphrase: 'Read Faster', distractors: ['Improve Memory', 'Read Slowly', 'Learn Better'] },
    },
    ...SAMPLE_CLUSTERS,
  ]

  it('missing-word: stimulus is the template, options are the authored options, correct answer is options[0]', () => {
    const round = buildPhraseReadingRound(CLUSTERS_WITH_FIELDS, 1, 5, 'missing-word')
    expect(round.challengeType).toBe('missing-word')
    expect(round.questions).toHaveLength(1)
    const q = round.questions[0]!
    expect(q.stimulus).toBe('Increase Reading ______')
    expect(new Set(q.options)).toEqual(new Set(['Speed', 'Memory', 'Focus', 'Knowledge']))
    expect(q.options[q.correctIndex]).toBe('Speed')
  })

  it('phrase-completion: stimulus is the stem, correct answer is options[0]', () => {
    const round = buildPhraseReadingRound(CLUSTERS_WITH_FIELDS, 1, 5, 'phrase-completion')
    expect(round.challengeType).toBe('phrase-completion')
    const q = round.questions[0]!
    expect(q.stimulus).toBe('Increase Reading ______')
    expect(q.options[q.correctIndex]).toBe('Speed')
  })

  it('meaning-match: stimulus is the re-shown phrase, correct answer is the authored paraphrase, distractors are NOT near-miss variants of the stimulus', () => {
    const round = buildPhraseReadingRound(CLUSTERS_WITH_FIELDS, 1, 5, 'meaning-match')
    expect(round.challengeType).toBe('meaning-match')
    const q = round.questions[0]!
    expect(round.phrases).toContain(q.stimulus) // the re-shown phrase was actually shown during Practice
    expect(q.options[q.correctIndex]).toBe('Read Faster')
    expect(q.options).not.toContain(q.stimulus) // unlike exact-recognition, the answer is a paraphrase, not the stimulus itself
  })

  it('phrase-order: correct answer is whichever of 4 chosen phrases appeared earliest in the actual reading order', () => {
    const round = buildPhraseReadingRound(CLUSTERS_WITH_FIELDS, 1, 5, 'phrase-order')
    expect(round.challengeType).toBe('phrase-order')
    const q = round.questions[0]!
    const correctPhrase = q.options[q.correctIndex]!
    const earliestIndex = Math.min(...q.options.map((o) => round.phrases.indexOf(o)))
    expect(round.phrases.indexOf(correctPhrase)).toBe(earliestIndex)
  })

  it('phrase-order needs no cluster-level data — works even when no cluster has any optional field', () => {
    const round = buildPhraseReadingRound(SAMPLE_CLUSTERS, 1, 5, 'phrase-order')
    expect(round.challengeType).toBe('phrase-order')
    expect(round.questions).toHaveLength(1)
  })

  it('falls back to exact-recognition when none of this round\'s clusters support the requested type', () => {
    const round = buildPhraseReadingRound(SAMPLE_CLUSTERS, 1, 5, 'meaning-match') // SAMPLE_CLUSTERS has no meaningMatch field
    expect(round.challengeType).toBe('exact-recognition')
    expect(round.questions).toHaveLength(1)
    expect(round.questions[0]!.options).toContain(round.questions[0]!.stimulus)
  })

  it('falls back to exact-recognition for phrase-order when the round has fewer than 4 shown phrases', () => {
    const round = buildPhraseReadingRound(CLUSTERS_WITH_FIELDS.slice(0, 2), 1, 5, 'phrase-order')
    expect(round.challengeType).toBe('exact-recognition')
  })

  it('is deterministic per type for a given seed', () => {
    const first = buildPhraseReadingRound(CLUSTERS_WITH_FIELDS, 1, 77, 'missing-word')
    const second = buildPhraseReadingRound(CLUSTERS_WITH_FIELDS, 1, 77, 'missing-word')
    expect(second).toEqual(first)
  })
})

describe('computePhraseLevelPassed', () => {
  it('passes when correctCount meets or exceeds passCount', () => {
    expect(computePhraseLevelPassed(2, 2)).toBe(true)
    expect(computePhraseLevelPassed(3, 2)).toBe(true)
  })

  it('fails when correctCount falls short of passCount', () => {
    expect(computePhraseLevelPassed(1, 2)).toBe(false)
    expect(computePhraseLevelPassed(0, 5)).toBe(false)
  })

  it('matches the locked Level 1 requirement: 2/4 passes, 1/4 does not', () => {
    expect(computePhraseLevelPassed(2, 2)).toBe(true)
    expect(computePhraseLevelPassed(1, 2)).toBe(false)
  })

  it('matches the locked Level 5 requirement: 5/6 passes, 4/6 does not', () => {
    expect(computePhraseLevelPassed(5, 5)).toBe(true)
    expect(computePhraseLevelPassed(4, 5)).toBe(false)
  })
})

describe('computePhraseReadingRhythm', () => {
  it('returns Building when accuracy is below the required threshold', () => {
    expect(computePhraseReadingRhythm(70, 85, true)).toBe('Building')
    expect(computePhraseReadingRhythm(70, 85, null)).toBe('Building')
  })

  it('returns Accelerating when accuracy clears the threshold and pace increased', () => {
    expect(computePhraseReadingRhythm(90, 85, true)).toBe('Accelerating')
  })

  it('returns Stable when accuracy clears the threshold and pace did not increase', () => {
    expect(computePhraseReadingRhythm(90, 85, false)).toBe('Stable')
    expect(computePhraseReadingRhythm(90, 85, null)).toBe('Stable')
  })
})

describe('computePhraseSessionWpm', () => {
  it('computes real words-per-minute from total words and total time', () => {
    expect(computePhraseSessionWpm(100, 30_000)).toBe(200)
  })

  it('returns 0 when there is no elapsed time', () => {
    expect(computePhraseSessionWpm(100, 0)).toBe(0)
  })
})

describe('computePhraseWpmImprovement', () => {
  it('returns null when there is no previous session', () => {
    expect(computePhraseWpmImprovement(200, null, 90, 85)).toBeNull()
  })

  it('returns null when this session did not clear the accuracy threshold, even if faster', () => {
    expect(computePhraseWpmImprovement(300, 200, 70, 85)).toBeNull()
  })

  it('returns the real delta when accuracy cleared the threshold', () => {
    expect(computePhraseWpmImprovement(250, 200, 90, 85)).toBe(50)
    expect(computePhraseWpmImprovement(180, 200, 90, 85)).toBe(-20)
  })
})

describe('totalWordsInPhrases', () => {
  it('sums word counts across every phrase', () => {
    expect(totalWordsInPhrases(['two words', 'three word phrase', 'one'])).toBe(6)
  })

  it('returns 0 for no phrases', () => {
    expect(totalWordsInPhrases([])).toBe(0)
  })
})

// Regression guard for PCR's (locked) dependency on this exact, untouched
// file — Progressive Chunk Reading's Level 4/5 import phraseDataset.ts
// directly for content. Kept here even though this mission's own engine no
// longer reads from it, purely as insurance that mission never breaks.
describe('curated phrase dataset (PHRASE_READING_DATASET — untouched, still feeds Progressive Chunk Reading™)', () => {
  it('every item is a complete, grammatically whole sentence', () => {
    for (const item of PHRASE_READING_DATASET.items) {
      expect(isVisuallyValid(item.content, 'option')).toBe(true)
      expect(item.content.trim()).toMatch(/[.!?]$/)
    }
  })

  it('has enough content at every distinct word count the dataset declares', () => {
    const wordCounts: Array<{ tier: string; wordCount: number }> = [
      { tier: 'beginner', wordCount: 3 },
      { tier: 'easy', wordCount: 4 },
      { tier: 'advanced', wordCount: 5 },
      { tier: 'elite', wordCount: 6 },
    ]
    for (const { tier, wordCount } of wordCounts) {
      const atTier = PHRASE_READING_DATASET.items.filter((i) => i.difficulty === tier)
      expect(atTier.length).toBeGreaterThanOrEqual(4)
      for (const item of atTier) {
        expect(item.content.split(/\s+/).filter(Boolean)).toHaveLength(wordCount)
      }
    }
  })
})
