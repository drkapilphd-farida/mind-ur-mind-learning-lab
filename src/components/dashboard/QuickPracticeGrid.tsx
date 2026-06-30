import Link from 'next/link'
import { Eye, Brain, Target, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

const LAB_ICONS = {
  reading: Eye,
  memory: Brain,
  focus: Target,
  meditation: Leaf,
}

type LabCard =
  | { id: string; label: string; description: string; href: string; status: 'live'; iconKey: keyof typeof LAB_ICONS }
  | { id: string; label: string; description: string; status: 'coming-soon'; iconKey: keyof typeof LAB_ICONS }

const LABS: LabCard[] = [
  {
    id: 'reading',
    label: 'Reading Intelligence',
    description: 'Eye training, reading speed, span expansion',
    href: '/labs/quantum-speed-reading',
    status: 'live',
    iconKey: 'reading',
  },
  {
    id: 'memory',
    label: 'Memory Intelligence',
    description: 'Association, visualization, recall training',
    status: 'coming-soon',
    iconKey: 'memory',
  },
  {
    id: 'focus',
    label: 'Focus Intelligence',
    description: 'Attention training, deep focus, concentration',
    status: 'coming-soon',
    iconKey: 'focus',
  },
  {
    id: 'meditation',
    label: 'Meditation Intelligence',
    description: 'Calm, presence, mental recovery',
    status: 'coming-soon',
    iconKey: 'meditation',
  },
]

function LabCard({ lab }: { lab: LabCard }): React.JSX.Element {
  const Icon = LAB_ICONS[lab.iconKey]
  const isLive = lab.status === 'live'

  const content = (
    <div
      className={cn(
        'group flex h-full flex-col rounded-2xl border p-5 transition-all duration-150',
        isLive
          ? 'cursor-pointer bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5'
          : 'bg-muted/30 opacity-60 cursor-default',
      )}
      role={isLive ? undefined : 'group'}
      aria-label={isLive ? undefined : `${lab.label}, coming soon`}
      aria-disabled={isLive ? undefined : true}
    >
      <div className={cn(
        'flex size-10 items-center justify-center rounded-xl',
        isLive ? 'bg-foreground/[0.06]' : 'bg-muted',
      )}>
        <Icon className={cn('size-5', isLive ? 'text-foreground' : 'text-muted-foreground')} aria-hidden="true" />
      </div>

      <div className="mt-4 flex-1">
        <p className={cn('text-sm font-semibold', isLive ? 'text-foreground' : 'text-muted-foreground')}>
          {lab.label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{lab.description}</p>
      </div>

      <div className="mt-4">
        {isLive ? (
          <span className="text-xs font-medium text-primary group-hover:underline underline-offset-2">
            Begin practice →
          </span>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Coming soon
          </span>
        )}
      </div>
    </div>
  )

  if (isLive && 'href' in lab) {
    return <Link href={lab.href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">{content}</Link>
  }
  return content
}

export function QuickPracticeGrid(): React.JSX.Element {
  return (
    <section aria-label="Quick practice">
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Quick Practice™
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LABS.map((lab) => (
          <LabCard key={lab.id} lab={lab} />
        ))}
      </div>
    </section>
  )
}
