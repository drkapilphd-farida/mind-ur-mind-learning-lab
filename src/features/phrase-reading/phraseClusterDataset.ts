// Phrase Reading™ Meaning Clusters — the dataset that makes this mission's
// Brain Challenges genuinely different from Chunk Reading's. Chunk
// Reading's distractors are 3 OTHER, unrelated chunks from the same round
// (tests "did you see this"). Phrase Reading's distractors are always
// near-identical variants of the exact phrase, one word apart (tests "did
// you register the exact meaning, not just the topic") — so content here
// is authored as CLUSTERS: a family of phrases that share almost every
// word, each member independently real and grammatical, none a fabricated
// near-miss.
//
// Clusters carry three OPTIONAL fields on top of `members` — missingWord,
// completion, meaningMatch — used by the Challenge Library
// (phraseChallengeLibrary.ts) for challenge types 2-4. These are hand
// authored, not derived from `members` (a cluster's members are curated
// for near-miss recognition testing; a fill-in-the-blank or paraphrase
// question benefits from its own, independently chosen wording). A
// cluster missing a given field simply isn't eligible for that challenge
// type — phraseEngine.ts falls back to Exact Recognition when a round's
// clusters don't support the type that got picked, never fabricating a
// blank/paraphrase on the fly.
//
// Deliberately bypasses the generic content-registry (createDataset /
// getContentForExercise / DifficultyTier fallback). That pipeline is built
// around flat, interchangeable pools — exactly what would let two members
// of the same cluster get separated across a tier-fallback merge, or two
// DIFFERENT clusters' members get shuffled into the same round undetected.
// A cluster's members must never scatter; keeping this as its own small,
// explicitly level-keyed structure with its own resolver
// (getPhraseClustersForLevel) guarantees that, while still leaving the same
// seam a future dynamic source (live AI generation, PDF/book extraction)
// would implement — the resolver's signature, and these same optional
// fields, are exactly the contract such a source would need to fill.

import { pickItems } from '@/lib/exercise-engine/randomizationEngine'
import type { PhraseReadingLevel } from './phraseDifficulty'

