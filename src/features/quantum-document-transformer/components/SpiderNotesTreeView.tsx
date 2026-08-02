'use client'

import { useState } from 'react'
import { ChevronRight, GitBranch } from 'lucide-react'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { SpiderNote } from '../types'

type TreeNodeProps = {
  node: SpiderNote
  depth: number
}

// Root and its direct branches (depth 0/1) start expanded so the main
// shape of the mind map is visible at a glance; anything deeper starts
// collapsed to keep the initial view scannable, per the "clean, not
// exhaustive" brief — a chevron always lets a learner go deeper.
function TreeNode({ node, depth }: TreeNodeProps): React.JSX.Element {
  const hasChildren = node.children.length > 0
  const [isExpanded, setIsExpanded] = useState(depth < 2)

  return (
    <li>
      <div className="flex items-start gap-2">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.label}`}
          >
            <ChevronRight className={cn('size-3.5 transition-transform', isExpanded && 'rotate-90')} aria-hidden="true" />
          </button>
        ) : (
          <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          </span>
        )}

        <span
          className={cn(
            'rounded-lg border border-border bg-card px-3 py-1.5 text-sm leading-snug',
            depth === 0 ? 'font-semibold text-foreground' : 'text-foreground/90',
          )}
        >
          {node.label}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <ul className="mt-1.5 ml-2.5 space-y-1.5 border-l border-border/60 pl-4">
          {node.children.map((child, index) => (
            <TreeNode key={`${depth}-${index}-${child.label}`} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

type SpiderNotesTreeViewProps = {
  root: SpiderNote
}

// AI Document Transformer™ — Spider Notes visualization. Renders the
// real, already-generated spider_notes tree (see
// src/lib/ai/tools/quantumDocumentIntelligenceTool.ts's own recursive
// JSON Schema) as an expandable mind map: each node its own bordered
// card, nested branches connected by a left border rule and indent —
// never a fabricated diagram, always exactly the hierarchy the model
// returned.
export function SpiderNotesTreeView({ root }: SpiderNotesTreeViewProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-4">
      <div className="flex items-center gap-1.5">
        <GitBranch className="size-3.5 text-indigo-500" aria-hidden="true" />
        <p className={TYPOGRAPHY.label}>Spider Notes™</p>
      </div>
      <ul className="mt-3">
        <TreeNode node={root} depth={0} />
      </ul>
    </div>
  )
}
