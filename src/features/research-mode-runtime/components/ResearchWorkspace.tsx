'use client'

import { useState, useTransition } from 'react'
import { Microscope } from 'lucide-react'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { SessionProgressBar, SessionTimer, SessionErrorBanner, SessionResumeBanner, SessionNavigationControls } from '@/features/learning-mode-runtime/components'
import type { ModeChunkView, ModeSessionActionResult, ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'
import { startResearchSession } from '../actions/startResearchSession'
import { nextResearchChunk } from '../actions/nextResearchChunk'
import { previousResearchChunk } from '../actions/previousResearchChunk'
import { pauseResearchSession } from '../actions/pauseResearchSession'
import { resumeResearchSession } from '../actions/resumeResearchSession'
import { finishResearchSession } from '../actions/finishResearchSession'
import { ResearchCard } from './ResearchCard'
import { ResearchSessionSummaryScreen } from './ResearchSessionSummaryScreen'

type ResearchWorkspaceProps = {
  documentId: string
  documentTitle: string
  initial: ModeWorkspaceInitialState
  projectId: string
}

type LiveState = { kind: 'not-started' } | { kind: 'active'; snapshot: SessionSnapshot; currentChunk: ModeChunkView | null; queueIndex: number; totalChunks: number; estimatedTimeLeftSeconds: number }

// Research Mode™ — Production AI Integration (ALS-24). The one
// client-side orchestrator every Research sub-component reports to,
// structurally mirroring Revision Mode™'s own `RevisionWorkspace.tsx`.
// Honest MVP scope: no cross-session history banner (Research Mode has no
// equivalent to Revision's own `getDocumentRevisionContext` — nothing
// beyond the standard session lifecycle is needed here).
export function ResearchWorkspace({ documentId, documentTitle, initial, projectId }: ResearchWorkspaceProps): React.JSX.Element {
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
        <EmptyStateCard icon={Microscope} title="This document hasn't been prepared for research yet" description="Its Universal Learning Object™ hasn't been built yet — check back once processing finishes." />
      </div>
    )
  }

  if (state.kind === 'not-started') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg space-y-4 px-6 py-16 duration-(--duration-base)">
        {error !== null && <SessionErrorBanner message={error} />}
        <EmptyStateCard
          icon={Microscope}
          title={documentTitle}
          description="Deep concept exploration through this document."
          action={
            <Button disabled={pending} onClick={() => runAction(() => startResearchSession({ documentId, chunkStrategy: 'dependency-first' }))}>
              {pending ? 'Starting…' : 'Start Research'}
            </Button>
          }
        />
      </div>
    )
  }

  if (state.snapshot.status === 'completed') {
    return (
      <ResearchSessionSummaryScreen
        documentTitle={documentTitle}
        totalChunks={state.totalChunks}
        metrics={state.snapshot.metrics}
        startedAt={state.snapshot.startedAt}
        completedAt={state.snapshot.completedAt}
        projectId={projectId}
      />
    )
  }

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
            {state.snapshot.startedAt !== null && <SessionTimer startedAt={state.snapshot.startedAt} />}
          </div>
          <SessionProgressBar completionPercentage={state.snapshot.completionPercentage} completedChunks={state.snapshot.metrics.completedChunks} totalChunks={state.totalChunks} estimatedTimeLeftSeconds={state.estimatedTimeLeftSeconds} />
        </div>

        {state.currentChunk !== null && <ResearchCard key={state.currentChunk.chunkNodeId} chunk={state.currentChunk} />}

        <SessionNavigationControls
          status={state.snapshot.status}
          queueIndex={state.queueIndex}
          pending={pending}
          onPrevious={() => runAction(() => previousResearchChunk(state.snapshot.sessionId))}
          onNext={() => runAction(() => nextResearchChunk(state.snapshot.sessionId))}
          onPause={() => runAction(() => pauseResearchSession(state.snapshot.sessionId))}
          onContinue={() => runAction(() => resumeResearchSession(state.snapshot.sessionId))}
          onFinish={() => runAction(() => finishResearchSession(state.snapshot.sessionId))}
        />
      </div>
    </div>
  )
}
