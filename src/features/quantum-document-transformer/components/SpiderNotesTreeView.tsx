'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { ChevronRight, Compass, Flame, GitBranch, Heart, Leaf, Maximize2, Sparkles, ZoomIn, ZoomOut, type LucideIcon } from 'lucide-react'
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
            <span className="min-w-0 flex-1 text-[11px] leading-snug break-words text-foreground/80">{node.label}</span>
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

// Mobile Tree Canvas™ — the narrow-viewport replacement for the radial
// layout, which has no room to breathe below sm. A true connected tree
// (parent-child nodes joined by real SVG connector lines, at every
// depth — not just the top level) laid out top-down, sized in real
// pixels, and dropped into a pan/zoom viewport so a wide or deep tree
// stays fully explorable on a 375px phone via drag-to-pan and
// pinch-to-zoom instead of ever needing to shrink content to fit.
//
// Layout is pure arithmetic from the (collapsed-aware) node count, not a
// DOM measurement pass — same "no ResizeObserver, no hydration
// mismatch" discipline the desktop radial layout already established.
// Each node gets one integer "leaf column" reserved for it and all its
// descendants (LEAF_UNIT px wide); an internal node centers itself over
// the midpoint of its own children's columns, which is what produces
// the classic balanced/symmetric org-chart shape.
const LEAF_UNIT = 152
const ROW_HEIGHT = 108
const NODE_HEIGHT = 60
const CANVAS_PAD_X = 24
const CANVAS_PAD_TOP = 40
const CANVAS_PAD_BOTTOM = 24
const MIN_SCALE = 0.4
// "Fit to screen" is allowed to zoom out further than manual pinch/wheel/
// button zoom ever does — its whole job is showing the entire tree at
// once, even a very wide one, where MIN_SCALE's readability floor would
// otherwise crop off the outermost branches on first load.
const FIT_MIN_SCALE = 0.15
const MAX_SCALE = 2.5
const ZOOM_STEP = 0.35

type TreeLayoutNode = {
  note: SpiderNote
  path: string
  depth: number
  x: number
  y: number
  accent: BranchAccent | null
  hasChildren: boolean
  isCollapsed: boolean
}

type TreeLayout = {
  nodes: readonly TreeLayoutNode[]
  width: number
  height: number
}

// Depth-1 branches collapse from index onward stays deterministic
// (branchAccentFor(index)) and every deeper descendant inherits its
// ancestor branch's color — same "which branch is which at a glance"
// convention the radial view uses.
function buildTreeLayout(root: SpiderNote, collapsedPaths: ReadonlySet<string>): TreeLayout {
  const nodes: TreeLayoutNode[] = []
  let leafCursor = 0
  let maxDepth = 0

  function visit(note: SpiderNote, path: string, depth: number, accent: BranchAccent | null): number {
    maxDepth = Math.max(maxDepth, depth)
    const hasChildren = note.children.length > 0
    const isCollapsed = collapsedPaths.has(path)
    let centerUnits: number

    if (!hasChildren || isCollapsed) {
      centerUnits = leafCursor + 0.5
      leafCursor += 1
    } else {
      const childCenters = note.children.map((child, index) => visit(child, `${path}.${index}`, depth + 1, depth === 0 ? branchAccentFor(index) : accent))
      centerUnits = (childCenters[0]! + childCenters[childCenters.length - 1]!) / 2
    }

    nodes.push({
      note,
      path,
      depth,
      x: CANVAS_PAD_X + centerUnits * LEAF_UNIT,
      y: CANVAS_PAD_TOP + depth * ROW_HEIGHT + NODE_HEIGHT / 2,
      accent,
      hasChildren,
      isCollapsed,
    })
    return centerUnits
  }

  visit(root, 'root', 0, null)

  return {
    nodes,
    width: Math.max(leafCursor * LEAF_UNIT + CANVAS_PAD_X * 2, LEAF_UNIT + CANVAS_PAD_X * 2),
    height: CANVAS_PAD_TOP + (maxDepth + 1) * ROW_HEIGHT + CANVAS_PAD_BOTTOM,
  }
}

function parentPath(path: string): string | null {
  const lastDot = path.lastIndexOf('.')
  return lastDot === -1 ? null : path.slice(0, lastDot)
}

function clampScale(value: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))
}

