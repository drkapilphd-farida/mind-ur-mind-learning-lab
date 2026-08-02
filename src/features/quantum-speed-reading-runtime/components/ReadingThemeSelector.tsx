import { Coffee, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReadingTheme } from '../types/ReadingTheme'

type ReadingThemeSelectorProps = {
  theme: ReadingTheme
  onChange: (theme: ReadingTheme) => void
}

const THEMES = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'sepia' as const, label: 'Sepia', icon: Coffee },
]

// Quantum Speed Reading™ Production Sprint-3. Reading Themes — a real
// `radiogroup` (one theme is always selected, exactly one at a time),
// not a loose row of independent toggle buttons — the correct ARIA
// pattern for a mutually exclusive choice, reusing the existing `Button`
// primitive rather than a new control. Switching themes touches nothing
// but this component's own local `theme` value; no session/runtime state
// is read or written.
export function ReadingThemeSelector({ theme, onChange }: ReadingThemeSelectorProps): React.JSX.Element {
  return (
    <div role="radiogroup" aria-label="Reading theme" className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
      {THEMES.map(({ value, label, icon: Icon }) => (
        <Button key={value} type="button" role="radio" aria-checked={theme === value} aria-label={label} variant={theme === value ? 'default' : 'ghost'} size="sm" onClick={() => onChange(value)}>
          <Icon aria-hidden="true" />
        </Button>
      ))}
    </div>
  )
}
