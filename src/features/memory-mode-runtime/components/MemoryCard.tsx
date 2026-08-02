import { useState } from 'react'
import { Flag, Layers, MapPinned, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { ModeChunkView } from '@/features/learning-mode-runtime'
import { getMemoryMethodDefinition } from '../types/MemoryMethod'
import type { MemoryMethodId } from '../types/MemoryMethod'

type MemoryCardProps = {
  chunk: ModeChunkView
  method: MemoryMethodId
  queueIndex: number
  totalChunks: number
}

function fallbackLabel(chunk: ModeChunkView): string {
  return chunk.title ?? chunk.sectionHeading ?? `Section ${chunk.order + 1}`
}

const MAX_KEY_CONCEPT_CHIPS = 4

// Production AI Integration — ALS-24. Real material only — never a
// generated narrative or association, per `types/MemoryMethod.ts`'s own
// rule. A capped, deduplicated list so a heavily-enriched chunk doesn't
// crowd the card.
function keyConceptChips(chunk: ModeChunkView): readonly string[] {
  const labels = [...(chunk.enrichment?.concepts ?? []), ...(chunk.enrichment?.examples ?? [])]
  return [...new Set(labels)].slice(0, MAX_KEY_CONCEPT_CHIPS)
}

// Memory Mode™ Sprint-2 — Memory Card Presentation Layer.
//
// "Card" here names a visual container for the current concept, not an
// interaction pattern — there is no front/back, no flip, no "reveal
// answer." The chunk's real content (`ModeChunkView.content`, resolved
// server-side from the same ULO/LSE-2 scheduling QSR uses) is always
// fully visible. Mirrors Quantum Speed Reading™'s own
// `ReadingChunkViewer.tsx` structurally (aria-live region, remount-on-
// chunk-change transition, checkpoint badge) while giving Memory Mode its
// own distinct visual identity — a centered, more deeply rounded card
// versus Reading's left-aligned justified paragraph, since a "concept to
// remember" reads differently than "a passage to read."
//
// AI Learning Studio™ Sprint ALS-15 — Version-1 Memory Mode™. The one
// real behavior change since Sprint-5: rendering now varies by the
// session's real, chosen `MemoryMethodId` — but the underlying content is
// always the same real `chunk.content`, never fabricated per method (see
// `types/MemoryMethod.ts` for why). Story/Visualization/Association show
// a real instructional prompt banner above the same content. Chunking
// shows the chunk's own real `sectionHeading` as a group label. Journey
// shows the real `queueIndex`/`totalChunks` position as a "stop." Recall
// Practice is the one method with a real interaction: the real heading
// shows first, content is hidden until tapped — local, per-chunk
// `isRevealed` state, reset for free because `MemoryWorkspace` now keys
// this component by `chunk.chunkNodeId` (a fresh mount per chunk, so nothing
// needs a manual reset effect).
//
// Production AI Integration — ALS-24. Story/Visualization/Association
// still never fabricate a narrative, image, or association — the
// learner builds their own, per `types/MemoryMethod.ts`'s own rule. What
// changes: when a chunk has real, AI-extracted `enrichment.concepts`/
// `examples`, they're now shown as real chips beneath the instruction
// banner — genuine material to anchor the learner's own story/image/
// association to, never an invented one. A chunk with no real enrichment
// yet renders exactly as before, nothing new to break.
//
// Chunk Transition — the inner card still remounts on every real chunk
// change (`key={chunk.chunkNodeId}`, now also mirrored one level up by
// the parent's own key on this component), re-triggering the existing
// `animate-in fade-in zoom-in-95` utilities paired with the design
// system's own `--duration-base` token. The platform's own global
// `prefers-reduced-motion` fallback (globals.css) collapses this
// automatically. The outer `aria-live` region deliberately does not
// remount, so screen readers reliably announce each new concept instead
// of losing the region on every navigation.
export function MemoryCard({ chunk, method, queueIndex, totalChunks }: MemoryCardProps): React.JSX.Element {
  const [isRevealed, setIsRevealed] = useState(method !== 'recall-practice')
  const definition = getMemoryMethodDefinition(method)

  return (
    <div aria-live="polite" aria-atomic="true">
      <div key={chunk.chunkNodeId} className="animate-in fade-in zoom-in-95 mx-auto max-w-xl rounded-2xl bg-card p-8 text-center shadow-md ring-1 ring-foreground/10 duration-(--duration-base) sm:p-10">
        {chunk.isCheckpoint && chunk.checkpointLabel !== undefined && (
          <div className="animate-in fade-in slide-in-from-top-1 mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary duration-(--duration-base)">
            <Flag className={ICON_SIZE.sm} aria-hidden="true" />
            Checkpoint — {chunk.checkpointLabel}
          </div>
        )}

        {definition.instruction !== null && (
          <p className="mx-auto mb-4 max-w-md text-sm text-muted-foreground italic">{definition.instruction}</p>
        )}

        {definition.instruction !== null && keyConceptChips(chunk).length > 0 && (
          <div className="mx-auto mb-4 flex max-w-md flex-wrap justify-center gap-1.5">
            {keyConceptChips(chunk).map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        )}

        {method === 'chunking' && (
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Layers className={ICON_SIZE.sm} aria-hidden="true" />
            {chunk.sectionHeading ?? 'Ungrouped'}
          </Badge>
        )}

        {method === 'journey' && (
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <MapPinned className={ICON_SIZE.sm} aria-hidden="true" />
            Stop {queueIndex + 1} of {totalChunks}
          </Badge>
        )}

        {method === 'recall-practice' && !isRevealed ? (
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="w-full space-y-3 rounded-lg text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <p className="text-lg font-semibold text-foreground sm:text-xl">{fallbackLabel(chunk)}</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className={ICON_SIZE.sm} aria-hidden="true" />
              Recall it, then tap to check
            </span>
          </button>
        ) : (
          <p className="text-lg leading-relaxed whitespace-pre-wrap text-foreground sm:text-xl sm:leading-loose">{chunk.content}</p>
        )}
      </div>
    </div>
  )
}
