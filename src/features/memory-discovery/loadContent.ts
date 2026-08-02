// Memory Discovery™ content loader.
//
// Every piece of content is fetched from the platform's existing Universal
// Intelligence Dataset™ (getContentForExercise, in datasetEngine.ts) at the
// caller-supplied Adaptive Difficulty Engine™ tier. Side-effect imports
// below register the word/sentence datasets this module queries (reused
// as-is from Reading Discovery / Flash Intelligence) plus the lanes this
// feature needed (visual-icon, everyday-object, scene, and additional
// sentence-recall entries — see each dataset file for why those are
// genuinely new, not duplicates of anything).
//
// A pure factory: no localStorage/window access here. The caller (the
// 'use client' orchestrator) reads the difficulty tier AND the recently-
// shown content ids itself and passes both in — see
// MemoryDiscoveryExperience.tsx and recentContentHistory.ts.
//
// Memory Discovery Scientific Foundation™ (Sprint-1.5) — Number Memory
// and Pattern & Sequence no longer draw from a curated dataset at all:
// digit spans and shape sequences are real, procedurally-generated tasks
// (`digitSpan.ts`/`patternSequence.ts`).
//
// Adaptive Memory Coach™ (Sprint-3) FIX-02/FIX-03/FIX-06 — "Every
// completed challenge should influence the next one... avoid static
// progression." This used to be one function computing every mission's
// content upfront, at mount, before a single real challenge had happened
// — structurally incapable of reacting to how the session actually goes.
// It's now `createMemoryContentSession`, a stateful factory whose
// per-mission methods the orchestrator calls LAZILY, one at a time,
// right before each mission starts — each call can take a real
// `MemoryDifficultyAdjustment` (computed from every real mission
// completed so far by `AdaptiveMemoryCoach`) and generate genuinely
// different content for it. The shared exclusion Sets that used to live
// as local variables inside one big function now live as closure state
// on the session object, so cross-mission "never repeat the same real
// item" guarantees are unchanged.

