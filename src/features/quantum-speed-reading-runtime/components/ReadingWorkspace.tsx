'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { BookOpen, Sparkles } from 'lucide-react'
import type { ChunkStrategy } from '@/core/adaptive-learning-runtime'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { startReadingSession } from '../actions/startReadingSession'
import { nextReadingChunk } from '../actions/nextReadingChunk'
import { previousReadingChunk } from '../actions/previousReadingChunk'
import { pauseReadingSession } from '../actions/pauseReadingSession'
import { resumeReadingSession } from '../actions/resumeReadingSession'
import { finishReadingSession } from '../actions/finishReadingSession'
import { recordReadingSpeedSample } from '../actions/recordReadingSpeedSample'
import { getReadingSpeedHistory, type ReadingSpeedSample } from '../actions/getReadingSpeedHistory'
import { getReadingStreak } from '../actions/getReadingStreak'
import { resolveReadingShortcut } from '../presentation/resolveReadingShortcut'
import { recommendQsrMode, type QsrModeId } from '../presentation/recommendQsrMode'
import { resolveReadingConfidence } from '../presentation/resolveReadingConfidence'
import type { DocumentComprehensionSignal } from '../presentation/listDocumentComprehensionSignals'
import type { ReadingChunkView } from '../types/ReadingChunkView'
import type { ReadingSessionActionResult } from '../types/ReadingSessionActionResult'
import type { ReadingTheme } from '../types/ReadingTheme'
import type { ReadingWorkspaceInitialState } from '../types/ReadingWorkspaceInitialState'
import { ReadingChunkViewer } from './ReadingChunkViewer'
import { ReadingThemeSelector } from './ReadingThemeSelector'
import { FocusModeToggle } from './FocusModeToggle'
import { CompletedSessionScreen } from './CompletedSessionScreen'
import { QsrHub } from './QsrHub'
import { PresenceReadingMode } from './PresenceReadingMode'
import { SmartChunkReadingView } from './SmartChunkReadingView'
import { GuidedEyeFlowView } from './GuidedEyeFlowView'
import { ReadingSprintView } from './ReadingSprintView'
import { ComprehensionCheckView } from './ComprehensionCheckView'
import { SpeedLadderView } from './SpeedLadderView'
import { ReadingJourneyExperience } from './ReadingJourneyExperience'
import { SessionProgressBar, SessionErrorBanner as ReadingErrorBanner, SessionResumeBanner as ResumeBanner, SessionTimer as ReadingTimer, SessionNavigationControls as ReadingNavigationControls } from '@/features/learning-mode-runtime/components'
import './readingThemes.css'

type ReadingWorkspaceProps = {
  documentId: string
  documentTitle: string
  chunkStrategy: ChunkStrategy
  initial: ReadingWorkspaceInitialState
  projectId: string
  // Quantum Speed Reading Experience Engine™ (QSR-E1) — Comprehension
  // Check™'s real, server-computed, whole-document enrichment pool (the
  // ULO itself never reaches the client — the same reason MCQs mode
  // computes its own equivalent pooled data server-side and passes it
  // down as a plain prop).
  comprehensionSignals: readonly DocumentComprehensionSignal[]
  // Mode A / Mode B Fork™ (Phase 2) — additive-only override of qsrMode's
  // own default 'sequential' starting value (see that state's own doc
  // comment for why it normally always starts there). Absent everywhere
  // else in the app; only the Mode A entry point (read/page.tsx's own
  // `?qsrMode=` search param) ever sets this, landing directly in
  // Intelligent Reading instead of requiring an extra in-Hub pick. The
  // Hub itself stays exactly as reachable/switchable as before — this
  // only changes which mode is selected on mount.
  initialQsrMode?: QsrModeId
}

type LiveState =
  | { kind: 'not-started' }
  | { kind: 'active'; snapshot: SessionSnapshot; currentChunk: ReadingChunkView | null; queueIndex: number; totalChunks: number; estimatedTimeLeftSeconds: number }

const THEME_CLASS: Record<ReadingTheme, string> = { light: '', dark: 'dark', sepia: 'reading-theme-sepia' }

