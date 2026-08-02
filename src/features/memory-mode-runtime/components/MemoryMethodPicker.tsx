import { BookOpen, Eye, Link2, Layers, MapPinned, RotateCcw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { cn } from '@/lib/utils'
import { MEMORY_METHODS } from '../types/MemoryMethod'
import type { MemoryMethodId } from '../types/MemoryMethod'

type MemoryMethodPickerProps = {
  onSelect: (method: MemoryMethodId) => void
  disabled: boolean
}

const METHOD_ICON: Record<MemoryMethodId, LucideIcon> = {
  story: BookOpen,
  visualization: Eye,
  association: Link2,
  chunking: Layers,
  journey: MapPinned,
  'recall-practice': RotateCcw,
}

// AI Learning Studio™ Sprint ALS-15 — Memory Method™ picker. A real
// `radiogroup` of the six named Memory Methods (matching the accessible
// selection pattern `ReadingThemeSelector` already established), shown
// before a Memory Mode™ session starts. Selecting a method starts the
// session immediately with that method — there's no separate "confirm"
// step, since every method is a real, honest, freely-reversible choice
// (a learner can simply finish and start a new session with a different
// method), not a consequential one worth a second click to guard.
export function MemoryMethodPicker({ onSelect, disabled }: MemoryMethodPickerProps): React.JSX.Element {
  return (
    <div role="radiogroup" aria-label="Choose a Memory Method" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {MEMORY_METHODS.map((method) => {
        const Icon = METHOD_ICON[method.id]
        return (
          <Card key={method.id} className="p-0">
            <button
              type="button"
              role="radio"
              aria-checked={false}
              disabled={disabled}
              onClick={() => onSelect(method.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl p-4 text-left transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
              )}
            >
              <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className={ICON_SIZE.md} />
              </span>
              <span className="space-y-0.5">
                <span className={cn(TYPOGRAPHY.h4, 'block')}>{method.label}</span>
                <span className={cn(TYPOGRAPHY.small, 'block')}>{method.description}</span>
              </span>
            </button>
          </Card>
        )
      })}
    </div>
  )
}