import '@/features/flash-intelligence/wordFlashDataset'
import '@/features/reading-discovery/sentenceDataset'
import './visualIconDataset'
import './objectDataset'
import './sceneDataset'
import './sentenceRecallDataset'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { increaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'
import { shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { ContentItem, ContentType, DatasetCategory, DifficultyTier } from '@/types/exercise-engine'
import type { SceneMetadata } from './sceneDataset'
import type { ChoiceQuestion } from './types'
import type { MemoryDifficultyAdjustment } from './adaptiveMemoryCoach'
import { generateDigitSpanRounds, type DigitSpanRound } from './digitSpan'
import { generateOrderDecoys, generatePatternSequence, type PatternSequenceRound } from './patternSequence'
import { generateThemedVisualSet, generateThemedWordSet, pickNextTheme, type UmceTheme } from '@/lib/exercise-engine/umce/universalMemoryContentEngine'
import { getRecentThemes, recordThemeUsed } from '@/lib/exercise-engine/umce/themeRotationHistory'

// The neutral, no-adjustment default — every loader behaves exactly as
// it did before Sprint-3 when called without a real coach adjustment
// (e.g. the very first mission of a session, before any evidence exists).
const NEUTRAL_ADJUSTMENT: MemoryDifficultyAdjustment = { itemCountDelta: 0, observationMultiplier: 1, richerContent: false }

const LOCALE = 'en' as const

// Fixed, short prompts — discovery language ("what feels familiar"),
// never exam language ("what is correct" / "which one appeared").
const SENTENCE_RECALL_PROMPT = 'What feels familiar?'
const PATTERN_SEQUENCE_PROMPT = 'Select the order you saw.'

// Dataset content is stored lowercase; Memory Discovery's approved UI
// displays title-case single items, so this is a display-only transform,
// never a change to the shared dataset itself.
function toTitleCase(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

type SentenceRecallMetadata = { similarSentences: string[] }

function isSentenceRecallMetadata(metadata: Record<string, unknown> | undefined): metadata is SentenceRecallMetadata {
  return (
    Array.isArray(metadata?.similarSentences) &&
    metadata.similarSentences.every((sentence): sentence is string => typeof sentence === 'string')
  )
}

function isSceneMetadata(metadata: Record<string, unknown> | undefined): metadata is SceneMetadata {
  return (
    typeof metadata?.title === 'string' &&
    Array.isArray(metadata.objects) &&
    metadata.objects.every((object): object is string => typeof object === 'string')
  )
}

// getContentForExercise's excludeIds only dedupes by id — but separately
// authored datasets sometimes register the same content text under
// different ids. Left unhandled, that can surface the same item twice on
// one screen. This tracks content text (not just id) across every pick
// made during one session, over-fetching a small buffer so a few text
// collisions still leave enough items to reach `count`. Same fix as
// Reading Discovery's loadContent.ts.
export function pickUniqueByContent(
  contentType: ContentType,
  tier: DifficultyTier,
  count: number,
  seed: number,
  usedIds: Set<string>,
  usedContent: Set<string>,
  category?: DatasetCategory,
): ContentItem[] {
  const candidates = getContentForExercise({
    contentType,
    locale: LOCALE,
    difficulty: tier,
    count: count * 3,
    excludeIds: Array.from(usedIds),
    seed,
  }).filter((item) => category === undefined || item.categories?.includes(category))

  const picked: ContentItem[] = []
  for (const item of candidates) {
    if (picked.length >= count) break
    const key = item.content.toLowerCase()
    if (usedContent.has(key)) continue
    usedContent.add(key)
    usedIds.add(item.id)
    picked.push(item)
  }
  return picked
}

// Sprint-1.5 FIX-03 — "improve the challenge variety... every session
// should use different word sets... avoid repetition." The real word
// pool's own `categories` field (focus/memory/reading) is the only real
// thematic signal available without inventing a parallel word dataset —
// alternating which one this session draws from (seeded, so it's a real
// choice, not always the same slice) is a modest, honest source of real
// variety, not a fabricated "12 categories" claim.
const WORD_MEMORY_CATEGORIES = ['focus', 'memory', 'reading'] as const

function pickWordMemoryCategory(seed: number): (typeof WORD_MEMORY_CATEGORIES)[number] {
  return WORD_MEMORY_CATEGORIES[Math.abs(seed) % WORD_MEMORY_CATEGORIES.length]!
}

// Adaptive Memory Coach™ (Sprint-3) FIX-02 — a real, clamped shown-item
// count: the mission's own base count, nudged by the real coach delta,
// floored so a mission never becomes trivially short even after a real
// struggle streak.
function adaptiveItemCount(base: number, adjustment: MemoryDifficultyAdjustment, min: number): number {
  return Math.max(min, base + adjustment.itemCountDelta)
}

// FIX-03 — "Increase distractor similarity... richer patterns." More real
// decoys is a real, honest way to make discrimination genuinely harder
// (more plausible near-misses in the grid), never a fabricated
// difficulty number.
function adaptiveDecoyCount(base: number, adjustment: MemoryDifficultyAdjustment): number {
  return adjustment.richerContent ? base + 2 : base
}

// Universal Memory Content Engine™ (UMCE, Sprint-4) FIX-03/FIX-04/FIX-06 —
// a real theme is the PRIMARY source for Visual Memory, Word Memory, and
// Shape Recognition; the existing curated dataset stays as an honest
// fallback whenever one theme's own real pack (8 visuals / 14 words) is
// smaller than a mission's real adaptive count — never a repeat, never a
// fabricated extra item. Draws from a real, shared pool string-by-string
// so the SAME dedupe Set a mission already uses for its dataset draw
// (`visualIconUsedContent`/a per-call word Set) also governs themed
// picks, keeping the "never show the same real item twice" guarantee
// unchanged.
function pickFromThemedPool(pool: readonly string[], count: number, usedContent: Set<string>, usedIds: Set<string>, themeIdPrefix: string): string[] {
  const picked: string[] = []
  for (const content of pool) {
    if (picked.length >= count) break
    const key = content.toLowerCase()
    if (usedContent.has(key)) continue
    usedContent.add(key)
    usedIds.add(`${themeIdPrefix}-${key}`)
    picked.push(content)
  }
  return picked
}

export type MemoryContentSession = {
  loadVisualMemory: (adjustment?: MemoryDifficultyAdjustment) => { items: readonly string[]; choices: readonly string[] }
  loadWordMemory: (adjustment?: MemoryDifficultyAdjustment) => { items: readonly string[]; choices: readonly string[] }
  loadNumberMemory: (adjustment?: MemoryDifficultyAdjustment) => { rounds: readonly DigitSpanRound[] }
  loadPatternSequence: (adjustment?: MemoryDifficultyAdjustment) => { round: PatternSequenceRound; question: ChoiceQuestion }
  loadSentenceRecall: () => { sentence: string; question: ChoiceQuestion }
  loadImageRecall: (adjustment?: MemoryDifficultyAdjustment) => { sceneTitle: string; items: readonly string[]; choices: readonly string[] }
  loadShapeRecognition: (adjustment?: MemoryDifficultyAdjustment) => { items: readonly string[]; choices: readonly string[] }
  // Every id actually flashed this session (not decoys), accumulated as
  // each real mission's content is generated — the caller persists this
  // via recordShownContentIds once the whole session ends, so the next
  // replay can deprioritize it.
  getShownContentIds: () => readonly string[]
}

// Adaptive Memory Coach™ (Sprint-3) — the one real, stateful content
// session a Memory Discovery run uses. Every `load*` method is called
// lazily, exactly once, right before its own mission starts — never all
// upfront — so each real call can honestly reflect however the session
// has actually gone so far.
export function createMemoryContentSession(tier: DifficultyTier = 'beginner', recentlyShownIds: readonly string[] = []): MemoryContentSession {
  const seed = Date.now()
  const shownContentIds: string[] = []
  // Real cross-mission exclusion — Shape Recognition (Recognition &
  // Recall) draws from the same real `visual-icon` pool Visual Memory
  // uses, so this Set carries forward whatever Visual Memory already
  // showed, exactly as the old single-function version did.
  const visualIconUsedIds = new Set<string>(recentlyShownIds)
  const visualIconUsedContent = new Set<string>()

  // UMCE (Sprint-4) FIX-10 — one real theme per mission, never repeating
  // a theme already used earlier in THIS session, on top of the real
  // cross-session recency window `getRecentThemes()` provides. Recorded
  // immediately (not batched at session end) so even an abandoned
  // session still contributes real rotation history for whatever
  // mission actually ran.
  const priorSessionThemes = getRecentThemes()
  const usedThemesThisSession: UmceTheme[] = []
  function pickSessionTheme(themeSeed: number): UmceTheme {
    const theme = pickNextTheme([...priorSessionThemes, ...usedThemesThisSession], themeSeed)
    usedThemesThisSession.push(theme)
    recordThemeUsed(theme)
    return theme
  }

  function loadVisualMemory(adjustment: MemoryDifficultyAdjustment = NEUTRAL_ADJUSTMENT): { items: readonly string[]; choices: readonly string[] } {
    const shownCount = adaptiveItemCount(6, adjustment, 4)
    const decoyCount = adaptiveDecoyCount(4, adjustment)
    const effectiveTier = adjustment.richerContent ? increaseDifficulty(tier) : tier

    const theme = pickSessionTheme(seed + 25)
    const themedPool = generateThemedVisualSet({ theme, count: shownCount + decoyCount, seed: seed + 26 })
    const themedShown = pickFromThemedPool(themedPool, shownCount, visualIconUsedContent, visualIconUsedIds, `umce-${theme}`)
    const themedDecoys = pickFromThemedPool(themedPool, decoyCount, visualIconUsedContent, visualIconUsedIds, `umce-${theme}`)

    // Honest fallback — a theme's own real 8-visual pack can run short
    // once shown + decoys are both drawn from it; the existing curated
    // `visual-icon` dataset fills whatever real gap remains, never a
    // repeat.
    const shownFallback =
      themedShown.length < shownCount
        ? pickUniqueByContent('visual-icon', effectiveTier, shownCount - themedShown.length, seed, visualIconUsedIds, visualIconUsedContent)
        : []
    const decoyFallback =
      themedDecoys.length < decoyCount
        ? pickUniqueByContent('visual-icon', effectiveTier, decoyCount - themedDecoys.length, seed + 1, visualIconUsedIds, visualIconUsedContent)
        : []

    const items = [...themedShown, ...shownFallback.map((item) => item.content)]
    shownContentIds.push(...themedShown.map((content) => `umce-${theme}-${content.toLowerCase()}`), ...shownFallback.map((item) => item.id))
    return {
      items,
      choices: shuffleArray([...items, ...themedDecoys, ...decoyFallback.map((item) => item.content)], seed + 13),
    }
  }

  function loadWordMemory(adjustment: MemoryDifficultyAdjustment = NEUTRAL_ADJUSTMENT): { items: readonly string[]; choices: readonly string[] } {
    const shownCount = adaptiveItemCount(6, adjustment, 4)
    const decoyCount = adaptiveDecoyCount(4, adjustment)
    // FIX-03 — "use less familiar vocabulary gradually": a real tier
    // bump draws from a genuinely harder, less-common real word pool.
    const effectiveTier = adjustment.richerContent ? increaseDifficulty(tier) : tier
    const wordUsedIds = new Set<string>(recentlyShownIds)
    const wordUsedContent = new Set<string>()

    const theme = pickSessionTheme(seed + 27)
    const themedPool = generateThemedWordSet({ theme, count: shownCount + decoyCount, seed: seed + 28 })
    const themedShown = pickFromThemedPool(themedPool, shownCount, wordUsedContent, wordUsedIds, `umce-${theme}`)
    const themedDecoys = pickFromThemedPool(themedPool, decoyCount, wordUsedContent, wordUsedIds, `umce-${theme}`)

    let shownFallback =
      themedShown.length < shownCount
        ? pickUniqueByContent('word', effectiveTier, shownCount - themedShown.length, seed + 2, wordUsedIds, wordUsedContent, pickWordMemoryCategory(seed + 2))
        : []
    if (themedShown.length + shownFallback.length < shownCount) {
      // Honestly under-filled from one category too — fall back to the
      // full pool rather than repeating or leaving the mission short.
      shownFallback = pickUniqueByContent('word', effectiveTier, shownCount - themedShown.length, seed + 2, wordUsedIds, wordUsedContent)
    }
    const decoyFallback =
      themedDecoys.length < decoyCount
        ? pickUniqueByContent('word', effectiveTier, decoyCount - themedDecoys.length, seed + 3, wordUsedIds, wordUsedContent)
        : []

    const items = [...themedShown.map(toTitleCase), ...shownFallback.map((item) => toTitleCase(item.content))]
    shownContentIds.push(...themedShown.map((content) => `umce-${theme}-${content.toLowerCase()}`), ...shownFallback.map((item) => item.id))
    return {
      items,
      choices: shuffleArray([...items, ...themedDecoys.map(toTitleCase), ...decoyFallback.map((item) => toTitleCase(item.content))], seed + 14),
    }
  }

  function loadNumberMemory(adjustment: MemoryDifficultyAdjustment = NEUTRAL_ADJUSTMENT): { rounds: readonly DigitSpanRound[] } {
    // Sprint-1.5 FIX-02 — procedurally generated, not drawn from a
    // curated dataset, so it has no `usedIds` to track here.
    // Sprint-3 FIX-03 — "increase digit length": real, richer sessions
    // (a real strong prior performance) draw rounds from one real tier
    // higher, which `generateDigitSpanRounds` already turns into real
    // extra, longer bonus rounds.
    const effectiveTier = adjustment.richerContent ? increaseDifficulty(tier) : tier
    return { rounds: generateDigitSpanRounds(effectiveTier, seed + 7) }
  }

  function loadPatternSequence(adjustment: MemoryDifficultyAdjustment = NEUTRAL_ADJUSTMENT): { round: PatternSequenceRound; question: ChoiceQuestion } {
    // FIX-03 — "increase sequence complexity": a real tier bump feeds
    // `generatePatternSequence`'s own real tier-based length table.
    const effectiveTier = adjustment.richerContent ? increaseDifficulty(tier) : tier
    const round = generatePatternSequence(effectiveTier, seed + 17)
    const decoyCount = adjustment.richerContent ? 3 : 2
    const decoys = generateOrderDecoys(round, decoyCount, seed + 18)
    const options = shuffleArray(
      [round.sequence, ...decoys].map((sequence, index) => ({ id: `pattern-sequence-option-${index}`, label: sequence.join(' ') })),
      seed + 19,
    )
    return { round, question: { id: 'pattern-sequence-question', prompt: PATTERN_SEQUENCE_PROMPT, options } }
  }

  function loadSentenceRecall(): { sentence: string; question: ChoiceQuestion } {
    // Fetch a generous buffer since the 'sentence' pool also contains
    // Reading Discovery's entries, which don't carry this metadata. No
    // adaptive lever here — each real record's own authored
    // `similarSentences` decoy set is fixed, not dynamically expandable.
    const sentenceCandidates = getContentForExercise({
      contentType: 'sentence',
      locale: LOCALE,
      difficulty: tier,
      count: 20,
      excludeIds: Array.from(recentlyShownIds),
      seed: seed + 6,
    })
    const sentenceItem = sentenceCandidates.find((item) => isSentenceRecallMetadata(item.metadata))
    if (sentenceItem === undefined || !isSentenceRecallMetadata(sentenceItem.metadata)) {
      throw new Error('Memory Discovery sentence-recall dataset returned no usable sentence+decoys set.')
    }
    const options = shuffleArray(
      [sentenceItem.content, ...sentenceItem.metadata.similarSentences].map((label, index) => ({ id: `${sentenceItem.id}-option-${index}`, label })),
      seed + 11,
    )
    shownContentIds.push(sentenceItem.id)
    return { sentence: sentenceItem.content, question: { id: sentenceItem.id, prompt: SENTENCE_RECALL_PROMPT, options } }
  }

  function loadImageRecall(adjustment: MemoryDifficultyAdjustment = NEUTRAL_ADJUSTMENT): { sceneTitle: string; items: readonly string[]; choices: readonly string[] } {
    // One scene's real object cluster + real decoy objects pulled from
    // the shared everyday-object pool, excluding anything already in the
    // scene itself. FIX-03 — richer sessions get more real decoys (a
    // harder discrimination task), never a different, fabricated scene.
    const sceneCandidates = getContentForExercise({
      contentType: 'scene',
      locale: LOCALE,
      difficulty: tier,
      count: 1,
      excludeIds: Array.from(recentlyShownIds),
      seed: seed + 9,
    })
    const sceneItem = sceneCandidates[0]
    if (sceneItem === undefined || !isSceneMetadata(sceneItem.metadata)) {
      throw new Error('Memory Discovery scene dataset returned no usable scene for Image Recall.')
    }
    const sceneObjectsLower = new Set(sceneItem.metadata.objects.map((object) => object.toLowerCase()))
    const decoyCount = adaptiveDecoyCount(4, adjustment)
    const decoys = pickUniqueByContent('everyday-object', tier, decoyCount, seed + 10, new Set(), new Set(sceneObjectsLower))
    const items = sceneItem.metadata.objects.map(toTitleCase)
    shownContentIds.push(sceneItem.id)
    return {
      sceneTitle: sceneItem.metadata.title,
      items,
      choices: shuffleArray([...items, ...decoys.map((item) => toTitleCase(item.content))], seed + 16),
    }
  }

  function loadShapeRecognition(adjustment: MemoryDifficultyAdjustment = NEUTRAL_ADJUSTMENT): { items: readonly string[]; choices: readonly string[] } {
    // Sprint-1.5 FIX-05 — shapes/colours, drawn from the same real
    // `visual-icon` pool Visual Memory uses, excluding whatever that
    // mission (and this one) already showed this session. UMCE
    // (Sprint-4) — its own real theme, distinct from whatever Visual
    // Memory already picked this session (`pickSessionTheme` excludes
    // it), so Recognition & Recall doesn't just replay the same theme.
    const shownCount = adaptiveItemCount(5, adjustment, 3)
    const decoyCount = adaptiveDecoyCount(4, adjustment)
    const effectiveTier = adjustment.richerContent ? increaseDifficulty(tier) : tier

    const theme = pickSessionTheme(seed + 29)
    const themedPool = generateThemedVisualSet({ theme, count: shownCount + decoyCount, seed: seed + 30 })
    const themedShown = pickFromThemedPool(themedPool, shownCount, visualIconUsedContent, visualIconUsedIds, `umce-${theme}`)
    const themedDecoys = pickFromThemedPool(themedPool, decoyCount, visualIconUsedContent, visualIconUsedIds, `umce-${theme}`)

    const shownFallback =
      themedShown.length < shownCount
        ? pickUniqueByContent('visual-icon', effectiveTier, shownCount - themedShown.length, seed + 21, visualIconUsedIds, visualIconUsedContent)
        : []
    const decoyFallback =
      themedDecoys.length < decoyCount
        ? pickUniqueByContent('visual-icon', effectiveTier, decoyCount - themedDecoys.length, seed + 22, visualIconUsedIds, visualIconUsedContent)
        : []

    const items = [...themedShown, ...shownFallback.map((item) => item.content)]
    shownContentIds.push(...themedShown.map((content) => `umce-${theme}-${content.toLowerCase()}`), ...shownFallback.map((item) => item.id))
    return {
      items,
      choices: shuffleArray([...items, ...themedDecoys, ...decoyFallback.map((item) => item.content)], seed + 23),
    }
  }

  return {
    loadVisualMemory,
    loadWordMemory,
    loadNumberMemory,
    loadPatternSequence,
    loadSentenceRecall,
    loadImageRecall,
    loadShapeRecognition,
    getShownContentIds: () => shownContentIds,
  }
}