// A smooth vertical S-curve from a parent's bottom edge to a child's top
// edge — the same "connecting branches" read as the radial view's
// straight lines, just shaped for a top-down layout instead of a
// spoke-from-center one.
function connectorPath(parent: { x: number; y: number }, child: { x: number; y: number }): string {
  const parentBottom = parent.y + NODE_HEIGHT / 2
  const childTop = child.y - NODE_HEIGHT / 2
  const midY = (parentBottom + childTop) / 2
  return `M ${parent.x} ${parentBottom} C ${parent.x} ${midY}, ${child.x} ${midY}, ${child.x} ${childTop}`
}

function nodeVisual(node: TreeLayoutNode): { className: string; textClassName: string; Icon: LucideIcon | null } {
  if (node.depth === 0) {
    return { className: 'brand-gradient border border-white/20 shadow-lg', textClassName: 'text-primary-foreground font-bold', Icon: Sparkles }
  }
  if (node.depth === 1 && node.accent) {
    return { className: cn(node.accent.border, node.accent.bg, 'shadow-sm backdrop-blur-sm'), textClassName: 'text-foreground font-semibold', Icon: node.accent.icon }
  }
  return { className: cn(node.accent ? node.accent.border : 'border-border', 'bg-card shadow-sm'), textClassName: 'text-foreground/90 font-medium', Icon: null }
}

type TreeCanvasNodeProps = {
  node: TreeLayoutNode
  onToggle: (path: string) => void
}

function TreeCanvasNode({ node, onToggle }: TreeCanvasNodeProps): React.JSX.Element {
  const visual = nodeVisual(node)
  const Icon = visual.Icon

  const content = (
    <>
      {Icon && <Icon className={cn('size-3.5 shrink-0', node.depth === 0 ? 'text-white/90' : node.accent?.text)} aria-hidden="true" />}
      <span className={cn('line-clamp-3 min-w-0 flex-1 text-[11px] leading-snug break-words', node.depth === 0 && 'text-xs', visual.textClassName)}>
        {node.note.label}
      </span>
      {node.hasChildren && (
        <ChevronRight
          className={cn('size-3 shrink-0 text-muted-foreground transition-transform', !node.isCollapsed && 'rotate-90', node.depth === 0 && 'text-white/70')}
          aria-hidden="true"
        />
      )}
    </>
  )

  const style: React.CSSProperties = {
    left: node.x,
    top: node.y,
    width: node.depth === 0 ? 172 : 136,
    height: NODE_HEIGHT,
  }

  return node.hasChildren ? (
    <button
      type="button"
      onClick={() => onToggle(node.path)}
      aria-expanded={!node.isCollapsed}
      aria-label={`${node.isCollapsed ? 'Expand' : 'Collapse'} ${node.note.label}`}
      style={style}
      className={cn(
        'absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-xl border px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        visual.className,
      )}
    >
      {content}
    </button>
  ) : (
    <div style={style} className={cn('absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-xl border px-3 py-2', visual.className)}>
      {content}
    </div>
  )
}

// Collapse everything at depth ≥ 2 by default (mirrors the radial view:
// the root and its direct branches are visible at a glance, deeper
// descendants are a deliberate drill-in) — otherwise a document with a
// genuinely deep tree would open as an unreadable wall of nodes.
function defaultCollapsedPaths(root: SpiderNote): Set<string> {
  const collapsed = new Set<string>()
  function visit(note: SpiderNote, path: string, depth: number): void {
    if (depth >= 2 && note.children.length > 0) collapsed.add(path)
    note.children.forEach((child, index) => visit(child, `${path}.${index}`, depth + 1))
  }
  visit(root, 'root', 0)
  return collapsed
}

type PanZoomState = { scale: number; x: number; y: number }

