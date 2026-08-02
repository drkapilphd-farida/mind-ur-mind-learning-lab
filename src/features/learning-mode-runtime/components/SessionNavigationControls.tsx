import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SessionSnapshot } from '@/core/learning-session-runtime'

type SessionNavigationControlsProps = {
  status: SessionSnapshot['status']
  queueIndex: number
  pending: boolean
  onPrevious: () => void
  onNext: () => void
  onPause: () => void
  onContinue: () => void
  onFinish: () => void
}

// Shared Learning Runtime — Memory Mode™ Sprint-2 shared-extraction.
// Moved from Quantum Speed Reading™'s own
// `components/ReadingNavigationControls.tsx` (Sprint-2/3) — Previous /
// Next / Continue / Finish, each a direct call into one of the Shared
// Learning Runtime's real session-lifecycle actions (wired by the parent
// Workspace). Already fully mode-agnostic — every label is a real,
// generic session action, not reading-specific vocabulary.
//
// Previous is proactively disabled at `queueIndex === 0` — real
// navigation state already known client-side — but the underlying action
// still returns a real, honest `no-previous-chunk` error if reached any
// other way (a stale double-click, for instance), never assumed
// unreachable.
//
// AI Learning Studio™ V1 Living Product Sprint — each button now passes
// the existing `Button` primitive's own `loading` prop during `pending`
// (real spinner + `aria-busy`, already built, already used elsewhere in
// this codebase) instead of only going silently `disabled` — the exact
// "every important action receives meaningful feedback" gap this sprint
// exists to close, fixed once here for all six real Learning Modes that
// share this component.
export function SessionNavigationControls({ status, queueIndex, pending, onPrevious, onNext, onPause, onContinue, onFinish }: SessionNavigationControlsProps): React.JSX.Element {
  const isPaused = status === 'paused'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" onClick={onPrevious} disabled={isPaused || queueIndex === 0} loading={pending} title="Previous (←)">
        <ChevronLeft aria-hidden="true" />
        Previous
      </Button>

      <div className="flex items-center gap-2">
        {isPaused ? (
          <Button variant="outline" onClick={onContinue} loading={pending} title="Continue (Space)">
            <Play aria-hidden="true" />
            Continue
          </Button>
        ) : (
          <Button variant="outline" onClick={onPause} loading={pending}>
            <Pause aria-hidden="true" />
            Pause
          </Button>
        )}
        <Button variant="ghost" onClick={onFinish} loading={pending}>
          Finish
        </Button>
      </div>

      <Button onClick={onNext} disabled={isPaused} loading={pending} title="Next (→ or Space)">
        Next
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  )
}
