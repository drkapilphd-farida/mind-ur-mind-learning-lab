import { CalendarClock } from 'lucide-react'
import type { EvolutionNote } from '../../dna/dnaTypes'

type EvolutionNotesLogProps = {
  notes: readonly EvolutionNote[]
}

export function EvolutionNotesLog({ notes }: EvolutionNotesLogProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <CalendarClock className="size-3.5" aria-hidden="true" />
        AI Evolution Notes™
      </div>

      {notes.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">More training required to generate weekly evolution notes.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {notes.map((note) => (
            <li key={note.weekLabel}>
              <p className="text-xs font-semibold text-foreground">{note.weekLabel}</p>
              <ul className="mt-1 space-y-1">
                {note.lines.map((line) => (
                  <li key={line} className="text-sm text-muted-foreground">
                    {line}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
