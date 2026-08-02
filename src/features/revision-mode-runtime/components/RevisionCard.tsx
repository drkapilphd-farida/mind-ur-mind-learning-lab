import { Flag } from 'lucide-react'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { ModeChunkView } from '@/features/learning-mode-runtime'

type RevisionCardProps = {
  chunk: ModeChunkView
}

// Revision Mode™ — AI Learning Studio™ Sprint ALS-17. The real chunk's
// real content, always fully visible — no reveal, no per-chunk framing.
// Structurally mirrors Focus Mode™'s own `FocusCard.tsx` (aria-live
// region, remount-on-chunk-change transition, checkpoint badge, calm
// left-aligned typography) — a revision pass is a plain re-read, not a
// distinct interaction pattern.
export function RevisionCard({ chunk }: RevisionCardProps): React.JSX.Element {
  return (
    <div aria-live="polite" aria-atomic="true">
      <div key={chunk.chunkNodeId} className="animate-in fade-in rounded-xl border bg-card p-6 duration-(--duration-base) sm:p-8">
        {chunk.isCheckpoint && chunk.checkpointLabel !== undefined && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Flag className={ICON_SIZE.sm} aria-hidden="true" />
            Checkpoint — {chunk.checkpointLabel}
          </div>
        )}
        <p className="mx-auto max-w-[65ch] text-lg leading-relaxed whitespace-pre-wrap text-foreground sm:text-xl sm:leading-loose">{chunk.content}</p>
      </div>
    </div>
  )
}
