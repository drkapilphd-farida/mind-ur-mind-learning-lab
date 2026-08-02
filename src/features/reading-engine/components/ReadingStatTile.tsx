// Master Reading Engine™ (Sprint 3.1A/3.1B) — the {label, value} stat tile
// that was copy-pasted inside VerticalWordReadingCanvas.tsx (plain 'inline'
// style) and VerticalWordReadingComplete.tsx (card-wrapped 'card' style —
// these two were never actually byte-identical, hence the variant prop).
// Only the atom is extracted — no shared completion *screen* yet, since
// this pack's own precedent (VerticalWordReadingComplete.tsx,
// ComprehensionResultsScreen.tsx, ReadingSessionComplete.tsx) is one
// purpose-built screen per mode-shape, and building a generic screen
// composition before a second real mode exists to prove what varies risks
// a 4th orphaned screen.
export type ReadingStatTileProps = {
  label: string
  value: string
  // 'inline' matches the plain stat-row style (VerticalWordReadingCanvas's
  // original Stat); 'card' matches the card-wrapped, larger-value style
  // (VerticalWordReadingComplete's original Stat) — these two were never
  // actually byte-identical, so both are preserved exactly rather than
  // forcing one visual shape on both call sites.
  variant?: 'inline' | 'card'
}

export function ReadingStatTile({ label, value, variant = 'inline' }: ReadingStatTileProps): React.JSX.Element {
  if (variant === 'card') {
    return (
      <div className="rounded-2xl border bg-card px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}
