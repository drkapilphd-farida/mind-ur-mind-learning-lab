'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { NotebookText } from 'lucide-react'
import type { ChunkStrategy } from '@/core/adaptive-learning-runtime'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { SessionProgressBar, SessionErrorBanner, SessionResumeBanner, SessionNavigationControls } from '@/features/learning-mode-runtime/components'
import type { ModeChunkView, ModeSessionActionResult, ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'
import { startSmartNotesSession } from '../actions/startSmartNotesSession'
import { nextSmartNotesChunk } from '../actions/nextSmartNotesChunk'
import { previousSmartNotesChunk } from '../actions/previousSmartNotesChunk'
import { pauseSmartNotesSession } from '../actions/pauseSmartNotesSession'
import { resumeSmartNotesSession } from '../actions/resumeSmartNotesSession'
import { finishSmartNotesSession } from '../actions/finishSmartNotesSession'
import { SmartNotesPanel } from './SmartNotesPanel'
import type { SmartNote } from '../notes/types/SmartNote'

type SmartNotesWorkspaceProps = {
  documentId: string
  documentTitle: string
  chunkStrategy: ChunkStrategy
  initial: ModeWorkspaceInitialState
  initialNote: SmartNote | null
  projectId: string
}

type LiveState = { kind: 'not-started' } | { kind: 'active'; snapshot: SessionSnapshot; currentChunk: ModeChunkView | null; queueIndex: number; totalChunks: number; estimatedTimeLeftSeconds: number }

// Smart Notes™ Sprint-1 — Foundation Engine™. The minimum real client
// orchestrator needed to prove the engine and route work end to end —
// structurally mirroring Memory Mode™'s own `MemoryWorkspace.tsx` state
// machine (not-processed / not-started / active / completed) and Server
// Action wiring exactly. Reusing the Shared Learning Runtime's own
// already-built `SessionProgressBar`/`SessionErrorBanner`/
// `SessionResumeBanner`/`SessionNavigationControls` is not new polish —
// it's the same "reuse exactly" every other action in this feature
// already follows.
//
// Smart Notes™ Sprint-2 — Reading & Notes Workspace™. `initialNote` is
// real, already-saved content for this document (or `null`, honestly, if
// none exists yet), loaded once server-side alongside the session state
// and handed to `SmartNotesPanel`, which owns its own independent
// edit/save cycle — notes are scoped per document, not per session (see
// `SmartNote.ts`), so they're deliberately orthogonal to `LiveState`'s
// own session machine, not folded into it. The panel renders in every
// real state except `not-processed`, where there is no real document
// content yet to take notes on.
//
// Smart Notes™ Sprint-5 polish: every real screen state now reuses the
// same `EmptyStateCard`/`Card` conventions QSR's and Memory's own
// workspaces already use (visual consistency across all three Learning
// Modes), plus soft `fade-in` entrances and slightly tighter mobile
// padding (`px-4 py-8 sm:px-6 sm:py-10`, was `px-6 py-10`). The state
// machine, its four branches, and every action call are byte-identical
// to Sprint-1/Sprint-2.
export function SmartNotesWorkspace({ documentId, documentTitle, chunkStrategy, initial, initialNote, projectId }: SmartNotesWorkspaceProps): React.JSX.Element {
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
        <EmptyStateCard icon={NotebookText} title="This document hasn't been prepared for a smart notes session yet" description="Its Universal Learning Object™ hasn't been built yet — check back once processing finishes." />
      </div>
    )
  }

  if (state.kind === 'not-started') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg space-y-6 px-6 py-16 duration-(--duration-slow)">
        {error !== null && <SessionErrorBanner message={error} />}
        <EmptyStateCard
          icon={NotebookText}
          title={documentTitle}
          description="Start your first Smart Notes session for this document."
          action={
            <Button disabled={pending} onClick={() => runAction(() => startSmartNotesSession({ documentId, chunkStrategy }))}>
              {pending ? 'Starting…' : 'Start Smart Notes Session'}
            </Button>
          }
        />
        <SmartNotesPanel documentId={documentId} initialContent={initialNote?.content ?? ''} initialUpdatedAt={initialNote?.updatedAt ?? null} />
      </div>
    )
  }

  if (state.snapshot.status === 'completed') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg space-y-6 px-6 py-16 duration-(--duration-slow)">
        <EmptyStateCard
          icon={NotebookText}
          title="Session complete"
          description={`You've finished this smart notes session for "${documentTitle}" — ${state.snapshot.metrics.completedChunks} of ${state.totalChunks} concepts covered.`}
        />
        <SmartNotesPanel documentId={documentId} initialContent={initialNote?.content ?? ''} initialUpdatedAt={initialNote?.updatedAt ?? null} />
        <div className="text-center">
          <Button asChild variant="ghost">
            <Link href={`/preview/learning-projects/${projectId}`}>Back to Learning Blueprint</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        {showResumeBanner && <SessionResumeBanner onDismiss={() => setShowResumeBanner(false)} />}
        {error !== null && <SessionErrorBanner message={error} />}

        <div className="animate-in fade-in slide-in-from-top-1 space-y-4 duration-(--duration-base)">
          <h1 className="truncate text-lg font-semibold text-foreground" title={documentTitle}>
            {documentTitle}
          </h1>
          <SessionProgressBar completionPercentage={state.snapshot.completionPercentage} completedChunks={state.snapshot.metrics.completedChunks} totalChunks={state.totalChunks} estimatedTimeLeftSeconds={state.estimatedTimeLeftSeconds} />
        </div>

        {state.currentChunk !== null && (
          <div key={state.currentChunk.chunkNodeId} className="animate-in fade-in rounded-lg bg-card p-6 shadow-sm ring-1 ring-foreground/10 duration-(--duration-base)">
            <p className="text-base whitespace-pre-wrap text-foreground">{state.currentChunk.content}</p>
          </div>
        )}

        <SessionNavigationControls
          status={state.snapshot.status}
          queueIndex={state.queueIndex}
          pending={pending}
          onPrevious={() => runAction(() => previousSmartNotesChunk(state.snapshot.sessionId))}
          onNext={() => runAction(() => nextSmartNotesChunk(state.snapshot.sessionId))}
          onPause={() => runAction(() => pauseSmartNotesSession(state.snapshot.sessionId))}
          onContinue={() => runAction(() => resumeSmartNotesSession(state.snapshot.sessionId))}
          onFinish={() => runAction(() => finishSmartNotesSession(state.snapshot.sessionId))}
        />

        <SmartNotesPanel documentId={documentId} initialContent={initialNote?.content ?? ''} initialUpdatedAt={initialNote?.updatedAt ?? null} />
      </div>
    </div>
  )
}
