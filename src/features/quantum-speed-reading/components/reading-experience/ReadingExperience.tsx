'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Passage } from '../../passageLibrary'
import { estimateReadingTimeSec, estimateWpm } from '../../passageDifficulty'
import {
  DEFAULT_READING_PREFERENCES,
  loadReadingPreferences,
  saveReadingPreferences,
  stepFontScale,
  cycleNext,
  READING_THEMES,
  type ReadingPreferences,
  type ReadingWidth,
  type ReadingLineHeight,
  type ReadingGuide,
} from '../../readingPreferences'
import {
  computeLiveWpm,
  formatElapsedTime,
  computeReadingProgressPercent,
  wordsReadThroughLine,
} from '../../readingSessionEngine'
import { saveReadingIntelligenceSession } from '../../adaptive-intelligence/actions/saveReadingIntelligenceSession'
import { computeAttentionSignals } from '../../adaptive-intelligence/attentionSignals'
import { generateSpeedCaution, generateTodaysFocus } from '../../adaptive-intelligence/recommendationEngine'
import { ReadingTopBar } from './ReadingTopBar'
import { ReadingPassageView } from './ReadingPassageView'
import { ReadingControlsBar } from './ReadingControlsBar'
import { ReadingSessionComplete } from './ReadingSessionComplete'
import { ReadingInsightCallout } from '@/components/learning/reading/ReadingInsightCallout'
import { Button } from '@/components/ui/button'

const LAB_HREF = '/labs/quantum-speed-reading'
const TIMER_TICK_MS = 250
const LIGHT_THEMES = READING_THEMES.filter((theme) => theme !== 'dark') as readonly Exclude<ReadingPreferences['theme'], 'dark'>[]

type ReadingPhase = 'reading' | 'paused' | 'complete'

const THEME_WRAPPER_CLASS: Record<ReadingPreferences['theme'], string> = {
  light: 'bg-white text-neutral-900',
  sepia: 'bg-[#f6ecd9] text-[#3d3226]',
  dark: 'bg-[#1a1a1a] text-[#e8e6e2]',
}

type ReadingExperienceProps = {
  passage: Passage
  mode: string | null
}

type ReadingResumeState = {
  scrollTop: number
  elapsedMs: number
  pauseCount: number
  resumeCount: number
  progressPercent: number
  currentLineIndex: number
  phase: ReadingPhase
}

type ReadingInsight = {
  emoji: string
  text: string
}

function resumeStateStorageKey(passageId: string, mode: string | null): string {
  return `qsr-reading-resume-${passageId}-${mode ?? 'default'}`
}

function computeReadingIntelligenceScore(params: {
  attentionScore: number
  completionPercent: number
  actualWpm: number
  targetWpm: number
}): number {
  const { attentionScore, completionPercent, actualWpm, targetWpm } = params
  const speedCloseness = Math.max(0, Math.min(100, 100 - Math.abs(actualWpm - targetWpm) / Math.max(targetWpm, 1) * 100))
  const score = Math.round(
    attentionScore * 0.4 +
    completionPercent * 0.35 +
    speedCloseness * 0.25,
  )
  return Math.max(0, Math.min(100, score))
}

function buildReadingInsight(params: {
  progressPercent: number
  pauseCount: number
  resumeCount: number
  phase: ReadingPhase
}): ReadingInsight | null {
  const { progressPercent, pauseCount, resumeCount, phase } = params

  if (phase !== 'reading') return null
  if (pauseCount > 1 || resumeCount > 1) {
    return {
      emoji: '🔄',
      text: 'You paused and resumed more than once. Try one steady reading burst to rebuild momentum.',
    }
  }
  if (progressPercent < 20) {
    return {
      emoji: '💡',
      text: 'Start strong: use your first paragraphs to lock in meaning before you speed up.',
    }
  }
  if (progressPercent < 50) {
    return {
      emoji: '📖',
      text: 'Good start. Keep a steady rhythm through the middle of the passage.',
    }
  }
  if (progressPercent < 80) {
    return {
      emoji: '⭐',
      text: 'You are past the halfway mark. Maintain focus for a strong finish.',
    }
  }
  if (progressPercent < 100) {
    return {
      emoji: '🏁',
      text: 'Nearly done — finish the passage with attention and a calm pace.',
    }
  }
  return null
}

