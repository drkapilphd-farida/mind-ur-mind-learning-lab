import { Flag, Lightbulb } from 'lucide-react'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { Badge } from '@/components/ui/badge'
import type { ModeChunkView } from '@/features/learning-mode-runtime'

type ResearchCardProps = {
  chunk: ModeChunkView
}

const MAX_CONCEPT_CHIPS = 6

// Research Mode™ — Production AI Integration (ALS-24). "Deep concept
// exploration," genuinely real this time: when this chunk has real,
// AI-extracted enrichment (UCE-3B, wired into the real pipeline this
// sprint), its real semantic summary, key concepts, and definitions are
// shown alongside the chunk's own real content — never fabricated, never
// shown for a chunk whose enrichment failed or was skipped (an honest
// empty state instead, matching this platform's own "no fake AI"
// discipline). Structurally mirrors Revision Mode™'s own `RevisionCard.tsx`
// (aria-live region, remount-on-chunk-change transition, checkpoint
// badge, calm left-aligned typography) for the base content, adding the
// real enrichment panel beneath it.
export function ResearchCard({ chunk }: ResearchCardProps): React.JSX.Element {
  const enrichment = chunk.enrichment
  const concepts = [...(enrichment?.concepts ?? [])].slice(0, MAX_CONCEPT_CHIPS)
  const definitions = enrichment?.definitions ?? []
  const hasRealEnrichment = enrichment !== undefined && (enrichment.semantic !== undefined || concepts.length > 0 || definitions.length > 0)

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

        {hasRealEnrichment ? (
          <div className="mx-auto mt-6 max-w-[65ch] space-y-4 border-t pt-6">
            {enrichment?.semantic !== undefined && (
              <div className="flex items-start gap-2">
                <Lightbulb className={`${ICON_SIZE.sm} mt-0.5 shrink-0 text-primary`} aria-hidden="true" />
                <p className="text-sm leading-relaxed text-muted-foreground">{enrichment.semantic}</p>
              </div>
            )}

            {concepts.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {concepts.map((concept) => (
                  <Badge key={concept} variant="secondary">
                    {concept}
                  </Badge>
                ))}
              </div>
            )}

            {definitions.length > 0 && (
              <dl className="space-y-2">
                {definitions.map((definition) => (
                  <div key={definition.term}>
                    <dt className="text-sm font-medium text-foreground">{definition.term}</dt>
                    <dd className="text-sm text-muted-foreground">{definition.definition}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ) : (
          <p className="mx-auto mt-6 max-w-[65ch] border-t pt-6 text-sm text-muted-foreground">This section doesn&apos;t have real AI-extracted concepts yet.</p>
        )}
      </div>
    </div>
  )
}