export type PhraseCluster = {
  members: readonly string[] // 4+ near-identical phrases, one word apart; any member can be the stimulus
  // "Increase Reading ______" + [Speed, Memory, Focus, Knowledge] — one
  // word blanked, learner supplies it. Challenge Type 2.
  missingWord?: { template: string; options: readonly string[] }
  // "Develop ______" + [Deep Focus, Reading Speed, Better Memory, Sharp
  // Attention] — a shared stem, several possible completions. Type 3.
  completion?: { stem: string; options: readonly string[] }
  // "Increase Reading Speed" -> correct paraphrase "Read Faster" among 3
  // differently-meaning distractors. Type 4 — the only type where the
  // correct option is NOT a near-miss of the stimulus.
  meaningMatch?: { correctParaphrase: string; distractors: readonly string[] }
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── Level 1 — simple action phrases (2 words) ──────────────────────────────
const LEVEL_1_CLUSTERS: readonly PhraseCluster[] = [
  { members: ['read faster', 'think faster', 'react faster', 'read slower'] },
  {
    members: ['stay focused', 'stay calm', 'stay alert', 'stay motivated'],
    missingWord: { template: 'Stay ______', options: ['Focused', 'Calm', 'Alert', 'Motivated'] },
  },
  { members: ['learn quickly', 'learn deeply', 'learn easily', 'memorize quickly'] },
  {
    members: ['build focus', 'build memory', 'build confidence', 'build speed'],
    missingWord: { template: 'Build ______', options: ['Focus', 'Memory', 'Confidence', 'Speed'] },
  },
  {
    members: ['boost energy', 'boost memory', 'boost focus', 'boost mood'],
    missingWord: { template: 'Boost ______', options: ['Energy', 'Memory', 'Focus', 'Mood'] },
  },
  { members: ['act faster', 'decide faster', 'respond faster', 'move faster'] },
  { members: ['read daily', 'practice daily', 'study daily', 'train daily'] },
  { members: ['focus now', 'relax now', 'rest now', 'breathe now'] },
  {
    members: ['improve focus', 'improve memory', 'improve speed', 'improve skill'],
    missingWord: { template: 'Improve ______', options: ['Focus', 'Memory', 'Speed', 'Skill'] },
  },
  { members: ['try harder', 'work harder', 'think harder', 'push harder'] },
  { members: ['deep focus', 'sharp focus', 'quiet focus', 'deep energy'] },
  { members: ['clear thinking', 'clear speech', 'clear vision', 'clear memory'] },
  { members: ['daily practice', 'daily reading', 'daily focus', 'daily training'] },
]

// ── Level 2 — learning phrases (3 words) ────────────────────────────────────
const LEVEL_2_CLUSTERS: readonly PhraseCluster[] = [
  {
    members: ['increase reading speed', 'increase learning speed', 'improve reading speed', 'increase reading skill'],
    missingWord: { template: 'Increase Reading ______', options: ['Speed', 'Memory', 'Focus', 'Knowledge'] },
  },
  {
    members: ['develop strong focus', 'develop sharp focus', 'build strong focus', 'develop strong memory'],
    completion: { stem: 'Develop ______', options: ['Deep Focus', 'Reading Speed', 'Better Memory', 'Sharp Attention'] },
  },
  { members: ['expand visual span', 'expand visual range', 'expand mental span', 'narrow visual span'] },
  { members: ['strengthen working memory', 'strengthen short memory', 'strengthen working focus', 'weaken working memory'] },
  {
    members: ['build lasting habits', 'build daily habits', 'build strong habits', 'break lasting habits'],
    completion: { stem: 'Build ______', options: ['Lasting Habits', 'Daily Focus', 'Strong Memory', 'Quick Confidence'] },
  },
  { members: ['improve mental clarity', 'improve mental focus', 'improve visual clarity', 'reduce mental clarity'] },
  {
    members: ['sharpen your attention', 'sharpen your memory', 'sharpen your thinking', 'soften your attention'],
    missingWord: { template: 'Sharpen Your ______', options: ['Attention', 'Memory', 'Thinking', 'Focus'] },
  },
  {
    members: ['accelerate skill growth', 'accelerate memory growth', 'accelerate reading growth', 'slow skill growth'],
    completion: { stem: 'Accelerate ______', options: ['Skill Growth', 'Memory Growth', 'Reading Growth', 'Visual Growth'] },
  },
  {
    members: ['deepen your focus', 'deepen your practice', 'deepen your understanding', 'widen your focus'],
    missingWord: { template: 'Deepen Your ______', options: ['Focus', 'Practice', 'Understanding', 'Confidence'] },
  },
  { members: ['train visual attention', 'train verbal attention', 'train visual memory', 'train visual speed'] },
]

// ── Level 3 — meaning-rich phrases (4 words) ────────────────────────────────
const LEVEL_3_CLUSTERS: readonly PhraseCluster[] = [
  {
    members: ['improve long term memory', 'improve short term memory', 'boost long term memory', 'improve long term focus'],
    missingWord: { template: 'Improve Long Term ______', options: ['Memory', 'Focus', 'Speed', 'Confidence'] },
    meaningMatch: {
      correctParaphrase: 'Strengthen Lasting Memory',
      distractors: ['Improve Short Focus', 'Reduce Daily Stress', 'Increase Reading Speed'],
    },
  },
  { members: ['increase visual processing speed', 'increase verbal processing speed', 'increase visual processing power', 'decrease visual processing speed'] },
  {
    members: ['develop lasting reading confidence', 'develop lasting reading fluency', 'build lasting reading confidence', 'develop lasting writing confidence'],
    completion: { stem: 'Develop Lasting Reading ______', options: ['Confidence', 'Fluency', 'Speed', 'Memory'] },
  },
  {
    members: ['strengthen deep comprehension skills', 'strengthen deep memory skills', 'strengthen deep focus skills', 'weaken deep comprehension skills'],
    meaningMatch: {
      correctParaphrase: 'Build Strong Understanding',
      distractors: ['Improve Visual Speed', 'Reduce Mental Fatigue', 'Increase Daily Practice'],
    },
  },
  { members: ['enhance rapid visual recognition', 'enhance rapid verbal recognition', 'enhance rapid visual response', 'reduce rapid visual recognition'] },
  {
    members: ['build consistent reading habits', 'build consistent study habits', 'build consistent daily habits', 'break consistent reading habits'],
    missingWord: { template: 'Build Consistent ______ Habits', options: ['Reading', 'Study', 'Daily', 'Writing'] },
  },
  {
    members: ['expand working memory capacity', 'expand short term capacity', 'expand working memory speed', 'reduce working memory capacity'],
    completion: { stem: 'Expand Working Memory ______', options: ['Capacity', 'Speed', 'Focus', 'Range'] },
  },
  {
    members: ['improve overall reading fluency', 'improve overall reading accuracy', 'improve overall writing fluency', 'reduce overall reading fluency'],
    meaningMatch: {
      correctParaphrase: 'Read More Smoothly Overall',
      distractors: ['Increase Vocabulary Size', 'Improve Short Term Memory', 'Build Stronger Focus'],
    },
  },
  {
    members: ['increase sustained mental focus', 'increase sustained mental energy', 'increase brief mental focus', 'decrease sustained mental focus'],
    missingWord: { template: 'Increase Sustained Mental ______', options: ['Focus', 'Energy', 'Speed', 'Confidence'] },
  },
  { members: ['develop stronger pattern recognition', 'develop stronger visual recognition', 'develop weaker pattern recognition', 'develop stronger sound recognition'] },
  {
    members: ['accelerate long term retention', 'accelerate short term retention', 'accelerate long term recall', 'slow long term retention'],
    completion: { stem: 'Accelerate Long Term ______', options: ['Retention', 'Recall', 'Focus', 'Growth'] },
  },
  { members: ['improve natural reading rhythm', 'improve natural reading speed', 'improve forced reading rhythm', 'reduce natural reading rhythm'] },
  { members: ['build stronger learning habits', 'build stronger reading habits', 'build weaker learning habits', 'build stronger study habits'] },
  {
    members: ['increase visual recognition speed', 'increase verbal recognition speed', 'increase visual recognition power', 'decrease visual recognition speed'],
    missingWord: { template: 'Increase Visual Recognition ______', options: ['Speed', 'Power', 'Range', 'Focus'] },
  },
  {
    members: ['develop instant pattern recognition', 'develop instant visual recognition', 'develop slow pattern recognition', 'develop instant sound recognition'],
    completion: { stem: 'Develop Instant Pattern ______', options: ['Recognition', 'Memory', 'Focus', 'Speed'] },
  },
]

// ── Level 4 — extended phrases (5 words) ────────────────────────────────────
// Restructured from an earlier version of this level that used full,
// capitalized, period-terminated sentences — that shape is exactly what
// made the mission feel like it had already become Sentence Reading before
// the learner ever got there. Level 4 now stays firmly in phrase territory:
// longer (5 words) than Level 3, but still lowercase fragments with no
// terminal punctuation, matching Levels 1-3's shape exactly.
const LEVEL_4_CLUSTERS: readonly PhraseCluster[] = [
  {
    members: ['practice every day with consistency', 'practice every day with patience', 'read every day with consistency', 'study every day with consistency'],
    missingWord: { template: 'Practice Every Day With ______', options: ['Consistency', 'Patience', 'Hesitation', 'Distraction'] },
  },
  {
    members: ['strengthen memory through active reading', 'strengthen focus through active reading', 'strengthen memory through passive reading', 'weaken memory through active reading'],
    meaningMatch: {
      correctParaphrase: 'Reading Actively Builds Memory',
      distractors: ['Reading Passively Builds Speed', 'Writing Daily Builds Focus', 'Resting Often Builds Memory'],
    },
  },
  {
    members: ['develop faster visual processing skills', 'develop faster verbal processing skills', 'develop slower visual processing skills', 'build faster visual processing skills'],
    completion: { stem: 'Develop Faster Visual Processing ______', options: ['Skills', 'Habits', 'Speed', 'Focus'] },
  },
  { members: ['build confidence through consistent practice', 'build confidence through consistent effort', 'build memory through consistent practice', 'lose confidence through consistent practice'] },
  {
    members: ['train your mind to focus', 'train your mind to relax', 'train your body to focus', 'train your mind to wander'],
    missingWord: { template: 'Train Your Mind To ______', options: ['Focus', 'Relax', 'Wander', 'Panic'] },
  },
  { members: ['recognize patterns faster through practice', 'recognize patterns faster through rest', 'recognize patterns slower through practice', 'recognize sounds faster through practice'] },
  {
    members: ['expand attention span with practice', 'expand memory span with practice', 'shrink attention span with practice', 'expand attention span with rest'],
    completion: { stem: 'Expand Attention Span With ______', options: ['Practice', 'Rest', 'Distraction', 'Guessing'] },
  },
  {
    members: ['improve comprehension through active engagement', 'improve comprehension through passive engagement', 'improve memory through active engagement', 'reduce comprehension through active engagement'],
    meaningMatch: {
      correctParaphrase: 'Engaging Actively Improves Comprehension',
      distractors: ['Staying Passive Improves Focus', 'Reading Slowly Improves Memory', 'Resting Often Improves Comprehension'],
    },
  },
  {
    members: ['strengthen focus with daily sessions', 'strengthen memory with daily sessions', 'strengthen focus with weekly sessions', 'weaken focus with daily sessions'],
    missingWord: { template: 'Strengthen Focus With Daily ______', options: ['Sessions', 'Breaks', 'Meetings', 'Delays'] },
  },
  { members: ['build reading stamina through practice', 'build reading speed through practice', 'build reading stamina through rest', 'lose reading stamina through practice'] },
  {
    members: ['sharpen recognition skills with exercises', 'sharpen recognition skills with lectures', 'sharpen memory skills with exercises', 'dull recognition skills with exercises'],
    completion: { stem: 'Sharpen Recognition Skills With ______', options: ['Exercises', 'Lectures', 'Breaks', 'Meetings'] },
  },
  { members: ['develop instinctive recognition through exposure', 'develop instinctive recognition through practice', 'develop slow recognition through exposure', 'lose instinctive recognition through exposure'] },
]

// ── Level 5 (legacy, inert) — superseded by "Advanced Phrase Reading" ──────
// This remix of Level 2-4 clusters was the mission's old Level 5. Level 5
// is now "Advanced Phrase Reading" — a dedicated 6-8 word phrase pool with
// its own engine (see phraseAdvancedLibrary.ts / phraseAdvancedEngine.ts),
// ported from Sentence Reading's cross-pool-distractor Challenge Library.
// PhraseReadingExperience.tsx no longer reads Level 5 through
// getPhraseClustersForLevel. Kept here, untouched, rather than deleted —
// per "do not delete code, reuse everything" — and still exercised by this
// file's own generic per-level tests, but no longer reachable from the
// live mission.
const LEVEL_5_CLUSTERS: readonly PhraseCluster[] = [
  ...LEVEL_2_CLUSTERS.slice(0, 4),
  ...LEVEL_3_CLUSTERS.slice(0, 4),
  ...LEVEL_4_CLUSTERS.slice(0, 4),
  { members: ['expand your reading range', 'expand your reading pace', 'expand your writing range', 'narrow your reading range'] },
  { members: ['Adaptive practice builds real mastery.', 'Adaptive practice builds real habits.', 'Fixed practice builds real mastery.', 'Adaptive practice avoids real mastery.'] },
]

export const PHRASE_LEVEL_CLUSTERS: Record<PhraseReadingLevel, readonly PhraseCluster[]> = {
  1: LEVEL_1_CLUSTERS,
  2: LEVEL_2_CLUSTERS,
  3: LEVEL_3_CLUSTERS,
  4: LEVEL_4_CLUSTERS,
  5: LEVEL_5_CLUSTERS,
}

// Picks `count` distinct clusters for one reading round, preferring
// clusters with no member already shown this session (excludeMembers) so a
// fresh attempt — and a retry — both feel different. Falls back to the
// full level pool (allowing reuse) rather than under-filling a round when
// exclusion would leave too few — the same "never fabricate, degrade
// gracefully" principle every dataset in this codebase already follows.
export function getPhraseClustersForLevel(
  level: PhraseReadingLevel,
  count: number,
  excludeMembers: ReadonlySet<string> = new Set(),
  seed = 1,
): PhraseCluster[] {
  const pool = PHRASE_LEVEL_CLUSTERS[level]
  const fresh = pool.filter((cluster) => cluster.members.every((m) => !excludeMembers.has(m)))
  const candidatePool = fresh.length >= count ? fresh : pool
  return pickItems(candidatePool, count, seed)
}

// QSR-ENGINE-SWAP-1 — additive sibling to getPhraseClustersForLevel, same
// exact selection logic, sourced from a caller-supplied pool instead of
// PHRASE_LEVEL_CLUSTERS[level]. Mirrors getContentFromPool's own real
// precedent (Progressive Chunk Reading™, Sprint QSR-2.6) — the hardcoded
// per-level path above is completely untouched.
export function getPhraseClustersFromPool(
  pool: readonly PhraseCluster[],
  count: number,
  excludeMembers: ReadonlySet<string> = new Set(),
  seed = 1,
): PhraseCluster[] {
  const fresh = pool.filter((cluster) => cluster.members.every((m) => !excludeMembers.has(m)))
  const candidatePool = fresh.length >= count ? fresh : pool
  return pickItems(candidatePool, count, seed)
}

export { wordCount as phraseClusterWordCount }
