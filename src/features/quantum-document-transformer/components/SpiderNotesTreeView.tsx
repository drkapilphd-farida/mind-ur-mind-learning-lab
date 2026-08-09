'use client'

import { useState } from 'react'
import { ChevronRight, GitBranch } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { SpiderNote } from '../types'

type TreeNodeProps = {
  node: SpiderNote
  depth: number
}

// Depth-based tinting (token opacity, not new colors) is what actually
// carries the "mind map" read at a glance — the root node anchors the
// whole tree in solid brand color, first-level branches get a soft
// tint, everything deeper stays neutral so the tree doesn't turn into a
// wall of color as it gets wide.
function nodeToneClassName(depth: number): string {
  if (depth === 0) return 'border-primary bg-primary text-primary-foreground'
  if (depth === 1) return 'border-primary/25 bg-primary/[0.06] text-foreground'
  return 'border-border bg-card text-foreground/90'
}

// Root and its direct branches (depth 0/1) start expanded so the main
// shape of the mind map is visible at a glance; anything deeper starts
// collapsed to keep the initial view scannable, per the "clean, not
// exhaustive" brief — a chevron always lets a learner go deeper.
function TreeNode({ node, depth }: TreeNodeProps): React.JSX.Element {
  const hasChildren = node.children.length > 0
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const prefersReducedMotion = usePrefersReducedMotion()

  const nodeContent = (
    <span
      className={cn(
        'rounded-xl border px-4 py-2.5 text-sm leading-snug shadow-sm transition-colors',
        nodeToneClassName(depth),
        depth === 0 && 'text-base font-bold',
        depth === 1 && 'font-semibold',
      )}
    >
      {node.label}
    </span>
  )

  return (
    <li>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="group flex w-full items-start gap-2 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.label}`}
        >
          <span className="mt-2 flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-foreground/[0.06] group-hover:text-foreground">
            <ChevronRight className={cn('size-3.5 transition-transform', isExpanded && 'rotate-90')} aria-hidden="true" />
          </span>
          {nodeContent}
        </button>
      ) : (
        <div className="flex items-start gap-2">
          <span aria-hidden="true" className="mt-3 flex size-5 shrink-0 items-center justify-center">
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          </span>
          {nodeContent}
        </div>
      )}

      {hasChildren && isExpanded && (
        <ul
          className={cn(
            'mt-2.5 ml-2.5 space-y-2.5 border-l-2 border-primary/15 pl-5',
            !prefersReducedMotion && 'animate-in fade-in slide-in-from-top-1 duration-200',
          )}
        >
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
// JSON Schema) as an expandable mind map: each node its own card, tinted
// by depth so the shape of the hierarchy reads at a glance, connected by
// a colored left border rather than a plain nested list — never a
// fabricated diagram, always exactly the hierarchy the model returned.
// No graph/canvas library — the data is already a clean tree and this
// DOM/CSS approach stays fully performant and keyboard/screen-reader
// accessible at any depth without one.
export function SpiderNotesTreeView({ root }: SpiderNotesTreeViewProps): React.JSX.Element {
  return (
    <div className="quantum-section-card p-5">
      <div className="flex items-center gap-2">
        <div className="quantum-icon-chip" aria-hidden="true">
          <GitBranch className="size-3.5 text-indigo-500" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-foreground">Spider Notes</p>
      </div>
      <ul className="mt-4">
        <TreeNode node={root} depth={0} />
      </ul>
    </div>
  )
}
