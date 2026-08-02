'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingHeader } from '@/features/reading-engine/components/ReadingHeader'
import type { ParagraphReadingWidth, ParagraphFontSize } from './ParagraphReadingModeSettings'

// "How much of the passage is visible" — the comfort-reading measure.
const READING_WIDTH_PX: Record<ParagraphReadingWidth, number> = {
  compact: 560,
  comfortable: 720,
  wide: 900,
}

const FONT_SIZE_PX: Record<ParagraphFontSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 17, lineHeight: 31 },
  medium: { fontSize: 19, lineHeight: 34 },
  large: { fontSize: 22, lineHeight: 40 },
}

// Fixed comfort-window height per (ReadingWidth × FontSize) — sized
// generously so a full ~200-word passage (15-20 lines at typical settings)
// is always entirely visible with no clipping, live-measured against the
// actual longest real passage at each combination (same discipline as
// every prior sizing decision in this project — never assumed from a
// formula alone). Narrower width + larger font wraps to more, taller
// lines, so needs the tallest allotment.
const COMFORT_WINDOW_HEIGHT_PX: Record<ParagraphReadingWidth, Record<ParagraphFontSize, number>> = {
  compact: { small: 700, medium: 880, large: 1180 },
  comfortable: { small: 560, medium: 680, large: 900 },
  wide: { small: 460, medium: 540, large: 740 },
}

const MOTION_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const ENTRANCE_TRANSITION_MS = 260
const HIGHLIGHT_TRANSITION_MS = 150

type ParagraphReadingModeCanvasProps = {
  words: readonly string[]
  currentWordIndex: number
  readingWidth: ParagraphReadingWidth
  fontSize: ParagraphFontSize
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

// True Multi-Line Comfort Window Sprint — replaces every earlier motion
// experiment for this mode (same-node crossfade, windowed peek, then two
// horizontal-streaming passes) with what the brief calls for literally: a
// real, static, multi-line comfort-reading block — 15-20 lines of one
// connected passage, laid out exactly like a normal paragraph on a page,
// that never scrolls and never wraps unnaturally. The engine paces
// word-by-word (see ParagraphReadingModeBlockRuntime.tsx); this Canvas
// renders every word of the passage as its own inline `<span>`, in normal
// document flow (real line-wrapping, not simulated), and moves a
// highlight background across the *current* word — never dimming
// anything else. All text stays 100% opaque/foreground at all times; only
// the current word gets an added highlight box behind it, like a
// read-along marker. The container is sized generously (per Reading
// Width × Font Size, live-measured against the actual passages) and
// strictly `overflow: hidden` as a safety bound — the passage is expected
// to fit entirely, never truly needing to clip real content. A brief
// opacity fade plays once when a new passage/block first mounts, so
// advancing between blocks reads as a soft transition rather than a cut.
export function ParagraphReadingModeCanvas({
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
}: ParagraphReadingModeCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { fontSize: fontSizePx, lineHeight } = FONT_SIZE_PX[fontSize]
  const viewportWidth = READING_WIDTH_PX[readingWidth]
  const windowHeight = COMFORT_WINDOW_HEIGHT_PX[readingWidth][fontSize]

  const [hasEntered, setHasEntered] = useState(prefersReducedMotion)
  useEffect(() => {
    if (prefersReducedMotion) return
    const id = requestAnimationFrame(() => setHasEntered(true))
    return () => cancelAnimationFrame(id)
  }, [prefersReducedMotion])

  return (
    <ReadingLayout maxWidthClassName="max-w-3xl" onExit={onExit}>
      <ReadingHeader
        modeLabel="Paragraph Reading Mode™"
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
        <p style={{ fontSize: fontSizePx, lineHeight: `${lineHeight}px`, color: 'var(--foreground)' }}>
          {words.map((word, index) => (
            <span key={index}>
              <span
                className={index === currentWordIndex ? 'rounded bg-primary/25' : ''}
                style={{
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone',
                  transition: prefersReducedMotion ? 'none' : `background-color ${HIGHLIGHT_TRANSITION_MS}ms ${MOTION_EASE}`,
                }}
              >
                {word}
              </span>
              {index < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
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
