'use client'

// Cinematic Reader Sprint — a shared, presentation-only measurement
// utility (same category as measureSingleLineWidths.ts: no reading/session
// logic, purely a layout calculation), used by Paragraph Reading Mode's
// Vertical Canvas. A vertical teleprompter crawl needs to scroll a real,
// naturally-wrapped multi-line paragraph so the *current* word's own line
// sits centered in the viewport — that requires knowing each word's real
// rendered vertical center within the wrapped block, which depends on the
// exact width and font the text renders at. An approximate line-count
// formula would risk exactly the misaligned centering this sprint can't
// tolerate. This measures against a hidden probe sharing the *exact*
// className/width/style the real text renders with, using the same
// "one <span> per word, one space text node between" markup the real
// Canvas renders, so the measured positions always match what's on screen.
export function measureWrappedWordYCentersPx(
  words: readonly string[],
  containerWidthPx: number,
  className: string,
  style: Partial<CSSStyleDeclaration> = {},
): number[] {
  if (typeof document === 'undefined') return words.map(() => 0)

  const probe = document.createElement('div')
  probe.className = className
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.left = '-99999px'
  probe.style.top = '0'
  probe.style.width = `${containerWidthPx}px`
  Object.assign(probe.style, style)
  document.body.appendChild(probe)

  const wordSpans: HTMLSpanElement[] = words.map((word) => {
    const span = document.createElement('span')
    span.textContent = word
    probe.appendChild(span)
    probe.appendChild(document.createTextNode(' '))
    return span
  })

  const containerRect = probe.getBoundingClientRect()
  const yCenters = wordSpans.map((span) => {
    const rect = span.getBoundingClientRect()
    return rect.top - containerRect.top + rect.height / 2
  })

  document.body.removeChild(probe)
  return yCenters
}
