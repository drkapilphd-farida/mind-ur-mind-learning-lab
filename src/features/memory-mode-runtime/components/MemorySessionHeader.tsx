import { Brain } from 'lucide-react'
import { SessionTimer } from '@/features/learning-mode-runtime/components'

type MemorySessionHeaderProps = {
  documentTitle: string
  startedAt: string | null
}

// Memory Mode™ Sprint-2 — Memory Session Header. A small, dedicated
// header naming what this session is for and, when the session has a
// real `startedAt` (LSE-1's own, reused verbatim via the Shared Session
// Timer), how long the learner has spent this visit. No new state, no
// new metric — the same real fields Quantum Speed Reading™'s own inline
// workspace header already reads, given their own named component per
// this sprint's brief.
//
// Memory Mode™ Sprint-5 polish: `min-w-0`/`truncate` keep a long real
// document title from crowding or wrapping the timer on narrow viewports
// — the full title stays available via the native `title` attribute. A
// soft entrance (`fade-in slide-in-from-top-1`) matches the same
// micro-interaction language used elsewhere this sprint. No prop, no
// data, no layout structure changed.
export function MemorySessionHeader({ documentTitle, startedAt }: MemorySessionHeaderProps): React.JSX.Element {
  return (
    <div className="animate-in fade-in slide-in-from-top-1 flex items-center justify-between gap-3 duration-(--duration-base)">
      <div className="flex min-w-0 items-center gap-2">
        <Brain className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <h1 className="truncate text-lg font-semibold text-foreground" title={documentTitle}>
          {documentTitle}
        </h1>
      </div>
      {startedAt !== null && <SessionTimer startedAt={startedAt} />}
    </div>
  )
}
