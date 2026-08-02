'use client'

// Strict Single-Line Sprint — a shared, presentation-only measurement
// utility (same category as continuousStreamOffset.ts/useContentCrossfade:
// no reading/session logic, purely a layout calculation). Single-line,
// no-wrap streaming text needs each unit's own *real* rendered width
// (unlike the previous fixed-column model, which only ever needed a
// generous multi-line height allowance) — an approximate char-count
// formula would risk exactly the imprecise centering/clipping this
// sprint's "strictly clipped" requirement can't tolerate. This measures
// against a hidden probe sharing the *exact* className/inline style the
// real text renders with, so the measured width always matches reality,
// not an estimate.
export function measureSingleLineWidthsPx(texts: readonly string[], className: string, style: Partial<CSSStyleDeclaration> = {}): number[] {
  if (typeof document === 'undefined') return texts.map(() => 0)

  const probe = document.createElement('span')
  probe.className = className
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.whiteSpace = 'nowrap'
  probe.style.left = '-99999px'
  probe.style.top = '0'
  Object.assign(probe.style, style)
  document.body.appendChild(probe)

  const widths = texts.map((text) => {
    probe.textContent = text
    return probe.getBoundingClientRect().width
  })

  document.body.removeChild(probe)
  return widths
}
