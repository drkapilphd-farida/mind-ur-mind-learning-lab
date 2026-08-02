type MysteryLayoutProps = {
  children: React.ReactNode
}

// Shared per-scene shell — every Mystery-1 scene renders inside this same
// centered, text-centered column. Purely presentational; scene-to-scene
// transitions live in the orchestrator (MysteryExperience.tsx).
export function MysteryLayout({ children }: MysteryLayoutProps): React.JSX.Element {
  return <div className="flex w-full flex-col items-center gap-8 text-center">{children}</div>
}
