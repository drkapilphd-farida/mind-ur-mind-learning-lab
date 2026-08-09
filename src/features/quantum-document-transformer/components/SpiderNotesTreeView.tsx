'use client'

import { useState } from 'react'
import { ChevronRight, Compass, Flame, GitBranch, Heart, Leaf, Sparkles, type LucideIcon } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { SpiderNote } from '../types'

// Vibrant Mind Map™ — a fixed 5-color rotation for major (depth-1)
// branches, cycled by index rather than tied to branch content (the
// model never returns a color/category — this is purely a visual
// parsing aid, "which branch is which" at a glance, in both the radial
// map and the mobile list). Every class below is a static, literal
// Tailwind class name (never built via string interpolation) so
// Tailwind's build-time scanner can actually find and generate it.
type BranchAccent = { border: string; bg: string; text: string; dot: string; stroke: string; icon: LucideIcon }

// `dot` is its own literal class (not derived from `text` at runtime via
// string replacement) — Tailwind's build-time scanner only generates CSS
// for class names it can find as literal strings in source, so a
// runtime-computed `"text-blue-600".replace('text-', 'bg-')` would
// silently produce an un-styled, invisible class in the actual build.
const BRANCH_ACCENTS: readonly BranchAccent[] = [
  { border: 'border-blue-400/50', bg: 'bg-blue-500/[0.08]', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', stroke: 'stroke-blue-500', icon: Compass },
  { border: 'border-emerald-400/50', bg: 'bg-emerald-500/[0.08]', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', stroke: 'stroke-emerald-500', icon: Leaf },
  { border: 'border-amber-400/50', bg: 'bg-amber-500/[0.08]', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', stroke: 'stroke-amber-500', icon: Flame },
  { border: 'border-violet-400/50', bg: 'bg-violet-500/[0.08]', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500', stroke: 'stroke-violet-500', icon: Sparkles },
  { border: 'border-rose-400/50', bg: 'bg-rose-500/[0.08]', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', stroke: 'stroke-rose-500', icon: Heart },
]

function branchAccentFor(index: number): BranchAccent {
  return BRANCH_ACCENTS[index % BRANCH_ACCENTS.length]!
}

type TreeNodeProps = {
  node: SpiderNote
  depth: number
  // Only ever set for depth-1 nodes (this branch's own color, carried
  // down so a depth-2+ descendant can still show a faint tint of which
  // branch it belongs to instead of going flat neutral).
  accent: BranchAccent | null
}

// Root and its direct branches (depth 0/1) start expanded so the main
// shape of the mind map is visible at a glance; anything deeper starts
// collapsed to keep the initial view scannable, per the "clean, not
// exhaustive" brief — a chevron always lets a learner go deeper.
function TreeNode({ node, depth, accent }: TreeNodeProps): React.JSX.Element {
  const hasChildren = node.children.length > 0
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const prefersReducedMotion = usePrefersReducedMotion()
  const BranchIcon = accent?.icon

  const nodeContent = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm leading-snug shadow-sm transition-colors',
        depth === 0 && 'border-primary bg-primary text-primary-foreground text-base font-bold',
        depth === 1 && accent && cn(accent.border, accent.bg, 'font-semibold text-foreground'),
        depth > 1 && 'border-border bg-card text-foreground/90',
      )}
    >
      {depth === 1 && BranchIcon && <BranchIcon className={cn('size-3.5 shrink-0', accent?.text)} aria-hidden="true" />}
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
            <span className={cn('size-1.5 rounded-full', accent ? accent.dot : 'bg-muted-foreground/40')} />
          </span>
          {nodeContent}
        </div>
      )}

      {hasChildren && isExpanded && (
        <ul
          className={cn(
            'mt-2.5 ml-2.5 space-y-2.5 border-l-2 pl-5',
            accent ? accent.border : 'border-primary/15',
            !prefersReducedMotion && 'animate-in fade-in slide-in-from-top-1 duration-200',
          )}
        >
          {node.children.map((child, index) => (
            <TreeNode key={`${depth}-${index}-${child.label}`} node={child} depth={depth + 1} accent={depth === 0 ? branchAccentFor(index) : accent} />
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
// either way. Wrapped in `.quantum-mindmap-glass` (globals.css) with a
// couple of soft, static color blobs behind it for real depth — purely
// decorative, so they're skipped under prefers-reduced-motion by simply
// never being animated in the first place (nothing here moves).
function MindMapRadial({ root }: { root: SpiderNote }): React.JSX.Element {
  const branches = root.children
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="quantum-mindmap-glass relative min-h-[500px] w-full overflow-hidden p-4">
      {/* Soft depth-tinting — two blurred color blobs echoing the first
          two branch accents, anchored behind the map content (z-0) so
          the glass surface reads as more than a flat tinted rectangle. */}
      <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-blue-400/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full bg-rose-400/20 blur-3xl" aria-hidden="true" />

      {branches.length > 0 && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {branches.map((branch, index) => {
            const { x, y } = computeBranchPosition(index, branches.length)
            const accent = branchAccentFor(index)
            return (
              <line
                key={`line-${index}-${branch.label}`}
                x1={50}
                y1={50}
                x2={x}
                y2={y}
                className={accent.stroke}
                strokeOpacity={0.45}
                strokeWidth={0.6}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
      )}

      <div
        className={cn(
          'brand-gradient absolute left-1/2 top-1/2 z-10 w-[176px] -translate-x-1/2 -translate-y-1/2 rounded-2xl px-4 py-3 text-center shadow-lg ring-1 ring-white/20',
          !prefersReducedMotion && 'animate-in zoom-in-95 fade-in duration-300',
        )}
      >
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="size-3.5 shrink-0 text-white/90" aria-hidden="true" />
          <p className="line-clamp-4 text-sm font-bold leading-snug text-white">{root.label}</p>
        </div>
      </div>

      {branches.map((branch, index) => {
        const { x, y } = computeBranchPosition(index, branches.length)
        const accent = branchAccentFor(index)
        const BranchIcon = accent.icon
        return (
          <div
            key={`branch-${index}-${branch.label}`}
            className={cn(
              'absolute z-10 w-[192px] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-3 shadow-sm backdrop-blur-sm',
              accent.border,
              accent.bg,
              !prefersReducedMotion && 'animate-in zoom-in-95 fade-in duration-300',
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="flex items-start gap-1.5">
              <BranchIcon className={cn('mt-0.5 size-3.5 shrink-0', accent.text)} aria-hidden="true" />
              <p className="line-clamp-3 text-xs font-semibold leading-snug text-foreground">{branch.label}</p>
            </div>
            {branch.children.length > 0 && (
              <div className={cn('mt-2 max-h-28 overflow-y-auto border-t pt-2', accent.border)}>
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
// JSON Schema) two ways from the exact same data: a vibrant, color-coded
// radial mind-map (central node + connecting branch lines, sm+ widths)
// and a plain expandable hierarchy list (all widths, primary on mobile)
// — never a fabricated diagram, always exactly the hierarchy the model
// returned. No graph/canvas library — both views are plain DOM/CSS/SVG
// and stay fully performant and keyboard/screen-reader accessible at any
// depth. Per-branch color (see BRANCH_ACCENTS above) is a deliberate,
// scoped exception to this app's usual "color is reserved, not default"
// rule — the same kind of named, scoped exception `.glass-premium`
// already is elsewhere in globals.css — because instant visual parsing
// of "which branch is which" is the whole point of a mind map.
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
          <TreeNode node={root} depth={0} accent={null} />
        </ul>
      </div>

      <div className="mt-3 hidden sm:block">
        <MindMapRadial root={root} />
      </div>
    </div>
  )
}
