import { cn } from '@/lib/utils'
import { computeShrink } from './fitTextMath'

// Typography Engine™ — one reusable, container-aware text-fitting primitive
// for every Reading Intelligence exercise's stimulus/option text. See the
// `.fit-text` rule in globals.css for the full formula and rationale.
//
// Establishes its own container-query context (containerType: 'inline-size')
// so the SAME text auto-adapts to whatever card it's rendered inside — a wide
// flash stage or a narrow 2-column answer button — with no per-page
// breakpoints and no DOM measurement. Deliberately 'inline-size', not
// 'size': the formula only needs cqi (width) units, and 'size' containment
// would force this element's height to come from an external source instead
// of its own (possibly wrapped, multi-line) text content — exactly wrong for
// a wrapper meant to grow with its text.
// Long words shrink via a content-length term; overflow-wrap/word-break/
// hyphens (in globals.css) guarantee text can never escape its card even for
// content the formula didn't anticipate.
//
// minWidth: 0 is load-bearing, not decorative: flex/grid items default to
// min-width: auto, and overflow-wrap: anywhere makes a text node's
// min-content collapse to ~1 character. Without overriding that default,
// a grid/flex parent (e.g. ChoiceGrid's 2-column grid) can size a column
// down toward that degenerate min-content, leaving only enough room for one
// letter per line — a real bug this fixes at the source, once, here, rather
// than requiring every call site to remember `min-w-0`.
export type FitTextRole = 'display' | 'symbol' | 'option' | 'line' | 'reading' | 'reading-1' | 'reading-2' | 'reading-3' | 'reading-4' | 'reading-5'

type FitTextProps = {
  text: string
  role?: FitTextRole
  as?: 'span' | 'p' | 'div'
  // Typographic/color classes for the sized text itself (font-weight,
  // tracking, color, select-none, ...). Do not pass line-height utilities —
  // the engine owns line-height centrally as part of the fit formula.
  className?: string
  // Classes for the outer container-query wrapper — the actual DOM element
  // the caller's `as` tag renders as. Use this for things that must live on
  // the same element as `style` (e.g. an opacity transition class paired
  // with an inline opacity value).
  wrapperClassName?: string
} & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>

export function FitText({
  text,
  role = 'display',
  as = 'span',
  className,
  wrapperClassName,
  style,
  ...rest
}: FitTextProps): React.JSX.Element {
  const OuterTag = as
  const shrink = computeShrink(text)

  return (
    <OuterTag
      {...rest}
      className={wrapperClassName}
      style={{ ...style, containerType: 'inline-size', display: 'block', width: '100%', minWidth: 0 }}
    >
      <span
        className={cn('fit-text', `fit-text-${role}`, className)}
        style={{ '--fit-shrink': shrink } as React.CSSProperties}
      >
        {text}
      </span>
    </OuterTag>
  )
}