// Quantum Speed Reading™ Production Sprint-2, amended in Sprint-3. The
// Reading Workspace — the one client-side orchestrator every sub-
// component reports to. Owns exactly the state a browser tab genuinely
// needs to hold: the current `SessionSnapshot` + current chunk view
// (every transition comes from a real Server Action's real return value,
// never a client-side guess), plus two genuinely new, small, real pieces
// of presentation-only state this sprint adds — `theme` and `focusMode`.
// Neither is session/runtime data; neither is ever sent to a Server
// Action or persisted. `useTransition`'s own `pending` remains this
// component's one loading-state source.
//
// Reading Themes: `THEME_CLASS` maps directly onto the root wrapper's
// className. "Light" needs no class (the app's own default tokens).
// "Dark" reuses the existing `.dark` class verbatim — every color token
// it needs already exists in globals.css. "Sepia" applies the one
// genuinely new, scoped class this sprint adds (readingThemes.css). Every
// child component already renders with `bg-background`/`text-foreground`/
// `bg-card`/etc., so none of them need to know which theme is active.
//
// Focus Mode: the *outer* app chrome (sidebar/topbar) is already hidden
// for this whole route via AppShell's existing, reused
// `IMMERSIVE_ROUTE_PATTERNS` mechanism (see docs/PRODUCTION_HANDOFF_QSR_SPRINT_3.md).
// This toggle controls only this page's own secondary chrome — title,
// timer, progress, theme selector — leaving real navigation (Previous/
// Next/Continue/Finish) and the chunk itself always visible, and leaving
// the Focus toggle itself always reachable so a mouse/touch user always
// has a way back out, mirroring the Esc keyboard shortcut.
//
// Keyboard Shortcuts: one listener, pure key-to-action resolution via
// `resolveReadingShortcut` (tested in isolation), the same guard
// conditions as the corresponding buttons' own `disabled` props — a
// keyboard shortcut never does something its matching button wouldn't.
//
// Sprint ALS-14 — Production Polish. Two real fixes, no new architecture:
// (1) the 'next' shortcut (Space/→) now resumes a paused session instead
// of silently no-op'ing, matching the Continue button's own pre-existing
// "Continue (Space)" label, which was previously an unfulfilled promise.
// (2) each of this component's top-level return branches gets the same
// `animate-in fade-in` entrance already established elsewhere in this
// feature (`ReadingChunkViewer`'s own per-chunk transition), so switching
// between not-processed / not-started / active / completed is a soft
// fade rather than an instant swap — no new animation primitive, no new
// dependency, and the platform's own global `prefers-reduced-motion`
// fallback in globals.css still applies automatically.
export function ReadingWorkspace({ documentId, documentTitle, chunkStrategy, initial, projectId, comprehensionSignals, initialQsrMode }: ReadingWorkspaceProps): React.JSX.Element {
  const [state, setState] = useState<LiveState>(() =>
    initial.kind === 'in-progress'
      ? { kind: 'active', snapshot: initial.snapshot, currentChunk: initial.currentChunk, queueIndex: initial.queueIndex, totalChunks: initial.totalChunks, estimatedTimeLeftSeconds: initial.estimatedTimeLeftSeconds }
      : { kind: 'not-started' },
  )
  const [showResumeBanner, setShowResumeBanner] = useState(initial.kind === 'in-progress' && initial.didResume)
  const [error, setError] = useState<string | null>(initial.kind === 'error' ? initial.message : null)
  const [theme, setTheme] = useState<ReadingTheme>('light')
  const [focusMode, setFocusMode] = useState(false)
  const [pending, startTransition] = useTransition()

  // Quantum Speed Reading Experience Engine™ (QSR-E1) — the QSR Hub's own
  // client state. `qsrMode` always starts `'sequential'` — today's real,
  // unchanged linear reading view — regardless of whether this is a fresh
  // start or a resumed in-progress session; the Hub itself is always
  // reachable above the chapter, never a one-time gate, per the brief's
  // own "do not force sequential completion."
  const [qsrMode, setQsrMode] = useState<QsrModeId>(initialQsrMode ?? 'sequential')
  const [speedSamples, setSpeedSamples] = useState<readonly ReadingSpeedSample[]>([])
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    let cancelled = false
    getReadingSpeedHistory({ documentId }).then((result) => {
      if (!cancelled && result.success) setSpeedSamples(result.samples)
    })
    getReadingStreak().then((result) => {
      if (!cancelled && result.success) setStreak(result.streak)
    })
    return () => {
      cancelled = true
    }
  }, [documentId])

  // Real WPM-bearing samples only — Presence Reading/Guided Eye Flow/
  // Comprehension Check completions record `wpm: null` and must never
  // pull the real average down.
  const wpmSamples = useMemo(() => speedSamples.filter((sample): sample is ReadingSpeedSample & { wpm: number } => sample.wpm !== null), [speedSamples])
  const currentWpm = wpmSamples[0]?.wpm ?? null

  const todaysSessionCount = useMemo(() => {
    const now = new Date()
    return speedSamples.filter((sample) => {
      const recordedAt = new Date(sample.recordedAt)
      return recordedAt.getFullYear() === now.getFullYear() && recordedAt.getMonth() === now.getMonth() && recordedAt.getDate() === now.getDate()
    }).length
  }, [speedSamples])

  const confidence = useMemo(
    () =>
      resolveReadingConfidence({
        completionPercentage: state.kind === 'active' ? state.snapshot.completionPercentage : 0,
        pauseCount: state.kind === 'active' ? state.snapshot.metrics.pauseCount : 0,
      }),
    [state],
  )

  const recommendation = useMemo(
    () =>
      recommendQsrMode({
        averageWpm: wpmSamples.length > 0 ? Math.round(wpmSamples.reduce((sum, sample) => sum + sample.wpm, 0) / wpmSamples.length) : null,
        pauseCount: state.kind === 'active' ? state.snapshot.metrics.pauseCount : 0,
      }),
    [wpmSamples, state],
  )

  function recordSample(mode: QsrModeId, wpm: number | null): void {
    setSpeedSamples((current) => [{ mode, wpm, recordedAt: new Date().toISOString() }, ...current])
    void recordReadingSpeedSample({ documentId, mode, wpm })
  }

  function handleSprintComplete(wpm: number): void {
    recordSample('sprint', wpm)
    setQsrMode('speed-ladder')
  }

  function runAction(action: () => Promise<ReadingSessionActionResult>): void {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.success) {
        setError(result.error)
        return
      }
      setState({ kind: 'active', snapshot: result.snapshot, currentChunk: result.currentChunk, queueIndex: result.queueIndex, totalChunks: result.totalChunks, estimatedTimeLeftSeconds: result.estimatedTimeLeftSeconds })
    })
  }

  const isPaused = state.kind === 'active' && state.snapshot.status === 'paused'
  const canGoPrevious = state.kind === 'active' && !pending && !isPaused && state.queueIndex > 0
  const canGoNext = state.kind === 'active' && !pending && !isPaused

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const action = resolveReadingShortcut({ key: event.key, metaKey: event.metaKey, ctrlKey: event.ctrlKey, altKey: event.altKey })
      if (action === null) return

      if (action === 'exit-focus-mode') {
        if (!focusMode) return
        event.preventDefault()
        setFocusMode(false)
        return
      }

      if (state.kind !== 'active') return
      // Reading Intelligence Engine™ Upgrade — Sprint-4.5: the UX review
      // found this global shortcut still drove the CLASSIC ULO-chunk
      // session's own Previous/Next/Continue in the background while
      // "Intelligent Reading" was the visibly active mode — invisible to
      // the reader, but a real wasted round-trip and a real risk of the
      // classic session's position silently drifting from what the
      // reader would see if they switched back to Sequential mode.
      // IntelligentReadingView owns its own keyboard-free navigation
      // (its buttons are the same real Previous/Next/Pause/Finish
      // controls); this shortcut stays scoped to the other 7 modes.
      if (qsrMode === 'intelligent-reading') return

      if (action === 'previous' && canGoPrevious) {
        event.preventDefault()
        runAction(() => previousReadingChunk(state.snapshot.sessionId))
      } else if (action === 'next') {
        // Sprint ALS-14 — Space is the same key for "Next" and "Continue"
        // (SessionNavigationControls' own Continue button is labeled
        // "Continue (Space)"), so while paused it must resume rather than
        // being silently swallowed by the `!isPaused` guard `canGoNext`
        // already carries.
        if (isPaused && !pending) {
          event.preventDefault()
          runAction(() => resumeReadingSession(state.snapshot.sessionId))
        } else if (canGoNext) {
          event.preventDefault()
          runAction(() => nextReadingChunk(state.snapshot.sessionId))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, focusMode, canGoPrevious, canGoNext, isPaused, pending, qsrMode])

  if (initial.kind === 'not-processed') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-base)">
        <EmptyStateCard icon={Sparkles} title="This document hasn't been prepared for reading yet" description="Its Universal Learning Object™ hasn't been built yet — check back once processing finishes." />
      </div>
    )
  }

  if (state.kind === 'not-started') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg space-y-4 px-6 py-16 duration-(--duration-base)">
        {error !== null && <ReadingErrorBanner message={error} />}
        <EmptyStateCard
          icon={BookOpen}
          title={documentTitle}
          description="Start your first Quantum Speed Reading™ session for this document."
          action={
            <Button disabled={pending} onClick={() => runAction(() => startReadingSession({ documentId, chunkStrategy }))}>
              {pending ? 'Starting…' : 'Start Reading'}
            </Button>
          }
        />
      </div>
    )
  }

  if (state.snapshot.status === 'completed') {
    return <CompletedSessionScreen documentTitle={documentTitle} totalChunks={state.totalChunks} metrics={state.snapshot.metrics} projectId={projectId} startedAt={state.snapshot.startedAt} completedAt={state.snapshot.completedAt} />
  }

  // Reading Journey Experience™ (Sprint-5) — a fully immersive screen,
  // deliberately bypassing every piece of classic chrome below (theme
  // selector, title, timer, progress bar, QsrHub panel — all real,
  // valuable UI, but all built for the classic chunk-based modes and
  // carrying their own vocabulary/visual language). This sprint's own
  // product brief calls out, explicitly, that Intelligent Reading "still
  // looks like another reading screen" specifically because of this kind
  // of chrome bleed-through — the fix is a genuinely separate, focused
  // screen, not a skin applied on top of the classic layout.
  if (qsrMode === 'intelligent-reading') {
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <ReadingJourneyExperience documentId={documentId} documentTitle={documentTitle} projectId={projectId} onComplete={() => recordSample('intelligent-reading', null)} />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-dvh ${THEME_CLASS[theme]} bg-background`}>
      <div className="animate-in fade-in mx-auto max-w-2xl space-y-6 px-6 py-10 duration-(--duration-base)">
        {showResumeBanner && <ResumeBanner onDismiss={() => setShowResumeBanner(false)} />}
        {error !== null && <ReadingErrorBanner message={error} />}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {!focusMode && <ReadingThemeSelector theme={theme} onChange={setTheme} />}
          <div className={focusMode ? 'ml-auto' : ''}>
            <FocusModeToggle enabled={focusMode} onChange={setFocusMode} />
          </div>
        </div>

        {!focusMode && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-foreground">{documentTitle}</h1>
              {state.snapshot.startedAt !== null && <ReadingTimer startedAt={state.snapshot.startedAt} />}
            </div>
            <SessionProgressBar completionPercentage={state.snapshot.completionPercentage} completedChunks={state.snapshot.metrics.completedChunks} totalChunks={state.totalChunks} estimatedTimeLeftSeconds={state.estimatedTimeLeftSeconds} />
          </div>
        )}

        {/* Quantum Speed Reading Experience Engine™ (QSR-E1) — the Hub
            stays reachable above the chapter at all times (never a
            one-time gate), except in Focus Mode, which already hides
            every other piece of secondary chrome the same way. */}
        {!focusMode && (
          <QsrHub
            activeMode={qsrMode}
            recommendation={recommendation}
            onSelectMode={setQsrMode}
            currentWpm={currentWpm}
            samples={speedSamples}
            todaysSessionCount={todaysSessionCount}
            streak={streak}
            completionPercentage={state.snapshot.completionPercentage}
            sessionStartedAt={state.snapshot.startedAt}
            confidence={confidence}
          />
        )}

        {state.currentChunk !== null && (
          <>
            {qsrMode === 'sequential' && <ReadingChunkViewer chunk={state.currentChunk} />}
            {qsrMode === 'presence' && (
              <PresenceReadingMode
                onBegin={() => {
                  recordSample('presence', null)
                  setQsrMode('sequential')
                }}
              />
            )}
            {qsrMode === 'smart-chunk' && <SmartChunkReadingView content={state.currentChunk.content} />}
            {qsrMode === 'guided-eye-flow' && <GuidedEyeFlowView content={state.currentChunk.content} onComplete={() => recordSample('guided-eye-flow', null)} />}
            {qsrMode === 'sprint' && <ReadingSprintView content={state.currentChunk.content} onComplete={handleSprintComplete} />}
            {qsrMode === 'comprehension-check' && (
              <ComprehensionCheckView chunk={state.currentChunk} allSignals={comprehensionSignals} onComplete={() => recordSample('comprehension-check', null)} />
            )}
            {qsrMode === 'speed-ladder' && <SpeedLadderView samples={speedSamples} />}
          </>
        )}

        {/* Reading Journey Experience™ (Sprint-5) has its own, fully
            immersive early-return branch above — this classic layout is
            only ever reached for the other 7 modes, so this control bar
            can stay unconditional. */}
        <ReadingNavigationControls
          status={state.snapshot.status}
          queueIndex={state.queueIndex}
          pending={pending}
          onPrevious={() => runAction(() => previousReadingChunk(state.snapshot.sessionId))}
          onNext={() => runAction(() => nextReadingChunk(state.snapshot.sessionId))}
          onPause={() => runAction(() => pauseReadingSession(state.snapshot.sessionId))}
          onContinue={() => runAction(() => resumeReadingSession(state.snapshot.sessionId))}
          onFinish={() => runAction(() => finishReadingSession(state.snapshot.sessionId))}
        />
      </div>
    </div>
  )
}
