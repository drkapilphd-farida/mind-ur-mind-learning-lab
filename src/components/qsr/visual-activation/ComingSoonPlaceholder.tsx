'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'

type ComingSoonPlaceholderProps = {
  title: string
  summary: string
  trains: string
  icon: LucideIcon
  onExit: () => void
}

// Shared "not built yet" screen for the 6 stub exercises below — a real,
// honest placeholder (names exactly what the exercise will train) rather
// than a fake interactive drill, so nothing here pretends to be a
// finished exercise. Each stub component wraps this with its own real
// VisualActivationExerciseProps signature so it's a drop-in swap once
// its real implementation is ready — the orchestrator never needs to
// change shape when that happens.
export function ComingSoonPlaceholder({ title, summary, trains, icon: Icon, onExit }: ComingSoonPlaceholderProps): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-teal-500/20 text-indigo-500">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-600 uppercase dark:text-amber-400">
        Coming Soon
      </span>
      <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{summary}</p>
      <p className="text-xs font-medium text-muted-foreground/70">Trains: {trains}</p>
      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back
      </button>
    </div>
  )
}