// Orchestrator — owns phase, elapsed timer, scroll-derived reading
// position, fullscreen state, keyboard shortcuts, and persisted reading
// preferences. Everything below is presentational only. This is not RSVP
// and not auto-paced: the reader scrolls at their own pace; one scroll
// listener derives progress %, live WPM's "words read so far", and which
// paragraph Focus Mode/Reading Guide should highlight.
export function ReadingExperience({ passage, mode }: ReadingExperienceProps): React.JSX.Element {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const endSentinelRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const hasLoadedPreferencesRef = useRef(false)

  const [phase, setPhase] = useState<ReadingPhase>('reading')
  const [elapsedMs, setElapsedMs] = useState(0)
  const elapsedMsRef = useRef(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const [wordsRead, setWordsRead] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [resumeCount, setResumeCount] = useState(0)
  const [savedResumeState, setSavedResumeState] = useState<ReadingResumeState | null>(null)
  const [isSmartResumeVisible, setIsSmartResumeVisible] = useState(false)
  const [hasCheckedResume, setHasCheckedResume] = useState(false)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_READING_PREFERENCES)

  // Preferences are loaded client-side only, after mount, so the
  // server-rendered HTML always starts from safe defaults (no hydration
  // mismatch) — same reasoning usePrefersReducedMotion already relies on.
  useEffect(() => {
    setPreferences(loadReadingPreferences())
    hasLoadedPreferencesRef.current = true
  }, [])

  useEffect(() => {
    if (!hasLoadedPreferencesRef.current) return
    saveReadingPreferences(preferences)
  }, [preferences])

  useEffect(() => {
    const raw = localStorage.getItem(resumeStateStorageKey(passage.id, mode))
    if (!raw) {
      setHasCheckedResume(true)
      return
    }

    try {
      const parsed = JSON.parse(raw) as ReadingResumeState
      if (
        typeof parsed.scrollTop === 'number' &&
        typeof parsed.elapsedMs === 'number' &&
        typeof parsed.pauseCount === 'number' &&
        typeof parsed.resumeCount === 'number' &&
        typeof parsed.progressPercent === 'number' &&
        typeof parsed.currentLineIndex === 'number' &&
        (parsed.phase === 'reading' || parsed.phase === 'paused')
      ) {
        setSavedResumeState(parsed)
        setIsSmartResumeVisible(true)
      }
    } catch {
      // Ignore invalid storage payload.
    } finally {
      setHasCheckedResume(true)
    }
  }, [mode, passage.id])

  useEffect(() => {
    if (!savedResumeState || isSmartResumeVisible || !scrollRef.current) return
    scrollRef.current.scrollTop = savedResumeState.scrollTop
  }, [isSmartResumeVisible, savedResumeState])

  useEffect(() => {
    if (!hasCheckedResume) return
    if (phase === 'complete') {
      localStorage.removeItem(resumeStateStorageKey(passage.id, mode))
      return
    }

    const timer = window.setTimeout(() => {
      const state: ReadingResumeState = {
        scrollTop: scrollRef.current?.scrollTop ?? 0,
        elapsedMs,
        pauseCount,
        resumeCount,
        progressPercent,
        currentLineIndex,
        phase,
      }
      localStorage.setItem(resumeStateStorageKey(passage.id, mode), JSON.stringify(state))
    }, 250)

    return () => window.clearTimeout(timer)
  }, [hasCheckedResume, mode, passage.id, phase, elapsedMs, pauseCount, resumeCount, progressPercent, currentLineIndex])

  const handleAcceptResume = useCallback(() => {
    if (!savedResumeState) return
    setElapsedMs(savedResumeState.elapsedMs)
    elapsedMsRef.current = savedResumeState.elapsedMs
    setPauseCount(savedResumeState.pauseCount)
    setResumeCount(savedResumeState.resumeCount)
    setProgressPercent(savedResumeState.progressPercent)
    setCurrentLineIndex(savedResumeState.currentLineIndex)
    setPhase(savedResumeState.phase)
    setIsSmartResumeVisible(false)
  }, [savedResumeState])

  const handleDismissResume = useCallback(() => {
    localStorage.removeItem(resumeStateStorageKey(passage.id, mode))
    setSavedResumeState(null)
    setIsSmartResumeVisible(false)
  }, [mode, passage.id])

  // Elapsed timer — accumulates only while actively reading. Mirrored into
  // a ref so the completion-detection effect below (subscribed once, not
  // per-tick) can read the current value without re-subscribing.
  useEffect(() => {
    if (phase !== 'reading') return
    const interval = setInterval(() => setElapsedMs((ms) => {
      const next = ms + TIMER_TICK_MS
      elapsedMsRef.current = next
      return next
    }), TIMER_TICK_MS)
    return () => clearInterval(interval)
  }, [phase])

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const el = scrollRef.current
      if (!el) return

      const percent = computeReadingProgressPercent(el.scrollTop, el.scrollHeight, el.clientHeight)
      setProgressPercent(percent)

      const approxWordsRead = Math.round((percent / 100) * passage.wordCount)
      setWordsRead(approxWordsRead)

      let lineIndex = 0
      for (let i = 0; i < passage.lines.length; i++) {
        lineIndex = i
        if (wordsReadThroughLine(passage.lines, i) >= approxWordsRead) break
      }
      setCurrentLineIndex(lineIndex)
    })
  }, [passage.lines, passage.wordCount])

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  }, [])

  // Completion is detected via a sentinel rendered right after the last
  // paragraph, observed against the scroll container. This correctly
  // handles both a long passage the reader scrolls all the way through AND
  // a short passage that already fits entirely on screen (where no scroll
  // event would ever fire) — the sentinel is intersecting from the first
  // render in that case. To avoid completing a short passage the instant
  // it mounts, completion never fires before the passage's own honest
  // estimated reading time (estimateReadingTimeSec, same pacing shown on
  // the Prepare screen) has actually elapsed — a long passage will already
  // have exceeded that by the time a reader scrolls to the bottom, so this
  // is only ever perceptible for short passages, where it's the point.
  useEffect(() => {
    const root = scrollRef.current
    const target = endSentinelRef.current
    if (!root || !target) return

    const minDwellMs = Math.max(3000, estimateReadingTimeSec(passage.wordCount, passage.difficulty) * 1000)
    let completeTimer: ReturnType<typeof setTimeout> | null = null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (completeTimer !== null) {
          clearTimeout(completeTimer)
          completeTimer = null
        }
        if (entry?.isIntersecting) {
          const remainingMs = Math.max(500, minDwellMs - elapsedMsRef.current)
          completeTimer = setTimeout(() => setPhase((p) => (p === 'reading' ? 'complete' : p)), remainingMs)
        }
      },
      { root, threshold: 0.99 },
    )
    observer.observe(target)
    return () => {
      observer.disconnect()
      if (completeTimer !== null) clearTimeout(completeTimer)
    }
  }, [passage.wordCount, passage.difficulty])

  // Fullscreen — genuinely new to this codebase, standard Web API.
  useEffect(() => {
    function onFullscreenChange(): void {
      setIsFullscreen(document.fullscreenElement !== null)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void document.documentElement.requestFullscreen()
    }
  }, [])

  const togglePause = useCallback(() => {
    setPhase((p) => {
      if (p === 'reading') {
        setPauseCount((c) => c + 1)
        return 'paused'
      }
      if (p === 'paused') {
        setResumeCount((c) => c + 1)
        return 'reading'
      }
      return p
    })
  }, [])

  const handleExit = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    router.push(LAB_HREF)
  }, [router])

  // Keyboard shortcuts — same inline window-listener pattern already used
  // in ChoiceGrid.tsx/FlashCanvas.tsx; not extracted into a shared hook
  // since only this one screen needs it.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePause()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === '+' || e.key === '=') {
        setPreferences((prev) => ({ ...prev, fontScale: stepFontScale(prev.fontScale, 'up') }))
      } else if (e.key === '-' || e.key === '_') {
        setPreferences((prev) => ({ ...prev, fontScale: stepFontScale(prev.fontScale, 'down') }))
      } else if (e.key === 'Escape' && document.fullscreenElement) {
        void document.exitFullscreen()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePause, toggleFullscreen])

  const liveWpm = computeLiveWpm(wordsRead, elapsedMs)
  const targetWpm = estimateWpm(passage.difficulty)
  const attention = computeAttentionSignals({
    readingTimeMs: elapsedMs,
    pauseCount,
    resumeCount,
    completionPercent: progressPercent,
  })
  const readingIntelligenceScore = computeReadingIntelligenceScore({
    attentionScore: attention.score,
    completionPercent: progressPercent,
    actualWpm: liveWpm,
    targetWpm,
  })
  const currentSession = {
    id: 'current',
    passageId: passage.id,
    category: passage.category,
    difficulty: passage.difficulty,
    mode,
    wpm: liveWpm,
    readingTimeMs: elapsedMs,
    comprehensionPercent: 0,
    accuracyPercent: 0,
    readingIntelligenceScore,
    focusMode: preferences.focusMode,
    hintsUsed: 0,
    completed: phase === 'complete',
    occurredAt: new Date().toISOString(),
  }

  useEffect(() => {
    if (phase !== 'complete') return
    if (typeof window === 'undefined') return

    const saveSession = async (): Promise<void> => {
      await saveReadingIntelligenceSession({
        passageId: passage.id,
        category: passage.category,
        difficulty: passage.difficulty,
        mode,
        wpm: liveWpm,
        readingTimeMs: elapsedMs,
        comprehensionPercent: 0,
        accuracyPercent: 0,
        readingIntelligenceScore,
        focusMode: preferences.focusMode,
        hintsUsed: 0,
        pauseCount,
        resumeCount,
        completionPercent: progressPercent,
        attentionScore: attention.score,
        attentionLevel: attention.level,
        completed: true,
      })
    }

    void saveSession()
  }, [phase, passage.id, passage.category, passage.difficulty, mode, liveWpm, elapsedMs, preferences.focusMode, pauseCount, resumeCount, progressPercent, readingIntelligenceScore, attention.level, attention.score])

  if (phase === 'complete') {
    const modeQuery = mode ? `mode=${mode}&` : ''
    const recommendation = generateSpeedCaution(currentSession) ?? generateTodaysFocus(currentSession)

    return (
      <ReadingSessionComplete
        readingTimeMs={elapsedMs}
        estimatedWpm={liveWpm}
        wordsRead={passage.wordCount}
        labHref={LAB_HREF}
        continueHref={`/labs/quantum-speed-reading/start/read/quiz?${modeQuery}passage=${passage.id}&readingTimeMs=${elapsedMs}&focusMode=${preferences.focusMode}`}
        confidenceScore={readingIntelligenceScore}
        recommendationMessage={recommendation}
      />
    )
  }

  const readingInsight = buildReadingInsight({
    progressPercent,
    pauseCount,
    resumeCount,
    phase,
  })

  return (
    <div className={cn('min-h-[100dvh] transition-colors duration-300', THEME_WRAPPER_CLASS[preferences.theme])}>
      <ReadingTopBar
        progressPercent={progressPercent}
        elapsedLabel={formatElapsedTime(elapsedMs)}
        isPaused={phase === 'paused'}
        isFullscreen={isFullscreen}
        theme={preferences.theme}
        onExit={handleExit}
        onTogglePause={togglePause}
        onToggleFullscreen={toggleFullscreen}
      />

      {readingInsight && phase === 'reading' && (
        <div className="sticky top-[4.5rem] z-20 px-6">
          <ReadingInsightCallout emoji={readingInsight.emoji} text={readingInsight.text} />
        </div>
      )}

      {isSmartResumeVisible && savedResumeState && (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto mb-4 max-w-3xl rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-slate-900 shadow-sm shadow-primary/10 sm:px-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Resume this passage from {Math.round(savedResumeState.progressPercent)}% progress and {formatElapsedTime(savedResumeState.elapsedMs)} of tracked reading.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90" onClick={handleAcceptResume}>
                Resume
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-full px-4 py-2 text-xs font-medium" onClick={handleDismissResume}>
                Start fresh
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[100dvh] overflow-y-auto pt-20 pb-28 scroll-smooth"
        aria-label="Quantum Speed Reading passage"
      >
        <ReadingPassageView
          title={passage.title}
          lines={passage.lines}
          currentLineIndex={currentLineIndex}
          focusMode={preferences.focusMode}
          guide={preferences.guide}
          fontScale={preferences.fontScale}
          readingWidth={preferences.readingWidth}
          lineHeightSetting={preferences.lineHeight}
        />
        <div ref={endSentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>

      {phase === 'paused' && (
        <div className={cn('fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-background/95 px-6 text-center backdrop-blur-sm transition-colors duration-300', THEME_WRAPPER_CLASS[preferences.theme])}>
          <p className="text-lg font-semibold">Reading Paused</p>
          <p className="text-sm opacity-70">{progressPercent}% through · {liveWpm > 0 ? `${liveWpm} WPM` : 'Establishing pace'}</p>
          <Button type="button" size="lg" className="rounded-full px-6 py-2.5" onClick={togglePause}>
            Resume
          </Button>
        </div>
      )}

      <ReadingControlsBar
        preferences={preferences}
        onFontStep={(direction) => setPreferences((prev) => ({ ...prev, fontScale: stepFontScale(prev.fontScale, direction) }))}
        onToggleTheme={() => setPreferences((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
        onCycleBrightness={() =>
          setPreferences((prev) => {
            if (prev.theme === 'dark') return prev
            return { ...prev, theme: cycleNext(LIGHT_THEMES, prev.theme) }
          })
        }
        onToggleFocusMode={() => setPreferences((prev) => ({ ...prev, focusMode: !prev.focusMode }))}
        onChangeWidth={(width: ReadingWidth) => setPreferences((prev) => ({ ...prev, readingWidth: width }))}
        onChangeLineHeight={(lineHeight: ReadingLineHeight) => setPreferences((prev) => ({ ...prev, lineHeight }))}
        onChangeGuide={(guide: ReadingGuide) => setPreferences((prev) => ({ ...prev, guide }))}
      />
    </div>
  )
}
