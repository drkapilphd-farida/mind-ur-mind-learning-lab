import { Flag } from 'lucide-react'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { ReadingChunkView } from '../types/ReadingChunkView'

type ReadingChunkViewerProps = {
  chunk: ReadingChunkView
}

// Quantum Speed Reading™ Production Sprint-3.
//
// Typography System — comfortable reading width (`max-w-[65ch]`, the
// real, commonly-cited optimal measure for sustained reading, applied to
// the text itself rather than the card so the card can still match the
// Workspace's own width); dynamic line spacing (`leading-relaxed`,
// opening up to `leading-loose` at larger viewports, where a slightly
// airier rhythm reads better); responsive font scaling
// (`text-lg sm:text-xl`) — real viewport-driven steps, never a user-facing
// control (font size was never named among this sprint's Reading
// Controls, unlike the theme selector and focus toggle, which were).
//
// Chunk Transition — the *inner* card remounts on every real chunk change
// (`key={chunk.chunkNodeId}`) so the existing `animate-in fade-in`
// utility (already documented in DESIGN_SYSTEM.md §7 — not a new
// animation primitive) re-triggers per chunk, paired with the design
// system's own `--duration-base` token. The platform's own global
// `prefers-reduced-motion` fallback (globals.css) collapses this
// automatically for anyone who needs that — no separate check needed
// here. The *outer* `aria-live` region deliberately does not remount, so
// screen readers reliably announce each new chunk instead of losing the
// region entirely on every navigation.
//
// Real content, plain text — no word highlighting, no flashing, per this
// sprint's own explicit exclusions.
//
// AI Learning Studio™ Sprint ALS-19 — Production Polish™. The checkpoint
// badge's own icon now uses `ICON_SIZE.sm` instead of a hand-typed
// `size-3.5` — a production consistency audit found this was the one
// mode's primary content view with zero design-token usage anywhere,
// unlike every later mode's own equivalent. Purely cosmetic; the value is
// identical (`ICON_SIZE.sm` is itself `size-3.5`).
export function ReadingChunkViewer({ chunk }: ReadingChunkViewerProps): React.JSX.Element {
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
