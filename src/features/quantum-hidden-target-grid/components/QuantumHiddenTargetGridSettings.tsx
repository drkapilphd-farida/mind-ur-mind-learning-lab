'use client'

import Link from 'next/link'
import { GRID_SIZE, GRID_ROWS, GRID_COLUMNS } from '../quantumHiddenTargetGridDataset'

type QuantumHiddenTargetGridSettingsProps = {
  onStart: () => void
}

// No per-attempt configuration exists (the grid is always the same
// 4×4 layout, and there's no target-pace concept for a pure guessing
// task), so this screen is purely the instructions/intro gate every
// advanced exercise has before Start — same visual convention as
// EspZenerTelepathySettings.tsx/SchulteGridDrillSettings.tsx.
export function QuantumHiddenTargetGridSettings({ onStart }: QuantumHiddenTargetGridSettingsProps): React.JSX.Element {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <Link
        href="/labs/quantum-speed-reading"
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      >
        Exit
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Quantum Hidden Target Grid™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A {GRID_ROWS}×{GRID_COLUMNS} grid of hidden boxes. One box secretly holds the target each round — don&apos;t
          think it through, just tap the box your gut feels is right. Consecutive hits build a streak multiplier for
          bonus energy.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">{GRID_SIZE} rounds per sprint — every box is the target exactly once.</p>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
