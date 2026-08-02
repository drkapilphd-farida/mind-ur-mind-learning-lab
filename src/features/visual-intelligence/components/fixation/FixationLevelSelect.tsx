'use client'

import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type FixationLevelSelectOption = {
  value: string
  label: string
}

type FixationLevelSelectProps = {
  title: string
  subtitle?: string
  options: readonly FixationLevelSelectOption[]
  onSelect: (value: string) => void
}

// Generic level/variant picker — reused by Static Dot Focus (duration),
// Breath Sync (duration), Dynamic Dot (path), and Multi Dot Attention
// (dot count).
export function FixationLevelSelect({ title, subtitle, options, onSelect }: FixationLevelSelectProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center', fadeClass)}>
      <div>
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="lg"
            className={cn('rounded-2xl py-6', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
