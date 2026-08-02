'use client'

import { useState, useTransition } from 'react'
import { HelpCircle } from 'lucide-react'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { SessionProgressBar, SessionTimer, SessionErrorBanner, SessionResumeBanner, SessionNavigationControls } from '@/features/learning-mode-runtime/components'
import type { ModeChunkView, ModeSessionActionResult, ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'
import { startMcqsSession } from '../actions/startMcqsSession'
import { nextMcqsChunk } from '../actions/nextMcqsChunk'
import { previousMcqsChunk } from '../actions/previousMcqsChunk'
import { pauseMcqsSession } from '../actions/pauseMcqsSession'
import { resumeMcqsSession } from '../actions/resumeMcqsSession'
import { finishMcqsSession } from '../actions/finishMcqsSession'
import { StructureQuestionCard } from './StructureQuestionCard'
import { McqsSessionSummaryScreen } from './McqsSessionSummaryScreen'
import type { DocumentSectionHeading } from '../presentation/listDocumentSectionHeadings'
import type { DocumentDefinition } from '../presentation/listDocumentDefinitions'

type McqsWorkspaceProps = {
  documentId: string
  documentTitle: string
  allHeadings: readonly DocumentSectionHeading[]
  allDefinitions: readonly DocumentDefinition[]
  initial: ModeWorkspaceInitialState
  projectId: string
}

type LiveState = { kind: 'not-started' } | { kind: 'active'; snapshot: SessionSnapshot; currentChunk: ModeChunkView | null; queueIndex: number; totalChunks: number; estimatedTimeLeftSeconds: number }

// MCQs™ — AI Learning Studio™ Sprint ALS-17. The one client-side
// orchestrator every MCQs sub-component reports to, structurally
// mirroring Memory Mode™'s own `MemoryWorkspace.tsx`: every transition
// comes from a real Server Action's real return value, never a
// client-side guess. `allHeadings` is the one genuinely new prop no other
// mode's Workspace needs — the full document's real section headings,
// computed once server-side, passed down so `StructureQuestionCard` can
// build real distractor options without a second ULO fetch.
export function McqsWorkspace({ documentId, documentTitle, allHeadings, allDefinitions, initial, projectId }: McqsWorkspaceProps): React.JSX.Element {
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
        <EmptyStateCard icon={HelpCircle} title="This document hasn't been prepared for MCQs yet" description="Its Universal Learning Object™ hasn't been built yet — check back once processing finishes." />
      </div>
    )
  }

  if (state.kind === 'not-started') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg space-y-4 px-6 py-16 duration-(--duration-base)">
        {error !== null && <SessionErrorBanner message={error} />}
        <EmptyStateCard
          icon={HelpCircle}
          title={documentTitle}
          description="Real questions about how this document is organized — start your first MCQs session."
          action={
            <Button disabled={pending} onClick={() => runAction(() => startMcqsSession({ documentId }))}>
              {pending ? 'Starting…' : 'Start MCQs'}
            </Button>
          }
        />
      </div>
    )
  }

  if (state.snapshot.status === 'completed') {
    return (
      <McqsSessionSummaryScreen
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

        {state.currentChunk !== null && <StructureQuestionCard key={state.currentChunk.chunkNodeId} chunk={state.currentChunk} allHeadings={allHeadings} allDefinitions={allDefinitions} />}

        <SessionNavigationControls
          status={state.snapshot.status}
          queueIndex={state.queueIndex}
          pending={pending}
          onPrevious={() => runAction(() => previousMcqsChunk(state.snapshot.sessionId))}
          onNext={() => runAction(() => nextMcqsChunk(state.snapshot.sessionId))}
          onPause={() => runAction(() => pauseMcqsSession(state.snapshot.sessionId))}
          onContinue={() => runAction(() => resumeMcqsSession(state.snapshot.sessionId))}
          onFinish={() => runAction(() => finishMcqsSession(state.snapshot.sessionId))}
        />
      </div>
    </div>
  )
}
