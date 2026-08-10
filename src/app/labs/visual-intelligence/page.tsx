import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Visual Intelligence Lab™',
  description: 'Visual fixation training and Tratak intelligence missions.',
}

// Visual Activation™ (rebuilt as "Brain Gym") moved to its own pillar at
// /labs/quantum-speed-reading/brain-gym and is no longer part of this hub
// — this route stays alive since FixationHub/TratakJourneyLanding/
// TratakJourneyLocked all still link back here as their own "back to hub"
// destination, but its content is now real links to the two sibling
// features that still live under this hub, not a dead Visual Activation
// card.
const HUB_LINKS = [
  {
    title: 'Visual Fixation Engine™',
    description: 'Steady-gaze fixation drills that build visual stability and focus.',
    href: '/labs/visual-intelligence/fixation',
  },
  {
    title: 'Tratak Intelligence Journey™',
    description: 'Progressive guided practice that develops stable visual attention and persistence.',
    href: '/labs/visual-intelligence/tratak',
  },
] as const

export default function VisualIntelligenceLabPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Intelligence Journey</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Visual Intelligence Lab™</h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-foreground/80">
        Build visual stability and steady attention through guided fixation and Tratak practice.
      </p>

      <div className="mt-10 space-y-4">
        {HUB_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="block">
            <Card className="transition-shadow duration-200 hover:shadow-md">
              <CardContent className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-medium text-foreground">{link.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                </div>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
