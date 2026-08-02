import { Square, Smile } from 'lucide-react'

// Explicitly a placeholder — the real stimulus is out of scope for this
// prototype. Three simple, generic elements (a shape, a color swatch, a
// face-like icon) give Screen 4 something meaningful to tap on, without
// attempting to be the final Brain Experience stimulus.
export function PlaceholderStimulusImage(): React.JSX.Element {
  return (
    <div className="relative size-72 overflow-hidden rounded-3xl border border-border/60 bg-muted/30">
      <div className="absolute top-8 left-8 flex size-14 items-center justify-center rounded-2xl bg-foreground/10 text-foreground/70">
        <Square className="size-7" aria-hidden="true" />
      </div>
      <div className="absolute top-10 right-8 size-12 rounded-full bg-primary/70" aria-hidden="true" />
      <div className="absolute bottom-8 left-1/2 flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-foreground/10 text-foreground/70">
        <Smile className="size-8" aria-hidden="true" />
      </div>
    </div>
  )
}
