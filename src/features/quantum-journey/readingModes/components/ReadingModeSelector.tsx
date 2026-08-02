'use client'

import { useState } from 'react'
import { AlignLeft, MoveVertical, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { clampTargetWpm, MIN_TARGET_WPM, MAX_TARGET_WPM, type ReadingPresentationChoice } from '../pacingMath'

type ReadingModeSelectorProps = {
  standardModeLabel: string
  defaultChoice: ReadingPresentationChoice
  defaultTargetWpm: number
  onConfirm: (choice: ReadingPresentationChoice, targetWpm: number) => void
}

const MODE_OPTIONS: readonly { choice: ReadingPresentationChoice; label: string; description: string; icon: typeof AlignLeft }[] = [
  { choice: 'standard', label: 'Standard Text', description: "Today's assigned reading mode", icon: AlignLeft },
  { choice: 'guiding-line', label: 'Guiding Line Pacer', description: 'A moving line guides your eyes down the page', icon: MoveVertical },
  { choice: 'rsvp', label: 'RSVP Mode', description: 'Words flash one at a time at your target speed', icon: Zap },
]

// UI Controls & Mode Selector™ — shown once at the start of every
// reading step, before any content renders. `defaultChoice` reflects
// Week 1/2/3 Integration (Guiding Line Pacer recommended in Week 1, RSVP
// Mode in Weeks 2-3 — see pacingMath.ts's getDefaultPresentationChoice),
// but every option is always selectable — "customize or override" is a
// real user choice every single day, not just a one-time preference.
export function ReadingModeSelector({ standardModeLabel, defaultChoice, defaultTargetWpm, onConfirm }: ReadingModeSelectorProps): React.JSX.Element {
  const [choice, setChoice] = useState<ReadingPresentationChoice>(defaultChoice)
  const [targetWpm, setTargetWpm] = useState(() => clampTargetWpm(defaultTargetWpm))

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-12 text-center">
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Choose Your Reading Mode</p>
        <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">How do you want to read today?</h2>
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {MODE_OPTIONS.map(({ choice: optionChoice, label, description, icon: Icon }) => {
          const isSelected = choice === optionChoice
          const isRecommended = defaultChoice === optionChoice
          return (
            <button
              key={optionChoice}
              type="button"
              onClick={() => setChoice(optionChoice)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-all duration-150',
                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/10',
              )}
            >
              {isRecommended && (
                <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
                  Recommended
                </span>
              )}
              <Icon className={cn('size-5', isSelected ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground">{label}</span>
              <span className="text-[11px] leading-tight text-muted-foreground">
                {optionChoice === 'standard' ? standardModeLabel : description}
              </span>
            </button>
          )
        })}
      </div>

      {choice !== 'standard' && (
        <div className="flex w-full max-w-xs flex-col items-center gap-1.5">
          <label htmlFor="mode-selector-wpm-slider" className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Target Speed: {targetWpm} WPM
          </label>
          <input
            id="mode-selector-wpm-slider"
            type="range"
            min={MIN_TARGET_WPM}
            max={MAX_TARGET_WPM}
            step={10}
            value={targetWpm}
            onChange={(e) => setTargetWpm(clampTargetWpm(Number(e.target.value)))}
            className="w-full accent-primary"
          />
          <p className="text-[10px] text-muted-foreground/70">You can still adjust this live once reading starts.</p>
        </div>
      )}

      <Button type="button" size="lg" className="rounded-full" onClick={() => onConfirm(choice, targetWpm)}>
        Start Reading →
      </Button>
    </div>
  )
}
