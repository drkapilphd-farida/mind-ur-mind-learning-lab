'use client'

import { useState, useTransition } from 'react'
import { Brain } from 'lucide-react'
import type { ChunkStrategy } from '@/core/adaptive-learning-runtime'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { SessionProgressBar, SessionErrorBanner, SessionResumeBanner, SessionNavigationControls } from '@/features/learning-mode-runtime/components'
import type { ModeChunkView, ModeSessionActionResult, ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'
import { startMemorySession } from '../actions/startMemorySession'
import { nextMemoryChunk } from '../actions/nextMemoryChunk'
import { previousMemoryChunk } from '../actions/previousMemoryChunk'
import { pauseMemorySession } from '../actions/pauseMemorySession'
import { resumeMemorySession } from '../actions/resumeMemorySession'
import { finishMemorySession } from '../actions/finishMemorySession'
import { MemoryCard } from './MemoryCard'
import { MemoryMethodPicker } from './MemoryMethodPicker'
import { MemorySessionHeader } from './MemorySessionHeader'
import { MemorySessionSummaryScreen } from './MemorySessionSummaryScreen'
import { MemoryMethodIdSchema } from '../types/MemoryMethod'
import type { MemoryMethodId } from '../types/MemoryMethod'

type MemoryWorkspaceProps = {
  documentId: string
  documentTitle: string
  chunkStrategy: ChunkStrategy
  initial: ModeWorkspaceInitialState
  projectId: string
}

type LiveState = { kind: 'not-started' } | { kind: 'active'; snapshot: SessionSnapshot; currentChunk: ModeChunkView | null; queueIndex: number; totalChunks: number; estimatedTimeLeftSeconds: number }

// `SessionSnapshot.method` is deliberately an opaque `string | null` at
// the shared LSE-3 layer (see SessionSnapshot.ts) — narrowed back to a
// real `MemoryMethodId` here, at the one Memory-Mode-specific boundary
// that renders it. A session started before this sprint (or, in theory,
// a corrupted/foreign value) honestly falls back to `null` rather than
// crashing or guessing a method the learner never chose.
function parseMemoryMethod(value: string | null): MemoryMethodId | null {
  if (value === null) return null
  const parsed = MemoryMethodIdSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

// Memory Mode™ Sprint-2 — Memory Learning Workspace. The one client-side
// orchestrator every Memory sub-component reports to, structurally
// mirroring Quantum Speed Reading™'s own `ReadingWorkspace.tsx`: every
// transition comes from a real Server Action's real return value, never a
// client-side guess; `useTransition`'s own `pending` remains this
// component's one loading-state source. Presentation only — no new
// runtime, no new persistence, no new analytics; every action composes
// the Shared Learning Runtime through Memory Mode's own thin Server
// Actions (Sprint-1).
//
// Deliberately simpler than the Reading Workspace: no theme selector, no
// Focus Mode, no keyboard shortcuts — none of those were named in this
// sprint's brief, and adding them would be scope beyond "Memory Learning
// Workspace, Memory Card, Session Header, Progress Indicator, Continue
// Session, Session Summary, animations, responsive layout."
//
// Memory Mode™ Sprint-5 polish: each real screen state gets a soft
// `fade-in` entrance and slightly tighter mobile padding
// (`px-4 py-8 sm:px-6 sm:py-10`); the state machine, its four branches,
// and every action call are byte-identical to Sprint-2.
export function MemoryWorkspace({ documentId, documentTitle, chunkStrategy, initial, projectId }: MemoryWorkspaceProps): React.JSX.Element {
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
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
        <EmptyStateCard icon={Brain} title="This document hasn't been prepared for a memory session yet" description="Its Universal Learning Object™ hasn't been built yet — check back once processing finishes." />
      </div>
    )
  }

  if (state.kind === 'not-started') {
    return (
      <div className="animate-in fade-in mx-auto max-w-2xl space-y-6 px-6 py-16 duration-(--duration-slow)">
        {error !== null && <SessionErrorBanner message={error} />}
        <div className="space-y-1 text-center">
          <Brain className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-foreground">{documentTitle}</h1>
          <p className="text-sm text-muted-foreground">Choose a Memory Method™ to start your first session for this document.</p>
        </div>
        <MemoryMethodPicker disabled={pending} onSelect={(method) => runAction(() => startMemorySession({ documentId, chunkStrategy, method }))} />
      </div>
    )
  }

  if (state.snapshot.status === 'completed') {
    return (
      <MemorySessionSummaryScreen
        documentTitle={documentTitle}
        totalChunks={state.totalChunks}
        metrics={state.snapshot.metrics}
        startedAt={state.snapshot.startedAt}
        completedAt={state.snapshot.completedAt}
        method={parseMemoryMethod(state.snapshot.method)}
        projectId={projectId}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        {showResumeBanner && <SessionResumeBanner onDismiss={() => setShowResumeBanner(false)} />}
        {error !== null && <SessionErrorBanner message={error} />}

        <div className="space-y-6">
          <MemorySessionHeader documentTitle={documentTitle} startedAt={state.snapshot.startedAt} />
          <SessionProgressBar completionPercentage={state.snapshot.completionPercentage} completedChunks={state.snapshot.metrics.completedChunks} totalChunks={state.totalChunks} estimatedTimeLeftSeconds={state.estimatedTimeLeftSeconds} />
        </div>

        {state.currentChunk !== null && (
          <MemoryCard key={state.currentChunk.chunkNodeId} chunk={state.currentChunk} method={parseMemoryMethod(state.snapshot.method) ?? 'chunking'} queueIndex={state.queueIndex} totalChunks={state.totalChunks} />
        )}

        <SessionNavigationControls
          status={state.snapshot.status}
          queueIndex={state.queueIndex}
          pending={pending}
          onPrevious={() => runAction(() => previousMemoryChunk(state.snapshot.sessionId))}
          onNext={() => runAction(() => nextMemoryChunk(state.snapshot.sessionId))}
          onPause={() => runAction(() => pauseMemorySession(state.snapshot.sessionId))}
          onContinue={() => runAction(() => resumeMemorySession(state.snapshot.sessionId))}
          onFinish={() => runAction(() => finishMemorySession(state.snapshot.sessionId))}
        />
      </div>
    </div>
  )
}
