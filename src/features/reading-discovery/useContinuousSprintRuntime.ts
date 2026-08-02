'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { DifficultyTier } from '@/types/exercise-engine'
import { dispatchPerformanceSignal } from '@/features/discover-learning-potential/intelligence/dispatchPerformanceSignal'
import type { LearningIntelligenceEngine } from '@/features/discover-learning-potential/intelligence/LearningIntelligenceEngine'
import { computeLiveWpm } from '@/features/quantum-speed-reading/readingSessionEngine'
import { clampToRealisticWpm } from './clampToRealisticWpm'
import { localSprintContentProvider } from './localSprintContentProvider'
import { SPRINT_RUNTIME_CONFIG, type ReadingSprintId } from './readingSprints'
import { computeSprintXpAward } from './computeSprintXpAward'
import { computeNextComboState, INITIAL_COMBO_STATE, type ComboState } from './computeComboState'
import { computeProgressivePaceMultiplier } from './computeProgressivePace'
import type { SprintContentItem } from './sprintContentProvider'

export type SprintRuntimeStatus = 'running' | 'complete'

export type SprintRuntimeCompletion = {
  finalWpm: number | null
  xpEarned: number
  combo: number
  // Sprint-2.6B FIX-16 — real fraction (0-1) of this Sprint's own real
  // comprehension questions answered correctly; `null` for Sprints with
  // no questions at all (Word/Phrase/Sentence). Internal signal only —
  // feeds the new Reading Intelligence Model's "Effective Reading
  // Performance," never shown as a pass/fail score in the UI.
  questionAccuracy: number | null
}

