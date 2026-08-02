'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingHeader } from '@/features/reading-engine/components/ReadingHeader'
import type { GuidedParagraphReadingWidth, GuidedParagraphFontSize } from './GuidedParagraphReadingModeSettings'

// "How much of the passage is visible" — the comfort-reading measure,
// same convention as Paragraph Reading Mode.
const READING_WIDTH_PX: Record<GuidedParagraphReadingWidth, number> = {
  compact: 560,
  comfortable: 720,
  wide: 900,
}

const FONT_SIZE_PX: Record<GuidedParagraphFontSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 17, lineHeight: 31 },
  medium: { fontSize: 19, lineHeight: 34 },
  large: { fontSize: 22, lineHeight: 40 },
}

// Fixed comfort-window height per (ReadingWidth × FontSize) — same
// live-measurement discipline as Paragraph Reading Mode's own table
// (see ParagraphReadingModeCanvas.tsx), re-verified against this mode's
// own passages (201-213 words each, a near-identical range).
const COMFORT_WINDOW_HEIGHT_PX: Record<GuidedParagraphReadingWidth, Record<GuidedParagraphFontSize, number>> = {
  compact: { small: 700, medium: 880, large: 1180 },
  comfortable: { small: 560, medium: 680, large: 900 },
  wide: { small: 460, medium: 540, large: 740 },
}

const MOTION_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const ENTRANCE_TRANSITION_MS = 260
const LINE_SWEEP_TRANSITION_MS = 240
const WORD_HIGHLIGHT_TRANSITION_MS = 150

type GuidedParagraphReadingModeCanvasProps = {
  words: readonly string[]
  currentWordIndex: number
  readingWidth: GuidedParagraphReadingWidth
  fontSize: GuidedParagraphFontSize
  isPaused: boolean
  liveWpm: number
  targetWpm: number
  elapsedMs: number
  progressPercent: number
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onFinish: () => void
  onExit: () => void
}

type LineMeta = {
  wordLineIndex: number[]
  lineTops: number[]
}

// Guided Paragraph Reading Mode™ — the Master Reading Engine's fifth and
// final mode. Builds directly on Paragraph Reading Mode's "True Multi-Line
// Comfort Window" pattern (a real, static, multi-line passage, word-paced
// by the engine, never scrolling, never wrapping unnaturally, never
// dimmed) and adds the one thing that makes this mode distinct: a
// guided pacing bar. After the words render, a layout effect measures
// each word's own line (grouping by rendered `top` position) and each
// line's vertical offset within the passage. A soft highlight bar then
// slides smoothly (`translateY`, one continuous transition) to sit behind
// whichever line the engine is currently pacing through, giving the
// reader's eyes a real, physical guide to follow down the page — on top
// of that, the exact current word gets its own small, brighter highlight,
// so the guide works at both the line level and the word level at once.
// Text itself never changes brightness: the bar and the word highlight
// are both purely additive backgrounds sitting behind fully opaque text,
// never a dimming or fading effect on anything.
export function GuidedParagraphReadingModeCanvas({
  words,
  currentWordIndex,
  readingWidth,
  fontSize,
  isPaused,
  liveWpm,
  targetWpm,
  elapsedMs,
  progressPercent,
  onPause,
  onResume,
  onRestart,
  onFinish,
  onExit,
}: GuidedParagraphReadingModeCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { fontSize: fontSizePx, lineHeight } = FONT_SIZE_PX[fontSize]
  const viewportWidth = READING_WIDTH_PX[readingWidth]
  const windowHeight = COMFORT_WINDOW_HEIGHT_PX[readingWidth][fontSize]

  const containerRef = useRef<HTMLParagraphElement>(null)
  const [lineMeta, setLineMeta] = useState<LineMeta | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const spans = Array.from(container.querySelectorAll<HTMLElement>('[data-word-index]'))
    const containerTop = container.getBoundingClientRect().top
    const lineTops: number[] = []
    const wordLineIndex: number[] = []
    for (const span of spans) {
      const top = Math.round(span.getBoundingClientRect().top - containerTop)
      let lineIndex = lineTops.findIndex((existingTop) => Math.abs(existingTop - top) < 3)
      if (lineIndex === -1) {
        lineTops.push(top)
        lineIndex = lineTops.length - 1
      }
      wordLineIndex.push(lineIndex)
    }
    setLineMeta({ wordLineIndex, lineTops })
  }, [words, readingWidth, fontSize])

  const currentLineIndex = lineMeta?.wordLineIndex[currentWordIndex] ?? 0
  const currentLineTop = lineMeta?.lineTops[currentLineIndex] ?? 0

  const [hasEntered, setHasEntered] = useState(prefersReducedMotion)
  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const id = requestAnimationFrame(() => setHasEntered(true))
    return () => cancelAnimationFrame(id)
  }, [prefersReducedMotion])

  return (
    <ReadingLayout maxWidthClassName="max-w-3xl" onExit={onExit}>
      <ReadingHeader
        modeLabel="Guided Paragraph Reading™"
        liveWpm={liveWpm}
        targetWpm={targetWpm}
        elapsedMs={elapsedMs}
        progressPercent={progressPercent}
      />

      <div
        className="mx-auto mt-6 overflow-hidden rounded-2xl bg-muted/50 p-8"
        style={{
          width: viewportWidth,
          height: windowHeight,
          opacity: hasEntered ? 1 : 0,
          transform: hasEntered ? 'scale(1)' : 'scale(0.99)',
          transition: prefersReducedMotion ? 'none' : `opacity ${ENTRANCE_TRANSITION_MS}ms ${MOTION_EASE}, transform ${ENTRANCE_TRANSITION_MS}ms ${MOTION_EASE}`,
        }}
      >
        <div className="relative">
          {lineMeta && (
            <div
              className="pointer-events-none absolute inset-x-0 rounded-md bg-primary/10"
              style={{
                height: lineHeight,
                transform: `translateY(${currentLineTop}px)`,
                transition: prefersReducedMotion ? 'none' : `transform ${LINE_SWEEP_TRANSITION_MS}ms ${MOTION_EASE}`,
              }}
            />
          )}
          <p ref={containerRef} className="relative" style={{ fontSize: fontSizePx, lineHeight: `${lineHeight}px`, color: 'var(--foreground)' }}>
            {words.map((word, index) => (
              <span key={index} data-word-index={index}>
                <span
                  className={index === currentWordIndex ? 'rounded bg-primary/30' : ''}
                  style={{
                    boxDecorationBreak: 'clone',
                    WebkitBoxDecorationBreak: 'clone',
                    transition: prefersReducedMotion ? 'none' : `background-color ${WORD_HIGHLIGHT_TRANSITION_MS}ms ${MOTION_EASE}`,
                  }}
                >
                  {word}
                </span>
                {index < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6">
        {isPaused ? (
          <button onClick={onResume} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Resume
          </button>
        ) : (
          <button onClick={onPause} className={PRIMARY_TEXT_BUTTON_CLASSES}>
            Pause
          </button>
        )}
        <button onClick={onRestart} className={SECONDARY_TEXT_BUTTON_CLASSES}>
          Restart
        </button>
        <button onClick={onFinish} className={SECONDARY_TEXT_BUTTON_CLASSES}>
          Finish
        </button>
      </div>
    </ReadingLayout>
  )
}

const PRIMARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'
