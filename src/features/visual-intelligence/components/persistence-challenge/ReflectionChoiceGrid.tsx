'use client'

// A bespoke sibling of src/components/exercise-engine/ChoiceGrid.tsx, not a
// modification of it — that component requires a `correctIndex` and a
// right/wrong feedback state, which is the wrong shape for a subjective,
// no-right-answer self-report like "What did you notice?" Same visual
// language and 1-4 keyboard shortcuts, but a single onSelect and immediate
// advance instead.

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

type ReflectionChoiceGridOption = {
  value: string
  label: string
}

type ReflectionChoiceGridProps = {
  options: readonly ReflectionChoiceGridOption[]
  onSelect: (value: string) => void
  disabled?: boolean
}

export function ReflectionChoiceGrid({ options, onSelect, disabled = false }: ReflectionChoiceGridProps): React.JSX.Element {
  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (disabled) return
      const num = Number(event.key)
      if (num >= 1 && num <= options.length) {
        const option = options[num - 1]
        if (option) onSelect(option.value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, onSelect, options])

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="What did you notice?">
        {options.map((option, idx) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            disabled={disabled}
            aria-label={`Option ${idx + 1}: ${option.label}`}
            className={cn(
              'flex min-h-[68px] items-center justify-center rounded-xl border border-border bg-card px-4 py-3',
              'text-base font-medium text-foreground transition-all duration-150',
              'hover:bg-muted hover:border-foreground/20 active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            <span className="mr-2 text-[10px] text-muted-foreground" aria-hidden="true">{idx + 1}</span>
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-muted-foreground" aria-hidden="true">
        Press 1 · 2 · 3 · 4 or tap to choose
      </p>
    </div>
  )
}