export type UseContinuousSprintRuntimeResult = {
  currentItem: SprintContentItem | null
  currentItemDurationMs: number | null
  itemIndex: number
  totalItems: number
  secondsLeft: number
  combo: number
  xp: number
  wpm: number | null
  status: SprintRuntimeStatus
  hesitationDetected: boolean
  onOptionSelect: (optionId: string) => void
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

// Sprint-2.5 FIX-01 (CRITICAL) — every real reading Sprint is now
// word-count-scaled at its own real per-word rate (previously Word/Phrase
// used a flat per-item time regardless of word count — the real root
// cause of "Phrase Sprint feels the same as Word Sprint, ~52 WPM": a real
// 2-word phrase at a flat 2200ms computes to ~55 WPM). Per-word rate
// alone sets the real WPM ceiling (WPM = 60000/msPerWord, independent of
// item length), so each Sprint now has its own genuinely faster rate —
// "I'm now reading groups of words instead of individual words" becomes
// a real, felt difference, not just a label.
const MIN_ITEM_DISPLAY_MS = 280
const WORD_MS_PER_WORD = 400
// Sprint-2.6 FIX-07 — "Phrase Sprint must clearly feel faster than Word
// Sprint... Speed must continuously increase. Never stop around 52 WPM."
// Tightened again from Sprint-2.5's own first pass: a lower per-word rate
// and lower floor make every phrase item visibly snappier than a single
// word, not just nominally scaled.
const PHRASE_MS_PER_WORD = 260
const PHRASE_MIN_MS = 380
const PHRASE_MAX_MS = 2200
const SENTENCE_MS_PER_WORD = 260
const SENTENCE_MIN_MS = 1400
const SENTENCE_MAX_MS = 3400
const PARAGRAPH_MS_PER_WORD = 220
const PARAGRAPH_MIN_MS = 4200
const PARAGRAPH_MAX_MS = 8000
const OPTION_AUTO_ADVANCE_DELAY_MS = 200
// Sprint-2.5 FIX-01/FIX-06 — live WPM is now a real *rolling* average
// over the last few real items, not a lifetime-since-session-start
// average. The old lifetime average was diluted for a long time by
// Progressive Pace™'s own real, slower warm-up items — the exact reason
// "maximum speed remains very low" even once later items sped up. A
// rolling window reflects the *current* real pace, which is what
// actually gradually increases.
const WPM_ROLLING_WINDOW_SIZE = 6

function baseDisplayDurationMs(sprint: ReadingSprintId, item: SprintContentItem): number {
  if (item.kind === 'question') return 0
  const wordCount = countWords(item.text)
  switch (sprint) {
    case 'word':
      return wordCount * WORD_MS_PER_WORD
    case 'phrase':
      return Math.max(PHRASE_MIN_MS, Math.min(PHRASE_MAX_MS, wordCount * PHRASE_MS_PER_WORD))
    case 'sentence':
      return Math.max(SENTENCE_MIN_MS, Math.min(SENTENCE_MAX_MS, wordCount * SENTENCE_MS_PER_WORD))
    case 'paragraph':
      return Math.max(PARAGRAPH_MIN_MS, Math.min(PARAGRAPH_MAX_MS, wordCount * PARAGRAPH_MS_PER_WORD))
    case 'meaning':
      return 0
  }
}

function pickCountInRange(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

// Reading Runtime Engine™, corrected across Sprint-2 Part-2A/2B/2.5 —
// the one real, reusable continuous-runtime engine every Sprint's UI
// sits on top of. Real state: a real queued `items[]` (sized per
// `SPRINT_RUNTIME_CONFIG`, sourced only through `SprintContentProvider`
// — never a dataset call directly, and never re-asking a real question
// `sharedUsedContentIds` shows was already used earlier this session —
// FIX-03), a real countdown, a real engagement `combo`
// (`computeComboState.ts` — never correctness-based), real accumulated
// `xp`, a real rolling-window live `wpm` (`null` — "Calculating…" —
// until real words have actually been shown), and Progressive Pace™ (a
// real, smooth, per-item ramp that also pauses on real detected
// hesitation). Ends honestly at whichever comes first: the real timer
// reaching 0, or the real item queue being exhausted. Reports its real
// final stats back via `onComplete` so the new Mission Complete screen
// (Sprint-2.5 FIX-05/06) can show them after this component unmounts.
export function useContinuousSprintRuntime(
  sprint: ReadingSprintId,
  tier: DifficultyTier,
  engine: LearningIntelligenceEngine,
  sharedUsedContentIds: Set<string>,
  onComplete: (completion: SprintRuntimeCompletion) => void,
): UseContinuousSprintRuntimeResult {
  const config = SPRINT_RUNTIME_CONFIG[sprint]

  const [items] = useState<readonly SprintContentItem[]>(() => {
    const targetCount = pickCountInRange(config.minItems, config.maxItems)
    const resolvedItems = localSprintContentProvider.getItems(sprint, tier, { targetCount, excludeIds: Array.from(sharedUsedContentIds) })
    for (const item of resolvedItems) sharedUsedContentIds.add(item.id)
    return resolvedItems
  })
  const [sessionDurationS] = useState(() => pickCountInRange(config.minDurationSeconds, config.maxDurationSeconds))
  const [secondsLeft, setSecondsLeft] = useState(sessionDurationS)
  const [itemIndex, setItemIndex] = useState(0)
  const [xp, setXp] = useState(0)
  const [comboState, setComboState] = useState<ComboState>(INITIAL_COMBO_STATE)
  const [status, setStatus] = useState<SprintRuntimeStatus>(items.length > 0 ? 'running' : 'complete')
  const [currentItemDurationMs, setCurrentItemDurationMs] = useState<number | null>(null)
  const [hesitationDetected, setHesitationDetected] = useState(false)
  const [wpm, setWpm] = useState<number | null>(null)

  const itemStartedAtRef = useRef(Date.now())
  const previousDwellRef = useRef<number | null>(null)
  const previousBaseDurationRef = useRef<number | null>(null)
  const recentWordWindowRef = useRef<readonly { words: number; dwellMs: number }[]>([])
  // Sprint-2.6B FIX-16 — real running tally of this Sprint's own real
  // question answers, correct vs total.
  const questionStatsRef = useRef({ correct: 0, total: 0 })
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const currentItem = status !== 'complete' ? (items[itemIndex] ?? null) : null

  // Real countdown — same real backbone `ReadingSprintView.tsx` already uses.
  useEffect(() => {
    if (status === 'complete') return
    if (secondsLeft <= 0) {
      setStatus('complete')
      return
    }
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [status, secondsLeft])

  const finishItem = useCallback((): void => {
    const now = Date.now()
    const dwellMs = now - itemStartedAtRef.current
    const item = items[itemIndex]

    if (item) {
      dispatchPerformanceSignal([(signal) => engine.recordSignal(signal)], {
        domain: 'reading',
        kind: item.kind === 'question' ? 'answer-time' : 'recognition-speed',
        value: dwellMs,
        occurredAt: new Date().toISOString(),
      })
      if (item.kind === 'text') {
        const words = countWords(item.text)
        recentWordWindowRef.current = [...recentWordWindowRef.current, { words, dwellMs }].slice(-WPM_ROLLING_WINDOW_SIZE)
        const recentWords = recentWordWindowRef.current.reduce((sum, entry) => sum + entry.words, 0)
        const recentDwellMs = recentWordWindowRef.current.reduce((sum, entry) => sum + entry.dwellMs, 0)
        setWpm(recentWords > 0 && recentDwellMs > 0 ? clampToRealisticWpm(computeLiveWpm(recentWords, recentDwellMs)) : null)
      }
      setXp((total) => total + computeSprintXpAward(item.kind === 'question' ? 'question' : 'stimulus'))
      setComboState((previous) => computeNextComboState(previous, now))
      previousDwellRef.current = dwellMs
      previousBaseDurationRef.current = currentItemDurationMs
    }

    if (itemIndex + 1 >= items.length) {
      setStatus('complete')
      return
    }

    itemStartedAtRef.current = Date.now()
    setItemIndex((index) => index + 1)
  }, [engine, itemIndex, items, currentItemDurationMs])

  // Auto-timer for real stimulus items (word/phrase/sentence/paragraph —
  // pure reading, no interaction). Reading Understanding's real
  // questions instead advance via `onOptionSelect`.
  useEffect(() => {
    if (status !== 'running' || currentItem === null || currentItem.kind !== 'text') {
      setCurrentItemDurationMs(null)
      return
    }
    const pace = computeProgressivePaceMultiplier({
      itemIndex,
      totalItems: items.length,
      previousDwellMs: previousDwellRef.current,
      previousBaseDurationMs: previousBaseDurationRef.current,
      trend: engine.getAdaptiveEstimate('reading').trend,
    })
    setHesitationDetected(pace.hesitationDetected)
    if (pace.hesitationDetected && previousDwellRef.current !== null) {
      dispatchPerformanceSignal([(signal) => engine.recordSignal(signal)], {
        domain: 'reading',
        kind: 'hesitation',
        value: previousDwellRef.current,
        occurredAt: new Date().toISOString(),
      })
    }
    const durationMs = Math.max(MIN_ITEM_DISPLAY_MS, baseDisplayDurationMs(sprint, currentItem) * pace.multiplier)
    setCurrentItemDurationMs(durationMs)
    const timer = window.setTimeout(finishItem, durationMs)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentItem, sprint, itemIndex])

  const onOptionSelect = useCallback(
    (optionId: string): void => {
      if (status !== 'running' || currentItem === null || currentItem.kind !== 'question') return
      // Sprint-2.6B FIX-16 — real, internal-only correctness check
      // against the question's own real authored answer. Never shown in
      // the UI; only feeds this Sprint's own real `questionAccuracy` and
      // the shared `wrong-answer` signal the Reading Intelligence Model
      // later reads from `LearningIntelligenceEngine`'s snapshot.
      const wasCorrect = optionId === currentItem.question.correctOptionId
      questionStatsRef.current = { correct: questionStatsRef.current.correct + (wasCorrect ? 1 : 0), total: questionStatsRef.current.total + 1 }
      dispatchPerformanceSignal([(signal) => engine.recordSignal(signal)], {
        domain: 'reading',
        kind: 'wrong-answer',
        value: wasCorrect ? 0 : 1,
        occurredAt: new Date().toISOString(),
      })
      window.setTimeout(finishItem, OPTION_AUTO_ADVANCE_DELAY_MS)
    },
    [status, currentItem, finishItem, engine],
  )

  useEffect(() => {
    if (status !== 'complete') return
    const { correct, total } = questionStatsRef.current
    onCompleteRef.current({ finalWpm: wpm, xpEarned: xp, combo: comboState.combo, questionAccuracy: total > 0 ? correct / total : null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return { currentItem, currentItemDurationMs, itemIndex, totalItems: items.length, secondsLeft, combo: comboState.combo, xp, wpm, status, hesitationDetected, onOptionSelect }
}
