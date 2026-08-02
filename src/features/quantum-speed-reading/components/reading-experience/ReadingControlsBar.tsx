import { Minus, Plus, Moon, Sun, Focus, Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ReadingPreferences, ReadingWidth, ReadingLineHeight, ReadingGuide, ReadingTheme } from '../../readingPreferences'

type ReadingControlsBarProps = {
  preferences: ReadingPreferences
  onFontStep: (direction: 'up' | 'down') => void
  onToggleTheme: () => void
  onCycleBrightness: () => void
  onToggleFocusMode: () => void
  onChangeWidth: (width: ReadingWidth) => void
  onChangeLineHeight: (lineHeight: ReadingLineHeight) => void
  onChangeGuide: (guide: ReadingGuide) => void
}

const WIDTH_LABEL: Record<ReadingWidth, string> = { narrow: 'Narrow', comfortable: 'Comfortable', wide: 'Wide' }
const LINE_HEIGHT_LABEL: Record<ReadingLineHeight, string> = { compact: 'Compact', comfortable: 'Comfortable', relaxed: 'Relaxed' }
const GUIDE_LABEL: Record<ReadingGuide, string> = { none: 'No guide', underline: 'Underline', highlight: 'Soft highlight', window: 'Reading window' }

// Same reading-theme surface convention as ReadingTopBar — this bar is
// local to the reading screen, not the app's global background/foreground.
const BAR_SURFACE_CLASS: Record<ReadingTheme, string> = {
  light: 'bg-white/90 text-neutral-900 border-black/[0.06]',
  sepia: 'bg-[#f6ecd9]/90 text-[#3d3226] border-black/[0.06]',
  dark: 'bg-[#1a1a1a]/90 text-[#e8e6e2] border-white/[0.08]',
}

const ICON_BUTTON_CLASS = 'transition duration-200 ease-in-out rounded-full opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
const ICON_BUTTON_ACTIVE_CLASS = 'bg-current/[0.12] opacity-100'

// Floating bottom bar — fixed + backdrop-blur + rounded pill, the same
// floating-surface convention already used elsewhere in this app. Only the
// frequently-touched controls (font, dark mode, focus mode, brightness) are
// one-tap icon buttons; Width/Line Height/Reading Guide are grouped behind
// the "Aa" settings menu to avoid an 8-icon cluttered bar.
export function ReadingControlsBar({
  preferences,
  onFontStep,
  onToggleTheme,
  onCycleBrightness,
  onToggleFocusMode,
  onChangeWidth,
  onChangeLineHeight,
  onChangeGuide,
}: ReadingControlsBarProps): React.JSX.Element {
  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className={cn('flex items-center gap-1 rounded-full border px-2 py-1.5 shadow-xl shadow-slate-900/5 backdrop-blur-md transition-colors duration-300', BAR_SURFACE_CLASS[preferences.theme])}>
        <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON_CLASS} onClick={() => onFontStep('down')} aria-label="Decrease font size">
          <Minus className="size-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON_CLASS} onClick={() => onFontStep('up')} aria-label="Increase font size">
          <Plus className="size-4" aria-hidden="true" />
        </Button>

        <span className="mx-1 h-5 w-px bg-current/10" aria-hidden="true" />

        <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON_CLASS} onClick={onCycleBrightness} aria-label="Cycle brightness">
          <Sun className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={preferences.theme === 'dark' ? 'Turn off dark mode' : 'Turn on dark mode'}
          aria-pressed={preferences.theme === 'dark'}
          className={cn(ICON_BUTTON_CLASS, preferences.theme === 'dark' && ICON_BUTTON_ACTIVE_CLASS)}
          onClick={onToggleTheme}
        >
          <Moon className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={preferences.focusMode ? 'Turn off focus mode' : 'Turn on focus mode'}
          aria-pressed={preferences.focusMode}
          className={cn(ICON_BUTTON_CLASS, preferences.focusMode && ICON_BUTTON_ACTIVE_CLASS)}
          onClick={onToggleFocusMode}
        >
          <Focus className="size-4" aria-hidden="true" />
        </Button>

        <span className="mx-1 h-5 w-px bg-current/10" aria-hidden="true" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON_CLASS} aria-label="Reading display settings">
              <Type className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top">
            <DropdownMenuLabel>Reading width</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={preferences.readingWidth} onValueChange={(v) => onChangeWidth(v as ReadingWidth)}>
              {(Object.keys(WIDTH_LABEL) as ReadingWidth[]).map((width) => (
                <DropdownMenuRadioItem key={width} value={width}>{WIDTH_LABEL[width]}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Line height</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={preferences.lineHeight} onValueChange={(v) => onChangeLineHeight(v as ReadingLineHeight)}>
              {(Object.keys(LINE_HEIGHT_LABEL) as ReadingLineHeight[]).map((lh) => (
                <DropdownMenuRadioItem key={lh} value={lh}>{LINE_HEIGHT_LABEL[lh]}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Reading guide</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={preferences.guide} onValueChange={(v) => onChangeGuide(v as ReadingGuide)}>
              {(Object.keys(GUIDE_LABEL) as ReadingGuide[]).map((guide) => (
                <DropdownMenuRadioItem key={guide} value={guide}>{GUIDE_LABEL[guide]}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
