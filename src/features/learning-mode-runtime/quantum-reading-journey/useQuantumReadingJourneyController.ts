'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { loadQuantumJourneyChapter } from '@/features/learning-mode-runtime/actions/loadQuantumJourneyChapter'
import { advanceQuantumJourneyStage } from '@/features/learning-mode-runtime/actions/advanceQuantumJourneyStage'
import type { QuantumJourneyStage, QuantumJourneyAssessmentScore } from '@/features/learning-mode-runtime/persistence/quantumJourneySessionRecord'
import { trackEvent } from '@/lib/analytics/track'
import type { WordExerciseAsset, ChunkExerciseAsset, AssessmentExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { PhraseAsset, SentenceAsset, ParagraphAsset } from '@/core/universal-learning-engine/learning-assets'

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading Experience
// Integration™. The Reading Journey Controller — sequences the three
// Tier-1 stages and persists progress; never duplicates engine logic
// (every real exercise mechanic lives inside the reused, unmodified
// engine functions/components the stage wrappers call — see
// QuantumJourney*Stage.tsx). `TransitionUiStage` values are purely local
// UI beats (Objective 6) — never persisted, never confused with the real,
// persisted `QuantumJourneyStage` values.
export type TransitionUiStage =
  | 'transition-to-word-flash'
  | 'transition-to-chunk-reading'
  | 'transition-to-phrase-reading'
  | 'transition-to-sentence-reading'
  | 'transition-to-paragraph-reading'
  | 'transition-to-reading-sprint'
  | 'transition-to-assessment'
  | 'transition-to-complete'
export type UiStage = QuantumJourneyStage | TransitionUiStage

export type QuantumJourneyControllerState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ready'
      documentId: string
      documentTitle: string
      chapterOrder: number
      totalChapters: number
      wordAssets: readonly WordExerciseAsset[]
      documentWordAssets: readonly WordExerciseAsset[]
      chunkAssets: readonly ChunkExerciseAsset[]
      documentChunkAssets: readonly ChunkExerciseAsset[]
      assessmentAssets: readonly AssessmentExerciseAsset[]
      phraseAssets: readonly PhraseAsset[]
      sentenceAssets: readonly SentenceAsset[]
      paragraphAssets: readonly ParagraphAsset[]
      documentPhraseAssets: readonly PhraseAsset[]
      documentSentenceAssets: readonly SentenceAsset[]
      chapterContent: string
      uiStage: UiStage
      assessmentScore: QuantumJourneyAssessmentScore | null
      didResume: boolean
      // Real elapsed wall-clock time since this chapter started, set once
      // at Chapter Complete — never a persisted field (Objective 8's own
      // "reading time" figure, computed, not stored, per this sprint's
      // "no architecture changes" scope).
      readingTimeMinutes: number
    }

const TRANSITION_MS = 1100

export type QuantumReadingJourneyController = {
  state: QuantumJourneyControllerState
  startChapter: () => void
  handleWordFlashComplete: (result: RuntimeResult) => void
  handleChunkReadingComplete: (result: RuntimeResult) => void
  handlePhraseReadingComplete: (result: RuntimeResult) => void
  handleSentenceReadingComplete: (result: RuntimeResult) => void
  handleParagraphReadingComplete: () => void
  handleReadingSprintComplete: (wpm: number) => void
  handleAssessmentComplete: (correct: number, total: number) => void
  skipStage: (from: 'word-flash' | 'chunk-reading' | 'phrase-reading' | 'sentence-reading' | 'paragraph-reading' | 'reading-sprint' | 'assessment') => void
  goToNextChapter: () => void
  retry: () => void
}

