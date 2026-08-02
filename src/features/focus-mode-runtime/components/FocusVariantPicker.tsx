'use client'

import { useState } from 'react'
import { Clock, Timer, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { cn } from '@/lib/utils'
import { FOCUS_VARIANTS, READING_SPRINT_DURATIONS_MINUTES } from '../types/FocusVariant'
import type { FocusSessionConfig, FocusVariantId } from '../types/FocusVariant'

type FocusVariantPickerProps = {
  onSelect: (config: FocusSessionConfig) => void
  disabled: boolean
}

const VARIANT_ICON: Record<FocusVariantId, LucideIcon> = {
  'deep-focus': Timer,
  'reading-sprint': Zap,
  pomodoro: Clock,
}

// AI Learning Studio™ Sprint ALS-16 — Focus Mode™ (Mini) variant picker,
// structurally mirroring Memory Mode's own `MemoryMethodPicker.tsx`
// (ALS-15) — a real accessible `radiogroup` of the three named Focus
// variants. Deep Focus Timer and Pomodoro Mode start immediately on
// selection, matching every other mode's own picker (no real config to
// gather). Reading Sprint is the one variant with real config — its
// target duration — so selecting its card expands an inline duration
// picker rather than starting immediately; the session only starts once a
// real duration is chosen.
export function FocusVariantPicker({ onSelect, disabled }: FocusVariantPickerProps): React.JSX.Element {
  const [expandedVariant, setExpandedVariant] = useState<'reading-sprint' | null>(null)

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Choose a Focus variant" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FOCUS_VARIANTS.map((variant) => {
          const Icon = VARIANT_ICON[variant.id]
          const isExpanded = expandedVariant === variant.id

          return (
            <Card key={variant.id} className="p-0">
              <button
                type="button"
                role="radio"
                aria-checked={isExpanded}
                disabled={disabled}
                onClick={() => (variant.id === 'reading-sprint' ? setExpandedVariant((current) => (current === 'reading-sprint' ? null : 'reading-sprint')) : onSelect({ variant: variant.id }))}
                className={cn(
                  'flex w-full flex-col items-start gap-2 rounded-xl p-4 text-left transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
                  isExpanded && 'bg-accent/30',
                )}
              >
                <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className={ICON_SIZE.md} />
                </span>
                <span className="space-y-0.5">
                  <span className={cn(TYPOGRAPHY.h4, 'block')}>{variant.label}</span>
                  <span className={cn(TYPOGRAPHY.small, 'block')}>{variant.description}</span>
                </span>
              </button>
            </Card>
          )
        })}
      </div>

      {expandedVariant === 'reading-sprint' && (
        <Card className="animate-in fade-in p-4 duration-(--duration-base)">
          <p className={TYPOGRAPHY.small}>Choose a target time:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {READING_SPRINT_DURATIONS_MINUTES.map((minutes) => (
              <Button key={minutes} type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onSelect({ variant: 'reading-sprint', targetDurationMinutes: minutes })}>
                {minutes} min
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