// Hand-rolled pan/pinch-zoom via the Pointer Events API — deliberately
// not a dependency: this is one bounded gesture surface (drag to pan,
// two-finger pinch to zoom, wheel/buttons as the non-gesture fallback),
// not a generic canvas library's worth of surface area. `touch-action:
// none` on the viewport hands the browser's own scroll/zoom handling
// over to this logic entirely, so a drag never fights native page
// scroll or the OS page-zoom gesture.
function useTreePanZoom(contentWidth: number): {
  transform: PanZoomState
  viewportRef: React.RefObject<HTMLDivElement | null>
  handlers: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void
    onWheel: (event: React.WheelEvent<HTMLDivElement>) => void
    onDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => void
  }
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
} {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const lastPan = useRef<{ x: number; y: number } | null>(null)
  const lastPinchDist = useRef<number | null>(null)

  const fitScale = useCallback((): number => {
    const viewportWidth = viewportRef.current?.clientWidth ?? contentWidth
    return Math.min(MAX_SCALE, Math.max(FIT_MIN_SCALE, Math.min(1, viewportWidth / contentWidth)))
  }, [contentWidth])

  const [transform, setTransform] = useState<PanZoomState>(() => ({ scale: 1, x: 0, y: 0 }))

  const centerAt = useCallback((scale: number): PanZoomState => {
    const viewportWidth = viewportRef.current?.clientWidth ?? contentWidth
    const x = Math.max((viewportWidth - contentWidth * scale) / 2, 0)
    return { scale, x, y: 12 }
  }, [contentWidth])

  const zoomAtPoint = useCallback((anchorX: number, anchorY: number, nextScaleRaw: number) => {
    setTransform((current) => {
      const nextScale = clampScale(nextScaleRaw)
      const contentX = (anchorX - current.x) / current.scale
      const contentY = (anchorY - current.y) / current.scale
      return { scale: nextScale, x: anchorX - contentX * nextScale, y: anchorY - contentY * nextScale }
    })
  }, [])

  const zoomByStep = useCallback((direction: 1 | -1) => {
    const viewport = viewportRef.current
    const anchorX = viewport ? viewport.clientWidth / 2 : 0
    const anchorY = viewport ? viewport.clientHeight / 2 : 0
    setTransform((current) => {
      const nextScale = clampScale(current.scale + direction * ZOOM_STEP)
      const contentX = (anchorX - current.x) / current.scale
      const contentY = (anchorY - current.y) / current.scale
      return { scale: nextScale, x: anchorX - contentX * nextScale, y: anchorY - contentY * nextScale }
    })
  }, [])

  const resetView = useCallback(() => {
    setTransform(centerAt(fitScale()))
  }, [centerAt, fitScale])

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 1) {
      lastPan.current = { x: event.clientX, y: event.clientY }
      lastPinchDist.current = null
    } else if (pointers.current.size === 2) {
      lastPan.current = null
      const [a, b] = Array.from(pointers.current.values())
      lastPinchDist.current = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    }
  }, [])

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.current.size === 1 && lastPan.current) {
      const dx = event.clientX - lastPan.current.x
      const dy = event.clientY - lastPan.current.y
      lastPan.current = { x: event.clientX, y: event.clientY }
      setTransform((current) => ({ ...current, x: current.x + dx, y: current.y + dy }))
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values())
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      const midX = (a!.x + b!.x) / 2
      const midY = (a!.y + b!.y) / 2
      const viewport = viewportRef.current
      const rect = viewport?.getBoundingClientRect()
      const localX = midX - (rect?.left ?? 0)
      const localY = midY - (rect?.top ?? 0)

      if (lastPinchDist.current !== null && lastPinchDist.current > 0) {
        const ratio = dist / lastPinchDist.current
        setTransform((current) => {
          const nextScale = clampScale(current.scale * ratio)
          const contentX = (localX - current.x) / current.scale
          const contentY = (localY - current.y) / current.scale
          return { scale: nextScale, x: localX - contentX * nextScale, y: localY - contentY * nextScale }
        })
      }
      lastPinchDist.current = dist
    }
  }, [])

  const endPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size === 1) {
      const remaining = Array.from(pointers.current.values())[0]!
      lastPan.current = { x: remaining.x, y: remaining.y }
      lastPinchDist.current = null
    } else if (pointers.current.size === 0) {
      lastPan.current = null
      lastPinchDist.current = null
    }
  }, [])

  const onWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const anchorX = event.clientX - rect.left
    const anchorY = event.clientY - rect.top
    zoomAtPoint(anchorX, anchorY, transform.scale - event.deltaY * 0.0015)
  }, [transform.scale, zoomAtPoint])

  const onDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, transform.scale + ZOOM_STEP)
  }, [transform.scale, zoomAtPoint])

  return {
    transform,
    viewportRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp: endPointer, onWheel, onDoubleClick },
    zoomIn: () => zoomByStep(1),
    zoomOut: () => zoomByStep(-1),
    resetView,
  }
}

