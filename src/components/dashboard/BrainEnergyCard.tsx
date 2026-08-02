'use client'

import { useEffect, useState } from 'react'
import { Sun, Sunset, Moon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type EnergyState = {
  label: string
  recommendation: string
  icon: LucideIcon
  period: 'morning' | 'afternoon' | 'evening'
}

function getEnergyState(hour: number): EnergyState {
  if (hour >= 5 && hour < 12) {
    return {
      label: 'Morning energy',
      recommendation: 'High cognitive energy — the optimal time for Reading and Focus practice.',
      icon: Sun,
      period: 'morning',
    }
  }
  if (hour >= 12 && hour < 17) {
    return {
      label: 'Afternoon flow',
      recommendation: 'Steady and focused — ideal for Memory training and spaced repetition.',
      icon: Sun,
      period: 'afternoon',
    }
  }
  if (hour >= 17 && hour < 21) {
    return {
      label: 'Evening wind-down',
      recommendation: 'Reflection mode — lighter practice and consolidating today\'s learning works best now.',
      icon: Sunset,
      period: 'evening',
    }
  }
  return {
    label: 'Rest and recovery',
    recommendation: 'Your brain consolidates learning during rest. A short session is fine — sleep is the real training.',
    icon: Moon,
    period: 'evening',
  }
}

// Client component — reads the student's actual local clock, which the server
// cannot know. Renders a neutral state until mounted.
export function BrainEnergyCard(): React.JSX.Element {
  const [energy, setEnergy] = useState<EnergyState | null>(null)

  useEffect(() => {
    setEnergy(getEnergyState(new Date().getHours()))
  }, [])

  const Icon = energy?.icon ?? Sun

  return (
    <div className="dashboard-glass-card dashboard-glass-lift flex items-start gap-4 p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.05]">
        <Icon className="size-5 text-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Brain Energy™</p>
          {energy !== null && (
            <span className="text-xs font-medium text-foreground">{energy.label}</span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {energy?.recommendation ?? 'Checking your energy level…'}
        </p>
      </div>
    </div>
  )
}
