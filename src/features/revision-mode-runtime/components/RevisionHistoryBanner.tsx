import { History } from 'lucide-react'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { DocumentRevisionContext } from '../queries/getDocumentRevisionContext'

type RevisionHistoryBannerProps = {
  context: DocumentRevisionContext
}

// Revision Mode™ — AI Learning Studio™ Sprint ALS-17. A real, honest
// summary of the learner's own past sessions on this document (Reading™/
// Memory Mode™/Smart Notes™/Focus Mode™, aggregated by
// `getDocumentRevisionContext.ts`) — purely informational, shown once
// before starting, never used to filter or reorder the session's real
// content. Deliberately says "across your past sessions," not "last
// time" — the real counts are a union across every past session, not a
// single one, and this copy stays honest about that rather than implying
// more precision than the real data has.
export function RevisionHistoryBanner({ context }: RevisionHistoryBannerProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4 text-left">
      <History className={cn(ICON_SIZE.md, 'mt-0.5 shrink-0 text-muted-foreground')} aria-hidden="true" />
      {context.hasHistory ? (
        <p className={TYPOGRAPHY.small}>
          Across your past sessions on this document, you skipped {context.skippedCount} section{context.skippedCount === 1 ? '' : 's'} and revisited {context.revisitedCount} section{context.revisitedCount === 1 ? '' : 's'}.
        </p>
      ) : (
        <p className={TYPOGRAPHY.small}>No previous sessions yet on this document — this will be your first pass.</p>
      )}
    </div>
  )
}
