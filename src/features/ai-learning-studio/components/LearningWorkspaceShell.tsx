import Link from 'next/link'
import { AlertTriangle, Clock3, FileText, PlayCircle, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { SessionErrorBanner, SessionProgressBar, SessionResumeBanner, SessionTimer } from '@/features/learning-mode-runtime/components'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { LearningModeDefinition } from '@/constants/learning/learningModes'
import type { LearningWorkspaceState } from '../types/LearningWorkspaceState'

type LearningWorkspaceShellProps = {
  projectTitle: string
  documentTitle: string
  contentTypeLabel: string
  mode: LearningModeDefinition
  state: LearningWorkspaceState
  continueHref: string | null
  backHref: string
}

const SESSION_STATUS_LABEL: Record<LearningWorkspaceState['kind'], string> = {
  unavailable: 'Not yet available',
  'not-processed': 'Not processed yet',
  'not-started': 'Not started',
  'in-progress': 'In progress',
  error: 'Needs attention',
}

// AI Learning Studio™ Sprint ALS-5 — the universal Learning Workspace™
// container every future Learning Mode plugs into. Purely presentational:
// every session fact it shows (progress, timer, resume, status) comes
// from `resolveLearningWorkspaceState`'s real read, rendered through the
// exact same shared components (`SessionProgressBar`, `SessionTimer`,
// `SessionResumeBanner`, `SessionErrorBanner`) every mode-specific
// workspace route already reuses — no second implementation of any of
// them. Deliberately shows no mode-specific content (no reading passage,
// no memory card, no notes editor) — that's each real mode's own route's
// job, reached via `continueHref` once it exists for a given mode.
export function LearningWorkspaceShell({ projectTitle, documentTitle, contentTypeLabel, mode, state, continueHref, backHref }: LearningWorkspaceShellProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
          {mode.emoji}
        </span>
        <div>
          <p className={TYPOGRAPHY.label}>Learning Workspace™</p>
          <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>{mode.title}</h1>
          <p className={cn(TYPOGRAPHY.small, 'mt-2')}>{projectTitle}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY.h4}>Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className={cn(TYPOGRAPHY.small, 'inline-flex items-center gap-1.5')}>
              <FileText className={ICON_SIZE.sm} aria-hidden="true" />
              {documentTitle}
            </span>
            <Badge variant="secondary">{contentTypeLabel}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className={cn(TYPOGRAPHY.small, 'inline-flex items-center gap-1.5')}>
              <Sparkles className={ICON_SIZE.sm} aria-hidden="true" />
              {mode.title}
            </span>
            <Badge variant={state.kind === 'in-progress' ? 'success' : state.kind === 'error' ? 'destructive' : 'secondary'}>{SESSION_STATUS_LABEL[state.kind]}</Badge>
          </div>
        </CardContent>
      </Card>

      {state.kind === 'in-progress' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={TYPOGRAPHY.h4}>Current Session</CardTitle>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className={ICON_SIZE.sm} aria-hidden="true" />
                {state.startedAt !== null && <SessionTimer startedAt={state.startedAt} />}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.didResume && <SessionResumeBanner onDismiss={() => {}} />}
            <SessionProgressBar
              completionPercentage={state.completionPercentage}
              completedChunks={state.completedChunks}
              totalChunks={state.totalChunks}
              estimatedTimeLeftSeconds={state.estimatedTimeLeftSeconds}
            />
          </CardContent>
        </Card>
      )}

      {state.kind === 'not-started' && (
        <EmptyStateCard icon={PlayCircle} title="Ready to begin" description={`Your ${mode.title} session hasn't started yet.`} />
      )}

      {state.kind === 'not-processed' && (
        <EmptyStateCard icon={AlertTriangle} title="Not processed yet" description="This document hasn't finished preparing for this Learning Mode yet." />
      )}

      {state.kind === 'unavailable' && (
        <EmptyStateCard icon={Sparkles} title={mode.title} description="Coming in a future production sprint." />
      )}

      {state.kind === 'error' && <SessionErrorBanner message={state.message} />}

      <div className="flex flex-col items-center gap-3">
        {continueHref !== null ? (
          <Button asChild size="lg" className="min-w-[220px] rounded-full">
            <Link href={continueHref}>
              <PlayCircle className="size-4" aria-hidden="true" />
              Continue to {mode.title}
              <span aria-hidden="true">→</span>
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="ghost">
          <Link href={backHref}>Back to Learning Blueprint</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/preview/learning-studio">Back to AI Learning Studio™</Link>
        </Button>
      </div>
    </div>
  )
}