function SpiderNotesMobileTreeCanvas({ root }: { root: SpiderNote }): React.JSX.Element {
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(() => defaultCollapsedPaths(root))
  const prefersReducedMotion = usePrefersReducedMotion()
  const layout = useMemo(() => buildTreeLayout(root, collapsedPaths), [root, collapsedPaths])
  const { transform, viewportRef, handlers, zoomIn, zoomOut, resetView } = useTreePanZoom(layout.width)
  const hasCenteredRef = useRef(false)

  // Center-and-fit exactly once, right after the viewport first has a
  // real measured width — not on every layout change, so expanding or
  // collapsing a node mid-exploration never yanks the view out from
  // under the learner's thumb. The explicit "Fit" button (Maximize2,
  // below) covers the same recenter afterward, on demand.
  const viewportCallbackRef = useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node
    if (node && !hasCenteredRef.current) {
      hasCenteredRef.current = true
      resetView()
    }
  }, [viewportRef, resetView])

  const edges = useMemo(() => {
    const byPath = new Map(layout.nodes.map((node) => [node.path, node]))
    return layout.nodes
      .map((node) => {
        const parent = parentPath(node.path)
        if (!parent) return null
        const parentNode = byPath.get(parent)
        return parentNode ? { key: node.path, d: connectorPath(parentNode, node), stroke: node.accent?.stroke ?? 'stroke-primary/30' } : null
      })
      .filter((edge): edge is { key: string; d: string; stroke: string } => edge !== null)
  }, [layout.nodes])

  function toggleNode(path: string): void {
    setCollapsedPaths((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return (
    <div className="quantum-mindmap-glass relative">
      <div
        ref={viewportCallbackRef}
        role="group"
        aria-label="Spider notes mind map. Drag to pan, pinch or use the zoom buttons to explore, tap a node to expand or collapse it."
        className="relative h-[420px] w-full touch-none overflow-hidden rounded-2xl"
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerUp}
        onWheel={handlers.onWheel}
        onDoubleClick={handlers.onDoubleClick}
      >
        <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-blue-400/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full bg-rose-400/20 blur-3xl" aria-hidden="true" />

        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transition: prefersReducedMotion ? 'none' : 'transform 120ms ease-out',
          }}
        >
          <svg width={layout.width} height={layout.height} className="pointer-events-none absolute inset-0" aria-hidden="true">
            {edges.map((edge) => (
              <path key={edge.key} d={edge.d} className={edge.stroke} fill="none" strokeOpacity={0.5} strokeWidth={1.75} strokeLinecap="round" />
            ))}
          </svg>
          {layout.nodes.map((node) => (
            <TreeCanvasNode key={node.path} node={node} onToggle={toggleNode} />
          ))}
        </div>
      </div>

      <div className="absolute right-3 bottom-3 flex flex-col gap-1 rounded-xl border border-border/80 bg-card/95 p-1 shadow-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom in"
          className="flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-foreground/[0.06] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ZoomIn className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom out"
          className="flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-foreground/[0.06] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ZoomOut className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={resetView}
          aria-label="Fit mind map to screen"
          className="flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-foreground/[0.06] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Maximize2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <p className="absolute top-2.5 left-3 text-[10px] font-medium tracking-wide text-muted-foreground/80 uppercase">
        Drag · Pinch to zoom · Tap a node
      </p>
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
// and a true connected top-down tree in a pan/pinch-zoom canvas (below
// sm) — never a fabricated diagram, always exactly the hierarchy the
// model returned. No graph/canvas library for either — both are plain
// DOM/CSS/SVG (the mobile canvas adds hand-rolled Pointer Events pan/
// zoom, see useTreePanZoom) and stay fully performant at any depth.
// Per-branch color (see BRANCH_ACCENTS above) is a deliberate, scoped
// exception to this app's usual "color is reserved, not default" rule —
// the same kind of named, scoped exception `.glass-premium` already is
// elsewhere in globals.css — because instant visual parsing of "which
// branch is which" is the whole point of a mind map.
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
        <SpiderNotesMobileTreeCanvas root={root} />
      </div>

      <div className="mt-3 hidden sm:block">
        <MindMapRadial root={root} />
      </div>
    </div>
  )
}