export function useQuantumReadingJourneyController(documentId: string, initialChapterOrder = 0): QuantumReadingJourneyController {
  const [state, setState] = useState<QuantumJourneyControllerState>({ kind: 'loading' })
  const sessionIdRef = useRef<string | null>(null)
  const chapterOrderRef = useRef(0)
  const startedAtRef = useRef<number>(0)
  const currentUiStageRef = useRef<UiStage | null>(null)

  useEffect(() => {
    currentUiStageRef.current = state.kind === 'ready' ? state.uiStage : null
  }, [state])

  // Real journey-abandonment tracking (Objective 9) — fires only when a
  // learner leaves mid-journey (started, not yet at chapter-complete),
  // never on a normal chapter-complete unmount or before anything started.
  useEffect(() => {
    return () => {
      const stage = currentUiStageRef.current
      if (stage !== null && stage !== 'chapter-ready' && stage !== 'chapter-complete') {
        trackEvent('qsr_journey_abandoned', { documentId, chapterOrder: chapterOrderRef.current, uiStage: stage })
      }
    }
  }, [documentId])

  // Perceived-performance (Objective 14): the chapter this document is
  // about to need next, fetched in the background while the learner is
  // still reading the Chapter Complete screen — see handleAssessmentComplete.
  // Real prefetch, not a guess: it's the exact same loadQuantumJourneyChapter
  // call goToNextChapter would otherwise make, just started earlier.
  const prefetchedRef = useRef<{ chapterOrder: number; promise: ReturnType<typeof loadQuantumJourneyChapter> } | null>(null)

  const applyChapterResult = useCallback((result: Awaited<ReturnType<typeof loadQuantumJourneyChapter>>) => {
    if (!result.success) {
      setState({ kind: 'error', message: result.error })
      return
    }
    sessionIdRef.current = result.sessionId
    chapterOrderRef.current = result.chapterOrder
    startedAtRef.current = Date.now()
    const didResume = result.sessionId !== null && result.progress.stage !== 'chapter-ready'
    setState({
      kind: 'ready',
      documentId: result.documentId,
      documentTitle: result.documentTitle,
      chapterOrder: result.chapterOrder,
      totalChapters: result.totalChapters,
      wordAssets: result.wordAssets,
      documentWordAssets: result.documentWordAssets,
      chunkAssets: result.chunkAssets,
      documentChunkAssets: result.documentChunkAssets,
      assessmentAssets: result.assessmentAssets,
      phraseAssets: result.phraseAssets,
      sentenceAssets: result.sentenceAssets,
      paragraphAssets: result.paragraphAssets,
      documentPhraseAssets: result.documentPhraseAssets,
      documentSentenceAssets: result.documentSentenceAssets,
      chapterContent: result.chapterContent,
      uiStage: result.progress.stage,
      assessmentScore: result.progress.assessmentScore,
      didResume,
      readingTimeMinutes: 0,
    })
    trackEvent(didResume ? 'qsr_journey_resumed' : 'qsr_journey_started', { documentId, chapterOrder: result.chapterOrder })
  }, [documentId])

  const loadChapter = useCallback(
    (chapterOrder: number) => {
      const prefetched = prefetchedRef.current
      if (prefetched !== null && prefetched.chapterOrder === chapterOrder) {
        prefetchedRef.current = null
        setState({ kind: 'loading' })
        prefetched.promise.then(applyChapterResult)
        return
      }
      setState({ kind: 'loading' })
      loadQuantumJourneyChapter({ documentId, chapterOrder }).then(applyChapterResult)
    },
    [documentId, applyChapterResult],
  )

  useEffect(() => {
    loadChapter(initialChapterOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadChapter, documentId])

  const persist = useCallback(
    (partial: {
      stage: QuantumJourneyStage
      wordFlashCompleted: boolean
      chunkReadingCompleted: boolean
      phraseReadingCompleted: boolean
      sentenceReadingCompleted: boolean
      paragraphReadingCompleted: boolean
      readingSprintCompleted: boolean
      assessmentCompleted: boolean
      assessmentScore: QuantumJourneyAssessmentScore | null
    }) => {
      return advanceQuantumJourneyStage({ documentId, chapterOrder: chapterOrderRef.current, sessionId: sessionIdRef.current, ...partial }).then((result) => {
        if (result.success) sessionIdRef.current = result.sessionId
      })
    },
    [documentId],
  )

  const setUiStage = useCallback((uiStage: UiStage) => {
    setState((current) => (current.kind === 'ready' ? { ...current, uiStage } : current))
  }, [])

  // QSR-INTEGRATION-1 — every persist() call carries every completion
  // flag so far, in the exact real order the required journey defines:
  // Word Flash → Chunk Reading → Phrase → Sentence → Paragraph → Reading
  // Sprint → (existing, unchanged) comprehension check → Chapter Complete.
  const startChapter = useCallback(() => {
    setUiStage('transition-to-word-flash')
    persist({
      stage: 'word-flash',
      wordFlashCompleted: false,
      chunkReadingCompleted: false,
      phraseReadingCompleted: false,
      sentenceReadingCompleted: false,
      paragraphReadingCompleted: false,
      readingSprintCompleted: false,
      assessmentCompleted: false,
      assessmentScore: null,
    })
    setTimeout(() => setUiStage('word-flash'), TRANSITION_MS)
  }, [setUiStage, persist])

  const handleWordFlashComplete = useCallback(
    (_result: RuntimeResult) => {
      trackEvent('qsr_journey_word_flash_completed', { documentId, chapterOrder: chapterOrderRef.current })
      setUiStage('transition-to-chunk-reading')
      persist({
        stage: 'chunk-reading',
        wordFlashCompleted: true,
        chunkReadingCompleted: false,
        phraseReadingCompleted: false,
        sentenceReadingCompleted: false,
        paragraphReadingCompleted: false,
        readingSprintCompleted: false,
        assessmentCompleted: false,
        assessmentScore: null,
      })
      setTimeout(() => setUiStage('chunk-reading'), TRANSITION_MS)
    },
    [documentId, setUiStage, persist],
  )

  const handleChunkReadingComplete = useCallback(
    (_result: RuntimeResult) => {
      trackEvent('qsr_journey_chunk_reading_completed', { documentId, chapterOrder: chapterOrderRef.current })
      setUiStage('transition-to-phrase-reading')
      persist({
        stage: 'phrase-reading',
        wordFlashCompleted: true,
        chunkReadingCompleted: true,
        phraseReadingCompleted: false,
        sentenceReadingCompleted: false,
        paragraphReadingCompleted: false,
        readingSprintCompleted: false,
        assessmentCompleted: false,
        assessmentScore: null,
      })
      setTimeout(() => setUiStage('phrase-reading'), TRANSITION_MS)
    },
    [documentId, setUiStage, persist],
  )

  const handlePhraseReadingComplete = useCallback((_result: RuntimeResult) => {
    trackEvent('qsr_journey_phrase_reading_completed', { documentId, chapterOrder: chapterOrderRef.current })
    setUiStage('transition-to-sentence-reading')
    persist({
      stage: 'sentence-reading',
      wordFlashCompleted: true,
      chunkReadingCompleted: true,
      phraseReadingCompleted: true,
      sentenceReadingCompleted: false,
      paragraphReadingCompleted: false,
      readingSprintCompleted: false,
      assessmentCompleted: false,
      assessmentScore: null,
    })
    setTimeout(() => setUiStage('sentence-reading'), TRANSITION_MS)
  }, [documentId, setUiStage, persist])

  const handleSentenceReadingComplete = useCallback((_result: RuntimeResult) => {
    trackEvent('qsr_journey_sentence_reading_completed', { documentId, chapterOrder: chapterOrderRef.current })
    setUiStage('transition-to-paragraph-reading')
    persist({
      stage: 'paragraph-reading',
      wordFlashCompleted: true,
      chunkReadingCompleted: true,
      phraseReadingCompleted: true,
      sentenceReadingCompleted: true,
      paragraphReadingCompleted: false,
      readingSprintCompleted: false,
      assessmentCompleted: false,
      assessmentScore: null,
    })
    setTimeout(() => setUiStage('paragraph-reading'), TRANSITION_MS)
  }, [documentId, setUiStage, persist])

  const handleParagraphReadingComplete = useCallback(() => {
    trackEvent('qsr_journey_paragraph_reading_completed', { documentId, chapterOrder: chapterOrderRef.current })
    setUiStage('transition-to-reading-sprint')
    persist({
      stage: 'reading-sprint',
      wordFlashCompleted: true,
      chunkReadingCompleted: true,
      phraseReadingCompleted: true,
      sentenceReadingCompleted: true,
      paragraphReadingCompleted: true,
      readingSprintCompleted: false,
      assessmentCompleted: false,
      assessmentScore: null,
    })
    setTimeout(() => setUiStage('reading-sprint'), TRANSITION_MS)
  }, [documentId, setUiStage, persist])

  const handleReadingSprintComplete = useCallback(
    (wpm: number) => {
      trackEvent('qsr_journey_reading_sprint_completed', { documentId, chapterOrder: chapterOrderRef.current, wpm })
      setUiStage('transition-to-assessment')
      persist({
        stage: 'assessment',
        wordFlashCompleted: true,
        chunkReadingCompleted: true,
        phraseReadingCompleted: true,
        sentenceReadingCompleted: true,
        paragraphReadingCompleted: true,
        readingSprintCompleted: true,
        assessmentCompleted: false,
        assessmentScore: null,
      })
      setTimeout(() => setUiStage('assessment'), TRANSITION_MS)
    },
    [documentId, setUiStage, persist],
  )

  const handleAssessmentComplete = useCallback(
    (correct: number, total: number) => {
      const assessmentScore: QuantumJourneyAssessmentScore = { correct, total }
      trackEvent('qsr_journey_assessment_completed', { documentId, chapterOrder: chapterOrderRef.current, correct, total })
      const readingTimeMinutes = Math.round((Date.now() - startedAtRef.current) / 60000)
      trackEvent('qsr_journey_chapter_completed', { documentId, chapterOrder: chapterOrderRef.current, durationMs: Date.now() - startedAtRef.current })
      setState((current) => (current.kind === 'ready' ? { ...current, uiStage: 'transition-to-complete', assessmentScore, readingTimeMinutes } : current))
      const nextChapterOrder = chapterOrderRef.current + 1
      persist({
        stage: 'chapter-complete',
        wordFlashCompleted: true,
        chunkReadingCompleted: true,
        phraseReadingCompleted: true,
        sentenceReadingCompleted: true,
        paragraphReadingCompleted: true,
        readingSprintCompleted: true,
        assessmentCompleted: true,
        assessmentScore,
      }).then(() => {
        // Only starts once the completion write has actually landed —
        // loadQuantumJourneyChapter's own server-side gate checks the
        // PREVIOUS chapter's real completed status, so prefetching before
        // that write lands could be honestly (if confusingly) rejected.
        prefetchedRef.current = { chapterOrder: nextChapterOrder, promise: loadQuantumJourneyChapter({ documentId, chapterOrder: nextChapterOrder }) }
      })
      setTimeout(() => setUiStage('chapter-complete'), TRANSITION_MS)
    },
    [documentId, setUiStage, persist],
  )

  // A stage the Builder couldn't fill with real content (Objective 7) —
  // never blocks the whole chapter, always advances honestly.
  const skipStage = useCallback(
    (from: 'word-flash' | 'chunk-reading' | 'phrase-reading' | 'sentence-reading' | 'paragraph-reading' | 'reading-sprint' | 'assessment') => {
      if (from === 'word-flash') handleWordFlashComplete({ metrics: { correctCount: 0, totalCount: 0 } } as unknown as RuntimeResult)
      else if (from === 'chunk-reading') handleChunkReadingComplete({ metrics: { correctCount: 0, totalCount: 0 } } as unknown as RuntimeResult)
      else if (from === 'phrase-reading') handlePhraseReadingComplete({ metrics: { correctCount: 0, totalCount: 0 } } as unknown as RuntimeResult)
      else if (from === 'sentence-reading') handleSentenceReadingComplete({ metrics: { correctCount: 0, totalCount: 0 } } as unknown as RuntimeResult)
      else if (from === 'paragraph-reading') handleParagraphReadingComplete()
      else if (from === 'reading-sprint') handleReadingSprintComplete(0)
      else handleAssessmentComplete(0, 0)
    },
    [handleWordFlashComplete, handleChunkReadingComplete, handlePhraseReadingComplete, handleSentenceReadingComplete, handleParagraphReadingComplete, handleReadingSprintComplete, handleAssessmentComplete],
  )

  const goToNextChapter = useCallback(() => {
    loadChapter(chapterOrderRef.current + 1)
  }, [loadChapter])

  return {
    state,
    startChapter,
    handleWordFlashComplete,
    handleChunkReadingComplete,
    handlePhraseReadingComplete,
    handleSentenceReadingComplete,
    handleParagraphReadingComplete,
    handleReadingSprintComplete,
    handleAssessmentComplete,
    skipStage,
    goToNextChapter,
    retry: () => loadChapter(chapterOrderRef.current),
  }
}
