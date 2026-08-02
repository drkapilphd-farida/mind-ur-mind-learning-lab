import { cn } from '@/lib/utils'
import type { ReadingGuide, ReadingLineHeight, ReadingWidth } from '../../readingPreferences'

type ReadingPassageViewProps = {
  title: string
  lines: readonly string[]
  currentLineIndex: number
  focusMode: boolean
  guide: ReadingGuide
  fontScale: number
  readingWidth: ReadingWidth
  lineHeightSetting: ReadingLineHeight
}

const WIDTH_CLASS: Record<ReadingWidth, string> = {
  narrow: 'max-w-xl',
  comfortable: 'max-w-2xl',
  wide: 'max-w-3xl',
}

const LINE_HEIGHT_CLASS: Record<ReadingLineHeight, string> = {
  compact: 'leading-normal',
  comfortable: 'leading-relaxed',
  relaxed: 'leading-loose',
}

// Reading Guide overlays applied only to whichever paragraph is currently
// centered in the scroll viewport — deliberately not a moving/bouncing
// cursor and not tied to elapsed time (this is not RSVP; the reader sets
// the pace by scrolling). Uses `current`-based colors (not the app's global
// `--foreground` token) so the guide stays visible against light/sepia/dark
// reading backgrounds alike — the passage text itself inherits its color
// from the theme wrapper, not a hardcoded token.
function guideClassName(guide: ReadingGuide): string {
  switch (guide) {
    case 'underline':
      return 'underline decoration-2 underline-offset-[6px] decoration-current/25'
    case 'highlight':
      return 'rounded bg-primary/[0.06] px-1 -mx-1'
    case 'window':
      return 'rounded-lg px-4 -mx-4 py-1 ring-1 ring-current/10'
    case 'none':
    default:
      return ''
  }
}

// Renders a passage as continuous prose (not FitText — FitText is built
// for single flashed phrases, not multi-paragraph reading). Comfortable
// measure, real typography, no cards/dashboard chrome — the passage is the
// entire screen.
export function ReadingPassageView({
  title,
  lines,
  currentLineIndex,
  focusMode,
  guide,
  fontScale,
  readingWidth,
  lineHeightSetting,
}: ReadingPassageViewProps): React.JSX.Element {
  return (
    <div className={cn('mx-auto w-full px-6 py-16 sm:py-24', WIDTH_CLASS[readingWidth])}>
      <h1
        className="mb-10 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ fontSize: `${1.5 * fontScale}rem` }}
      >
        {title}
      </h1>
      <div className="space-y-6">
        {lines.map((line, index) => {
          const isCurrent = index === currentLineIndex
          return (
            <p
              key={index}
              className={cn(
                LINE_HEIGHT_CLASS[lineHeightSetting],
                'transition duration-300',
                focusMode && !isCurrent ? 'opacity-50' : 'opacity-100',
                isCurrent ? 'rounded-2xl bg-primary/[0.06] px-2 py-1 text-foreground' : 'text-foreground/95',
                isCurrent ? guideClassName(guide) : '',
              )}
              style={{ fontSize: `${1.125 * fontScale}rem` }}
            >
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}
