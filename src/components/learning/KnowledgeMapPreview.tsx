import { Beaker, BookOpen, ChevronDown, Milestone, Quote, Rocket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { KnowledgeMapNode, KnowledgeMapNodeLevel } from '@/types/learning/blueprint'

const LEVEL_ICON: Record<KnowledgeMapNodeLevel, LucideIcon> = {
  topic: Milestone,
  subtopic: BookOpen,
  definition: Quote,
  example: Beaker,
  application: Rocket,
}

const LEVEL_LABEL: Record<KnowledgeMapNodeLevel, string> = {
  topic: 'Topic',
  subtopic: 'Subtopic',
  definition: 'Definition',
  example: 'Example',
  application: 'Application',
}

// Progressive left-indent per level, deepening the hierarchy visually
// (Topic flush left, everything below it nested further in). Fixed
// class names, not string-interpolated, so Tailwind's compiler can see
// them statically.
const LEVEL_INDENT: Record<KnowledgeMapNodeLevel, string> = {
  topic: 'ml-0',
  subtopic: 'ml-4',
  definition: 'ml-8',
  example: 'ml-8',
  application: 'ml-8',
}

type KnowledgeMapPreviewProps = {
  nodes: readonly KnowledgeMapNode[]
}

// Sprint 2, Chunk 2 — Knowledge Map Preview. "Not a real graph" — a
// reusable, generic renderer for any level-tagged node chain, connected
// visually with a chevron between cards. Takes plain data, so it works
// for any future node list, not just this one Topic → Subtopic →
// Definition → Example → Application chain.
export function KnowledgeMapPreview({ nodes }: KnowledgeMapPreviewProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-stretch">
      {nodes.map((node, index) => {
        const Icon = LEVEL_ICON[node.level]

        return (
          <div key={node.id} className={cn('w-full max-w-full', LEVEL_INDENT[node.level])}>
            <Card>
              <CardContent className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className={ICON_SIZE.md} />
                </span>
                <div className="min-w-0">
                  <p className={TYPOGRAPHY.label}>{LEVEL_LABEL[node.level]}</p>
                  <p className={cn(TYPOGRAPHY.body, 'mt-0.5')}>{node.label}</p>
                </div>
              </CardContent>
            </Card>
            {index < nodes.length - 1 && (
              <div aria-hidden="true" className="flex justify-center py-1 text-muted-foreground/40">
                <ChevronDown className={ICON_SIZE.md} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
