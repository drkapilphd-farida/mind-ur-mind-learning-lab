'use client'

import { useState } from 'react'
import { ChevronRight, GitBranch } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { SpiderNote } from '../types'

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

// A compact, always-expanded nested list used INSIDE a radial branch
// card (below) for depth-2-and-deeper descendants — no click-to-expand
// here, since the card itself is already the "drill in" affordance the
// radial layout offers; a long/deep sub-tree just scrolls within its own
// card (max-h + overflow-y-auto below) rather than growing the card
// itself, which keeps every other branch's position on the circle
// stable regardless of how much any one branch actually contains.
function MindMapNestedList({ nodes, depth }: { nodes: readonly SpiderNote[]; depth: number }): React.JSX.Element | null {
  if (nodes.length === 0) return null
  return (
    <ul className={cn('space-y-1', depth > 2 && 'ml-2.5 mt-1 border-l border-border pl-2.5')}>
      {nodes.map((node, index) => (
        <li key={`${depth}-${index}-${node.label}`}>
          <div className="flex items-start gap-1.5">
            <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
            <span className="text-[11px] leading-snug text-foreground/80">{node.label}</span>
          </div>
          <MindMapNestedList nodes={node.children} depth={depth + 1} />
        </li>
      ))}
    </ul>
  )
}

// Evenly spreads `count` branch nodes around the center — plain
// trigonometry, computed once per render from the branch count alone, so
// it's identical on server and client (no DOM measurement, no hydration
// mismatch). Every coordinate is a PERCENTAGE of the container's own
// width/height, and the connector SVG below shares that exact same
// 0–100 coordinate space (via viewBox="0 0 100 100"
// preserveAspectRatio="none"), so the lines always land exactly on each
// card's center regardless of the container's real pixel size — fully
// responsive without a ResizeObserver.
//
// Starts a HALF step past 12 o'clock (`Math.PI / count`), not exactly at
// it: for the common even branch counts (2, 4, 6...) starting exactly at
// the top places nodes on the cardinal axes, which draws perfectly
// horizontal/vertical connector lines that read as a plus-sign/compass
// rather than a radiating fan. The half-step rotation avoids that for
// every count without needing special-casing.
function computeBranchPosition(index: number, count: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + Math.PI / count + (2 * Math.PI * index) / count
  const radiusX = 40
  const radiusY = 36
  return { x: 50 + radiusX * Math.cos(angle), y: 50 + radiusY * Math.sin(angle) }
}

// Visual Mind-Map™ — the central topic as a solid hub, its direct
// branches arranged in a circle around it with SVG connector lines, each
// branch card holding its own deeper descendants as a compact nested
// list. Shown at sm+ widths only (see SpiderNotesTreeView below) — a
// true radial layout doesn't have room to breathe on a phone screen, so
// narrow viewports get the plain hierarchical list instead, same data
// either way.
function MindMapRadial({ root }: { root: SpiderNote }): React.JSX.Element {
  const branches = root.children
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="relative min-h-[480px] w-full overflow-visible">
      {branches.length > 0 && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {branches.map((branch, index) => {
            const { x, y } = computeBranchPosition(index, branches.length)
            return (
              <line
                key={`line-${index}-${branch.label}`}
                x1={50}
                y1={50}
                x2={x}
                y2={y}
                className="stroke-primary"
                strokeOpacity={0.3}
                strokeWidth={0.5}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
      )}

      <div
        className={cn(
          'absolute left-1/2 top-1/2 z-10 w-[176px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-primary bg-primary px-4 py-3 text-center shadow-lg',
          !prefersReducedMotion && 'animate-in zoom-in-95 fade-in duration-300',
        )}
      >
        <p className="line-clamp-4 text-sm font-bold leading-snug text-primary-foreground">{root.label}</p>
      </div>

      {branches.map((branch, index) => {
        const { x, y } = computeBranchPosition(index, branches.length)
        return (
          <div
            key={`branch-${index}-${branch.label}`}
            className={cn(
              'absolute z-10 w-[188px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary/25 bg-primary/[0.06] p-3 shadow-sm',
              !prefersReducedMotion && 'animate-in zoom-in-95 fade-in duration-300',
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <p className="line-clamp-3 text-xs font-semibold leading-snug text-foreground">{branch.label}</p>
            {branch.children.length > 0 && (
              <div className="mt-2 max-h-28 overflow-y-auto border-t border-primary/10 pt-2">
                <MindMapNestedList nodes={branch.children} depth={2} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

type SpiderNotesTreeViewProps = {
  root: SpiderNote
}

// AI Document Transformer™ — Spider Notes visualization. Renders the
// real, already-generated spider_notes tree (see
// src/lib/ai/tools/quantumDocumentIntelligenceTool.ts's own recursive
// JSON Schema) two ways from the exact same data: a true radial
// mind-map (central node + connecting branch lines, sm+ widths) and a
// plain expandable hierarchy list (all widths, primary on mobile) — never
// a fabricated diagram, always exactly the hierarchy the model returned.
// No graph/canvas library — both views are plain DOM/CSS/SVG and stay
// fully performant and keyboard/screen-reader accessible at any depth.
export function SpiderNotesTreeView({ root }: SpiderNotesTreeViewProps): React.JSX.Element {
  return (
    <div className="quantum-section-card p-5">
      <div className="flex items-center gap-2">
        <div className="quantum-icon-chip" aria-hidden="true">
          <GitBranch className="size-3.5 text-indigo-500" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-foreground">Spider Notes</p>
      </div>

      <div className="mt-4 sm:hidden">
        <ul>
          <TreeNode node={root} depth={0} />
        </ul>
      </div>

      <div className="mt-2 hidden sm:block">
        <MindMapRadial root={root} />
      </div>
    </div>
  )
}
