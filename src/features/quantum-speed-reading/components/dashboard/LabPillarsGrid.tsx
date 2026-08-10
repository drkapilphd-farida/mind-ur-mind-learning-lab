import Link from 'next/link'

type LabPillar = {
  icon: string
  title: string
  description: string
  href: string
}

// User feedback — "instead of scattering links or hiding modules, display
// all core pillars... as beautiful, interactive cards on this single
// page." Real routes only, matching each hub page's own real metadata
// title/description (see reading-hub/, intuition-hub/, visualization-hub/,
// right-brain-hub/ page.tsx files) — never a fabricated destination.
// "Rapid Visual Intelligence" (Flash Words/Numbers/Symbols/Images/Phrases)
// was removed outright — legacy/orphaned, never a real pillar.
const LAB_PILLARS: readonly LabPillar[] = [
  {
    icon: '📚',
    title: 'Reading Intelligence',
    description: 'Every Reading Mode, your recent activity, and your real progress — in one place.',
    href: '/labs/quantum-speed-reading/reading-hub',
  },
  {
    icon: '🔮',
    title: 'Intuition Development',
    description: 'Gamified intuition and ESP training exercises, alongside your real progress.',
    href: '/labs/quantum-speed-reading/intuition-hub',
  },
  {
    icon: '🌌',
    title: 'Visualisation',
    description: 'Gamified mental-visualization and spatial-reasoning training exercises.',
    href: '/labs/quantum-speed-reading/visualization-hub',
  },
  {
    icon: '🧠',
    title: 'Right Brain Activation',
    description: 'Gamified right-brain and photographic-memory training exercises.',
    href: '/labs/quantum-speed-reading/right-brain-hub',
  },
  {
    icon: '💪',
    title: 'Brain Gym',
    description: '7 guided visual-activation warm-ups — breathing, eye tracking, peripheral vision, rapid word capture, color pulsing, and micro-recall — with haptics and audio.',
    href: '/labs/quantum-speed-reading/brain-gym',
  },
] as const

export function LabPillarsGrid(): React.JSX.Element {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Explore Every Pillar</p>
        <Link href="/labs/quantum-speed-reading/library" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Browse the full Library →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LAB_PILLARS.map((pillar) => (
          <Link
            key={pillar.href}
            href={pillar.href}
            className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-all duration-(--duration-base) ease-in-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div aria-hidden="true" className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
              {pillar.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{pillar.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pillar.description}</p>
            </div>
            <span className="mt-auto text-xs font-medium text-primary opacity-0 transition-opacity duration-(--duration-base) group-hover:opacity-100">
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
