'use client'

import { Badge } from '@/components/ui/badge'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type SourceTypeCardProps = {
  label: string
  description: string
  emoji: string
  selected: boolean
  disabled: boolean
  onSelect: () => void
}

// Universal Upload Experience™ (Sprint LW-1C.2) — "Premium learning cards.
// NOT technical upload buttons." Reuses the same glassmorphism vocabulary
// established elsewhere this arc (PrimaryLearningMethodCard.tsx,
// LearningGoalSelector.tsx) — glass background, soft hover glow, elegant
// lift — scaled for this step's denser multi-card grid. Enabled sources
// are selectable; disabled sources render a genuine "Coming Soon" badge
// rather than pretending to work — per "Do NOT fake functionality," this
// component's own long-standing principle.
export function SourceTypeCard({ label, description, emoji, selected, disabled, onSelect }: SourceTypeCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative flex h-full flex-col items-start gap-3 overflow-hidden rounded-3xl border bg-background/60 px-6 py-6 text-left backdrop-blur-sm transition-all duration-300 ease-out',
        disabled ? 'cursor-not-allowed border-border/50 opacity-50' : 'cursor-pointer border-border shadow-sm hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg',
        selected && 'scale-[1.01] border-primary shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      {!disabled && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-foreground/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
      {selected && <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/[0.05] blur-xl" aria-hidden="true" />}

      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-2xl" aria-hidden="true">
          {emoji}
        </div>
        {disabled && <Badge variant="secondary">Coming Soon</Badge>}
      </div>

      <div>
        <p className={TYPOGRAPHY.h3}>{label}</p>
        <p className={cn(TYPOGRAPHY.caption, 'mt-1')}>{description}</p>
      </div>
    </button>
  )
}
