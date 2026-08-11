'use client'

// Cinematic Guide Sprint — a shared, presentation-only measurement utility
// (same category as measureSingleLineWidths.ts / measureWrappedWordYCenters.ts:
// no reading/session logic, purely a layout calculation), used by Guided
// Paragraph Reading Mode's Horizontal Canvas. A left-to-right sweeping
// guide needs to know not just which LINE a word sits on (like the
// simpler Y-only measurement Paragraph Reading Mode's vertical crawl
// uses) but each word's real horizontal position *within* that line too,
// plus each line's own first/last word bounds, so a per-line sweep can
// glide smoothly from a line's start to its end. Measures against a
// hidden probe sharing the exact className/width/style the real text
// renders with, using the same "one <span> per word, one space text node
// between" markup the real Canvas renders, so measured positions always
// match what's on screen.
export type WrappedLineMeta = {
  y: number
  firstWordIndex: number
  lastWordIndex: number
  firstWordX: number
  lastWordX: number
}

export type WrappedWordPositions = {
  x: number[]
  y: number[]
  lines: WrappedLineMeta[]
}

export function measureWrappedWordPositionsPx(
  words: readonly string[],
  containerWidthPx: number,
  className: string,
  style: Partial<CSSStyleDeclaration> = {},
): WrappedWordPositions {
  if (typeof document === 'undefined' || words.length === 0) {
    return { x: words.map(() => 0), y: words.map(() => 0), lines: [] }
  }

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
  const x: number[] = []
  const y: number[] = []
  for (const span of wordSpans) {
    const rect = span.getBoundingClientRect()
    x.push(rect.left - containerRect.left + rect.width / 2)
    y.push(rect.top - containerRect.top + rect.height / 2)
  }

  document.body.removeChild(probe)

  // Group words into lines by shared Y (same tolerance convention as this
  // mode's own pre-overhaul line-grouping logic), then record each line's
  // first/last word index and X bounds — everything a per-line sweep needs
  // to glide smoothly across one line before resetting to the next.
  const lines: WrappedLineMeta[] = []
  for (let index = 0; index < words.length; index += 1) {
    const wordY = y[index] ?? 0
    const wordX = x[index] ?? 0
    const currentLine = lines[lines.length - 1]
    if (currentLine && Math.abs(currentLine.y - wordY) < 3) {
      currentLine.lastWordIndex = index
      currentLine.lastWordX = wordX
    } else {
      lines.push({ y: wordY, firstWordIndex: index, lastWordIndex: index, firstWordX: wordX, lastWordX: wordX })
    }
  }

  return { x, y, lines }
}
