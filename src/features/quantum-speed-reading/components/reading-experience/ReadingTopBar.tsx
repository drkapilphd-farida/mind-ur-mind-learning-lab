import { ArrowLeft, Pause, Play, Maximize, Minimize } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReadingTheme } from '../../readingPreferences'

type ReadingTopBarProps = {
  progressPercent: number
  elapsedLabel: string
  isPaused: boolean
  isFullscreen: boolean
  theme: ReadingTheme
  onExit: () => void
  onTogglePause: () => void
  onToggleFullscreen: () => void
}

// Reading-theme surface for the bar itself — deliberately not the app's
// global bg-background/text-foreground tokens, since Dark Mode here is
// local to this screen (see ReadingExperience.tsx's THEME_WRAPPER_CLASS).
// Text/icons inside use `currentColor` (opacity for emphasis, current/8 for
// hover) so they stay legible against light/sepia/dark alike without a
// second set of per-theme classes.
const BAR_SURFACE_CLASS: Record<ReadingTheme, string> = {
  light: 'bg-white/80 text-neutral-900 border-black/[0.06]',
  sepia: 'bg-[#f6ecd9]/85 text-[#3d3226] border-black/[0.06]',
  dark: 'bg-[#1a1a1a]/85 text-[#e8e6e2] border-white/[0.08]',
}

const ICON_BUTTON_CLASS = 'flex size-8 items-center justify-center rounded-lg opacity-60 transition-opacity hover:bg-current/[0.08] hover:opacity-100'

// Fixed, minimal, no clutter — matches the fixed + backdrop-blur + subtle
// border floating-surface convention already used for the marketing header
// and sheet overlays elsewhere in this app.
export function ReadingTopBar({
  progressPercent,
  elapsedLabel,
  isPaused,
  isFullscreen,
  theme,
  onExit,
  onTogglePause,
  onToggleFullscreen,
}: ReadingTopBarProps): React.JSX.Element {
  return (
    <div className={cn('fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-colors duration-300', BAR_SURFACE_CLASS[theme])}>
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5 sm:px-6">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium opacity-70 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Exit
        </button>

        <div className="flex items-center gap-4 text-xs opacity-75">
          <span className="hidden items-center gap-3 sm:flex">
            <div className="min-w-[100px]">
              <div className="h-1.5 overflow-hidden rounded-full bg-current/10">
                <div
                  className="h-full rounded-full bg-current/70 transition-[width] duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="mt-1 block text-[11px] tabular-nums text-muted-foreground">{progressPercent}%</span>
            </div>
          </span>
          <span className="rounded-full bg-muted/20 px-2 py-1 tabular-nums">{elapsedLabel}</span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onTogglePause} aria-label={isPaused ? 'Resume reading' : 'Pause reading'} className={ICON_BUTTON_CLASS}>
            {isPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
          </button>
          <button onClick={onToggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className={ICON_BUTTON_CLASS}>
            {isFullscreen ? <Minimize className="size-4" aria-hidden="true" /> : <Maximize className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}
