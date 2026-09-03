'use client'

import { useState } from 'react'
import { X, ClipboardList, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ParkedThought = { id: string; text: string }

// Distraction Parking Lot™ — a quick scratch pad for the stray thought
// that pulls focus mid-session ("call the dentist", "forgot to reply to
// X") — jot it here, keep going, deal with it later. Deliberately
// ephemeral: local component state only, cleared naturally when the
// session ends. No Server Action, no table — this is scratch space, not
// a real feature to persist or review later; adding a backend for it
// would be solving a problem nobody asked for.
export function DistractionParkingLot(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [thoughts, setThoughts] = useState<ParkedThought[]>([])

  function handlePark(): void {
    const text = draft.trim()
    if (text.length === 0) return
    setThoughts((current) => [...current, { id: `${Date.now()}-${current.length}`, text }])
    setDraft('')
  }

  function handleRemove(id: string): void {
    setThoughts((current) => current.filter((thought) => thought.id !== id))
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3.5 py-2.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-sm transition-colors hover:text-foreground"
        aria-label="Open distraction parking lot"
      >
        <ClipboardList className="size-3.5" aria-hidden="true" />
        {thoughts.length > 0 ? `${thoughts.length} parked` : 'Parking Lot'}
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 w-[calc(100vw-2.5rem)] max-w-xs rounded-2xl border border-border/60 bg-card/95 p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <ClipboardList className="size-3.5 text-primary" aria-hidden="true" />
          Distraction Parking Lot
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Collapse distraction parking lot"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        Random thought pulling your focus? Park it here and get back to your session.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handlePark()
            }
          }}
          placeholder="Quick note…"
          className="w-full min-w-0 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
        />
        <button
          type="button"
          onClick={handlePark}
          disabled={draft.trim().length === 0}
          className={cn(
            'shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity',
            draft.trim().length === 0 && 'opacity-40',
          )}
        >
          Park it
        </button>
      </div>

      {thoughts.length > 0 && (
        <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto">
          {thoughts.map((thought) => (
            <li
              key={thought.id}
              className="flex items-start justify-between gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11px] text-foreground"
            >
              <span className="min-w-0 break-words">{thought.text}</span>
              <button
                type="button"
                onClick={() => handleRemove(thought.id)}
                aria-label="Remove parked thought"
                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
