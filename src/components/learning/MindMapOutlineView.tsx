import Link from 'next/link'
import { Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { MindMapOutline } from '@/lib/learning-modes/generateMindMapOutline'

type MindMapOutlineViewProps = {
  projectId: string
  outline: MindMapOutline
}

// AI Learning Studio™ Sprint ALS-13 — Mind Map™. A real, ordered outline
// of the document's own real sections — each node is one real chunk, in
// real reading order.
//
// AI Learning Studio™ Sprint ALS-19 — Production Polish™. Added the same
// `animate-in fade-in duration-(--duration-base)` entrance every stepped-
// session mode's own primary content view already uses — a production
// consistency audit found this view (and Flashcards™'s own) was the only
// one with no entrance motion at all. Purely cosmetic.
//
// Production AI Integration — ALS-24. `outline.concepts` is now real
// (previously always empty, since no AI was ever wired in) — a real
// concept list, sourced entirely from the already-built knowledge graph.
// Rendered as a second section beneath the outline; a document whose
// chunks aren't enriched yet still shows the honest empty state below,
// nothing new to break.
export function MindMapOutlineView({ projectId, outline }: MindMapOutlineViewProps): React.JSX.Element {
  return (
    <div className="animate-in fade-in mx-auto max-w-2xl space-y-8 px-6 py-12 duration-(--duration-base)">
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
          🗺
        </span>
        <div>
          <p className={TYPOGRAPHY.label}>Mind Map™</p>
          <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>{outline.documentTitle}</h1>
          <p className={cn(TYPOGRAPHY.small, 'mt-2')}>
            {outline.nodes.length} section{outline.nodes.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {outline.nodes.length > 0 ? (
        <Card>
          <CardContent>
            <ol className="relative space-y-1 border-l border-border pl-6">
              {outline.nodes.map((node, index) => (
                <li key={node.id} className="relative py-3">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.6rem] flex size-6 items-center justify-center rounded-full border border-border bg-background text-xs font-medium tabular-nums text-muted-foreground"
                  >
                    {index + 1}
                  </span>
                  <p className={TYPOGRAPHY.body}>{node.title}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <MapIcon className={cn(ICON_SIZE.lg, 'mx-auto text-muted-foreground/40')} aria-hidden="true" />
            <p className={cn(TYPOGRAPHY.small, 'mt-3')}>No sections were found in this document yet.</p>
          </CardContent>
        </Card>
      )}

      {outline.concepts.length > 0 ? (
        <div className="space-y-3">
          <p className={TYPOGRAPHY.label}>Key concepts</p>
          <Card>
            <CardContent className="space-y-4">
              {outline.concepts.map((concept) => (
                <div key={concept.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn(TYPOGRAPHY.body, 'font-medium')}>{concept.label}</p>
                    <span className={cn(TYPOGRAPHY.small, 'text-muted-foreground')}>
                      {concept.occurrenceCount} section{concept.occurrenceCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  {concept.relatedChunkTitles.length > 0 ? <p className={cn(TYPOGRAPHY.small, 'text-muted-foreground')}>{concept.relatedChunkTitles.join(' · ')}</p> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-3">
        <Button asChild variant="ghost">
          <Link href={`/preview/learning-projects/${projectId}`}>Back to Learning Blueprint</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/preview/learning-studio">Back to AI Learning Studio™</Link>
        </Button>
      </div>
    </div>
  )
}
