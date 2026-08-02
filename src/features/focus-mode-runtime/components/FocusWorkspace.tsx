'use client'

import { useState, useTransition } from 'react'
import { Target } from 'lucide-react'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { SessionProgressBar, SessionTimer, SessionErrorBanner, SessionResumeBanner, SessionNavigationControls } from '@/features/learning-mode-runtime/components'
import type { ModeChunkView, ModeSessionActionResult, ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'
import { startFocusSession } from '../actions/startFocusSession'
import { nextFocusChunk } from '../actions/nextFocusChunk'
import { previousFocusChunk } from '../actions/previousFocusChunk'
import { pauseFocusSession } from '../actions/pauseFocusSession'
import { resumeFocusSession } from '../actions/resumeFocusSession'
import { finishFocusSession } from '../actions/finishFocusSession'
import { FocusCard } from './FocusCard'
import { FocusVariantPicker } from './FocusVariantPicker'
import { SprintCountdownTimer } from './SprintCountdownTimer'
import { PomodoroTimer } from './PomodoroTimer'
import { FocusSessionSummaryScreen } from './FocusSessionSummaryScreen'
import { decodeFocusMethod } from '../types/FocusVariant'

type FocusWorkspaceProps = {
  documentId: string
  documentTitle: string
  initial: ModeWorkspaceInitialState
  projectId: string
}

type LiveState = { kind: 'not-started' } | { kind: 'active'; snapshot: SessionSnapshot; currentChunk: ModeChunkView | null; queueIndex: number; totalChunks: number; estimatedTimeLeftSeconds: number }

// Focus Mode™ (Mini) — AI Learning Studio™ Sprint ALS-16. The one
// client-side orchestrator every Focus sub-component reports to,
// structurally mirroring Memory Mode™'s own `MemoryWorkspace.tsx`: every
// transition comes from a real Server Action's real return value, never a
// client-side guess. Presentation only — no new runtime, no new
// persistence; every action composes the Shared Learning Runtime through
// Focus Mode's own thin Server Actions.
//
// The one real difference from every prior mode's Workspace: which timer
// renders in the header depends on the real, chosen Focus variant, decoded
// from `SessionSnapshot.method` (`decodeFocusMethod` — the same opaque
// field ALS-15 built for Memory Mode's six methods). Deep Focus Timer
// reuses the existing, shared, count-up `SessionTimer` verbatim. Reading
// Sprint uses the new `SprintCountdownTimer`. Pomodoro Mode uses the new
// `PomodoroTimer`, which also needs this component's own `runAction` to
// drive its automatic pause/resume cycling — the exact same function a
// manual Pause/Continue click already calls, never a second mechanism.
export function FocusWorkspace({ documentId, documentTitle, initial, projectId }: FocusWorkspaceProps): React.JSX.Element {
  const [state, setState] = useState<LiveState>(() =>
    initial.kind === 'in-progress'
      ? { kind: 'active', snapshot: initial.snapshot, currentChunk: initial.currentChunk, queueIndex: initial.queueIndex, totalChunks: initial.totalChunks, estimatedTimeLeftSeconds: initial.estimatedTimeLeftSeconds }
      : { kind: 'not-started' },
  )
  const [showResumeBanner, setShowResumeBanner] = useState(initial.kind === 'in-progress' && initial.didResume)
  const [error, setError] = useState<string | null>(initial.kind === 'error' ? initial.message : null)
  const [pending, startTransition] = useTransition()

  function runAction(action: () => Promise<ModeSessionActionResult>): void {
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

  if (initial.kind === 'not-processed') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-base)">
        <EmptyStateCard icon={Target} title="This document hasn't been prepared for a focus session yet" description="Its Universal Learning Object™ hasn't been built yet — check back once processing finishes." />
      </div>
    )
  }

  if (state.kind === 'not-started') {
    return (
      <div className="animate-in fade-in mx-auto max-w-2xl space-y-6 px-6 py-16 duration-(--duration-base)">
        {error !== null && <SessionErrorBanner message={error} />}
        <div className="space-y-1 text-center">
          <Target className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-foreground">{documentTitle}</h1>
          <p className="text-sm text-muted-foreground">Choose a Focus Mode™ to start your first session for this document.</p>
        </div>
        <FocusVariantPicker disabled={pending} onSelect={(config) => runAction(() => startFocusSession({ documentId, config }))} />
      </div>
    )
  }

  if (state.snapshot.status === 'completed') {
    return (
      <FocusSessionSummaryScreen
        documentTitle={documentTitle}
        totalChunks={state.totalChunks}
        metrics={state.snapshot.metrics}
        startedAt={state.snapshot.startedAt}
        completedAt={state.snapshot.completedAt}
        config={decodeFocusMethod(state.snapshot.method)}
        projectId={projectId}
      />
    )
  }

  const config = decodeFocusMethod(state.snapshot.method)

  return (
    <div className="min-h-dvh bg-background">
      <div className="animate-in fade-in mx-auto max-w-2xl space-y-6 px-4 py-8 duration-(--duration-base) sm:px-6 sm:py-10">
        {showResumeBanner && <SessionResumeBanner onDismiss={() => setShowResumeBanner(false)} />}
        {error !== null && <SessionErrorBanner message={error} />}

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="min-w-0 truncate text-lg font-semibold text-foreground" title={documentTitle}>
              {documentTitle}
            </h1>
            {config?.variant === 'reading-sprint' && state.snapshot.startedAt !== null && <SprintCountdownTimer startedAt={state.snapshot.startedAt} targetDurationMinutes={config.targetDurationMinutes} />}
            {config?.variant === 'pomodoro' && <PomodoroTimer sessionId={state.snapshot.sessionId} sessionStatus={state.snapshot.status} runAction={runAction} />}
            {(config === null || config.variant === 'deep-focus') && state.snapshot.startedAt !== null && <SessionTimer startedAt={state.snapshot.startedAt} />}
          </div>
          <SessionProgressBar completionPercentage={state.snapshot.completionPercentage} completedChunks={state.snapshot.metrics.completedChunks} totalChunks={state.totalChunks} estimatedTimeLeftSeconds={state.estimatedTimeLeftSeconds} />
        </div>

        {state.currentChunk !== null && <FocusCard key={state.currentChunk.chunkNodeId} chunk={state.currentChunk} />}

        <SessionNavigationControls
          status={state.snapshot.status}
          queueIndex={state.queueIndex}
          pending={pending}
          onPrevious={() => runAction(() => previousFocusChunk(state.snapshot.sessionId))}
          onNext={() => runAction(() => nextFocusChunk(state.snapshot.sessionId))}
          onPause={() => runAction(() => pauseFocusSession(state.snapshot.sessionId))}
          onContinue={() => runAction(() => resumeFocusSession(state.snapshot.sessionId))}
          onFinish={() => runAction(() => finishFocusSession(state.snapshot.sessionId))}
        />
      </div>
    </div>
  )
}
