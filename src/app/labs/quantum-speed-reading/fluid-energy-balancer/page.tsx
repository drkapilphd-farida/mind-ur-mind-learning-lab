import type { Metadata } from 'next'
import { FluidEnergyBalancerExperience } from '@/features/fluid-energy-balancer/components/FluidEnergyBalancerExperience'

export const metadata: Metadata = {
  title: 'Fluid Energy Balancer — Quantum Speed Reading Lab™',
}

// Fluid Energy Balancer™ — a Visualization Hub exercise: a real-time,
// dual-scale mental focus and mind-over-matter balancing simulation.
// Deliberately its own route/folder, no collision with any existing
// route.
export default function FluidEnergyBalancerPage(): React.JSX.Element {
  return <FluidEnergyBalancerExperience />
}
