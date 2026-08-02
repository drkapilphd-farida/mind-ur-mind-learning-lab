// Advanced Phrase Reading™ Library — Phrase Reading's Level 5 content.
// Ported from Sentence Reading's sentenceLibrary.ts (same `text / topic /
// gloss / keyWord / missingWord? / meaningMatch? / correctEnding?` shape,
// same cross-pool-distractor discipline), but content is genuinely
// different in kind, not just length: every entry here is a 6-8 word
// PHRASE FRAGMENT — gerund/imperative style, no subject + finite-verb
// clause, no terminal punctuation — never a complete sentence. That's the
// one hard rule this level exists to prove: even at its longest, Phrase
// Reading never crosses into "this is basically a sentence."
//
// Topics are drawn from Phrase Reading's own cognitive-training domain
// (focus, memory, recognition, fluency, ...) rather than Sentence
// Reading's broad general-knowledge topics (science, space, history, ...)
// — Advanced Phrase Reading content is, like every level below it, about
// the training itself, not general-knowledge trivia. This keeps Level 5
// thematically continuous with Levels 1-4 rather than importing an
// unrelated topic taxonomy wholesale.
//
// Scope, disclosed: 15 curated phrases (one per topic), matching the same
// "quality over hundreds" volume every dataset in this pack has shipped
// with — enough for real session-to-session variety across a
// 2-phrase-per-attempt structure, expandable later the same way.

import { pickItems } from '@/lib/exercise-engine/randomizationEngine'

export type AdvancedPhraseTopic =
  | 'focus' | 'memory' | 'recognition' | 'comprehension' | 'reading-speed' | 'habits' | 'confidence'
  | 'concentration' | 'processing' | 'fluency' | 'attention' | 'consistency' | 'visual-training'
  | 'mental-clarity' | 'skill-building'

export type AdvancedPhrase = {
  text: string
  topic: AdvancedPhraseTopic
  gloss: string
  keyWord: string
  missingWord?: { template: string; options: readonly string[] }
  meaningMatch?: { correctParaphrase: string; distractors: readonly string[] }
  correctEnding?: { stem: string; options: readonly string[] }
}

const ADVANCED_PHRASES: readonly AdvancedPhrase[] = [
  {
    text: 'reading with complete focus every day',
    topic: 'focus', gloss: 'Focused daily reading', keyWord: 'focus',
    missingWord: { template: 'Reading With Complete ______ Every Day', options: ['Focus', 'Noise', 'Distraction', 'Hesitation'] },
  },
  {
    text: 'building stronger memory through daily practice',
    topic: 'memory', gloss: 'Memory building practice', keyWord: 'memory',
    meaningMatch: { correctParaphrase: 'Daily practice strengthens memory', distractors: ['Daily rest weakens focus', 'Weekly practice reduces speed', 'Daily reading confuses memory'] },
  },
  {
    text: 'developing rapid visual recognition skills naturally',
    topic: 'recognition', gloss: 'Natural visual recognition', keyWord: 'recognition',
    correctEnding: { stem: 'Developing Rapid Visual Recognition Skills...', options: ['Naturally', 'Slowly', 'Rarely', 'Accidentally'] },
  },
  {
    text: 'improving concentration using structured daily reading',
    topic: 'comprehension', gloss: 'Structured concentration training', keyWord: 'concentration',
    missingWord: { template: 'Improving ______ Using Structured Daily Reading', options: ['Concentration', 'Confusion', 'Distraction', 'Hesitation'] },
  },
  {
    text: 'increasing reading speed without losing comprehension',
    topic: 'reading-speed', gloss: 'Faster comprehending reading', keyWord: 'speed',
  },
  {
    text: 'forming lasting reading habits through consistent effort',
    topic: 'habits', gloss: 'Lasting reading habits', keyWord: 'habits',
    meaningMatch: { correctParaphrase: 'Consistent effort forms lasting habits', distractors: ['Random effort forms weak habits', 'Consistent rest forms lasting focus', 'Occasional effort forms strong memory'] },
  },
  {
    text: 'gaining reading confidence through steady daily wins',
    topic: 'confidence', gloss: 'Confidence from small wins', keyWord: 'confidence',
    correctEnding: { stem: 'Gaining Reading Confidence Through Steady Daily...', options: ['Wins', 'Losses', 'Delays', 'Excuses'] },
  },
  {
    text: 'sustaining deep concentration during longer reading sessions',
    topic: 'concentration', gloss: 'Sustained deep concentration', keyWord: 'concentration',
  },
  {
    text: 'speeding up mental processing through repeated exposure',
    topic: 'processing', gloss: 'Faster mental processing', keyWord: 'processing',
    missingWord: { template: 'Speeding Up Mental Processing Through Repeated ______', options: ['Exposure', 'Silence', 'Delay', 'Avoidance'] },
  },
  {
    text: 'reaching natural reading fluency after months of practice',
    topic: 'fluency', gloss: 'Natural fluency milestone', keyWord: 'fluency',
    meaningMatch: { correctParaphrase: 'Months of practice build fluency', distractors: ['Fluency appears without any practice', 'Practice weakens reading fluency slowly', 'Fluency fades after months of rest'] },
  },
  {
    text: 'holding steady attention across an entire reading session',
    topic: 'attention', gloss: 'Steady sustained attention', keyWord: 'attention',
  },
  {
    text: 'staying consistent with practice even on busy days',
    topic: 'consistency', gloss: 'Consistency despite busyness', keyWord: 'consistent',
    correctEnding: { stem: 'Staying Consistent With Practice Even On Busy...', options: ['Days', 'Trips', 'Meetings', 'Holidays'] },
  },
  {
    text: 'training the eyes to move faster across text',
    topic: 'visual-training', gloss: 'Faster eye movement', keyWord: 'eyes',
    missingWord: { template: 'Training The Eyes To Move Faster Across ______', options: ['Text', 'Rooms', 'Roads', 'Screens'] },
  },
  {
    text: 'clearing mental clutter before starting a reading session',
    topic: 'mental-clarity', gloss: 'Clarity before reading', keyWord: 'clarity',
    meaningMatch: { correctParaphrase: 'Clear the mind before reading', distractors: ['Fill the mind before reading', 'Clear the mind after reading', 'Ignore the mind while reading'] },
  },
  {
    text: 'stacking small daily wins into real reading skill',
    topic: 'skill-building', gloss: 'Small wins compound', keyWord: 'skill',
  },
]

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Picks `count` distinct advanced phrases, preferring ones not already
// shown this session so a fresh attempt or retry feels different. Falls
// back to the full pool (allowing reuse) rather than under-filling — the
// same "never fabricate, degrade gracefully" principle every dataset in
// this codebase already follows.
export function getAdvancedPhrasesForLevel(
  count: number,
  excludeTexts: ReadonlySet<string> = new Set(),
  seed = 1,
): AdvancedPhrase[] {
  const fresh = ADVANCED_PHRASES.filter((p) => !excludeTexts.has(p.text))
  const candidatePool = fresh.length >= count ? fresh : ADVANCED_PHRASES
  return pickItems(candidatePool, count, seed)
}

export { ADVANCED_PHRASES, wordCount as advancedPhraseWordCount }
