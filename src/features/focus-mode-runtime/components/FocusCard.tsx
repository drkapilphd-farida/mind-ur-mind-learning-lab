import { Flag } from 'lucide-react'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { ModeChunkView } from '@/features/learning-mode-runtime'

type FocusCardProps = {
  chunk: ModeChunkView
}

// Focus Mode™ (Mini) Sprint ALS-16 — Focus Card. The real chunk's real
// content (`ModeChunkView.content`, resolved server-side from the same
// ULO/LSE-2 scheduling QSR/Memory use), always fully visible — no
// front/back, no reveal, no per-variant framing here (each of the three
// Focus variants differs only in which timer/badge the Workspace shows
// above this card, never in the content itself). Structurally mirrors
// Quantum Speed Reading™'s own `ReadingChunkViewer.tsx` (aria-live region,
// remount-on-chunk-change transition, checkpoint badge, comfortable
// `max-w-[65ch]` reading width) — Focus Mode's premise is undistracted
// reading, so its card intentionally looks like Reading's own calm
// typography rather than Memory's more decorative centered treatment.
export function FocusCard({ chunk }: FocusCardProps): React.JSX.Element {
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
