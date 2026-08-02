'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

type SingleLineReadingRailProps = {
  paragraph: string
  // The real total time the outer runtime has already allocated to this
  // real paragraph (word-count-scaled, adaptively paced) — this
  // component only paces its own internal reveal to fit inside that real
  // window; it never owns completion timing itself.
  totalDurationMs: number
}

const WORDS_PER_LINE = 8
const LINE_HEIGHT_REM = 2.75

function splitIntoLines(paragraph: string, wordsPerLine: number): readonly string[] {
  const words = paragraph.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  for (let index = 0; index < words.length; index += wordsPerLine) {
    lines.push(words.slice(index, index + wordsPerLine).join(' '))
  }
  return lines
}

// Teleprompter Motion Engine™ (Sprint-2.6B FIX-19, hardened Sprint-2.7
// FIX-24) — the previous version stepped through real lines with
// discrete per-line `animate` calls (a real, but short, 0.6s glide, then
// a real WAIT at rest until the next state update fired the next glide)
// — that rest-between-glides *was* the real "micro-jump/pause before
// every new line" bug. FIX-19 replaced that with ONE single `animate`
// call moving the whole real line-stack from its first line straight to
// its last, at a constant linear velocity. FIX-24's own real remaining
// root cause: `LiveSprintRuntimeView`'s parent hook ticks `secondsLeft`
// every real second, re-rendering this component with a brand-new
// `animate`/`transition` object literal each time (same real numbers,
// different real object reference) — enough for framer-motion to
// re-evaluate the in-flight tween and produce a real, once-per-second
// micro-stutter. `memo` here means React skips re-rendering this
// component at all while its own real `paragraph`/`totalDurationMs` stay
// unchanged, so the mounted animation is never touched again once
// started — no per-line resets, no per-second re-evaluation, nothing to
// notice but the words moving. The clipped, one-line-height window still
// only ever shows one real line at a time; every other line naturally
// enters from below and exits above as the single continuous transform
// passes through it.
function SingleLineReadingRailComponent({ paragraph, totalDurationMs }: SingleLineReadingRailProps): React.JSX.Element {
  const lines = useMemo(() => splitIntoLines(paragraph, WORDS_PER_LINE), [paragraph])
  const totalTravelRem = Math.max(0, lines.length - 1) * LINE_HEIGHT_REM

  return (
    <div className="mx-auto max-w-md overflow-hidden" style={{ height: `${LINE_HEIGHT_REM}rem` }}>
      <motion.div
        key={paragraph}
        initial={{ y: 0 }}
        animate={{ y: `-${totalTravelRem}rem` }}
        transition={{ duration: totalDurationMs / 1000, ease: 'linear' }}
        style={{ willChange: 'transform' }}
      >
        {lines.map((line, index) => (
          <p key={index} style={{ height: `${LINE_HEIGHT_REM}rem` }} className="flex items-center text-lg leading-none text-foreground sm:text-xl">
            {line}
          </p>
        ))}
      </motion.div>
    </div>
  )
}

export const SingleLineReadingRail = memo(SingleLineReadingRailComponent)
