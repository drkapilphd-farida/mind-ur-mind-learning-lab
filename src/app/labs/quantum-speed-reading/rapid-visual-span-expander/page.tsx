import type { Metadata } from 'next'
import { RapidVisualSpanExpanderExperience } from '@/features/rapid-visual-span-expander/components/RapidVisualSpanExpanderExperience'

export const metadata: Metadata = {
  title: 'Rapid Visual Span Expander — Quantum Speed Reading Lab™',
}

// Rapid Visual Span Expander™ — the second advanced training exercise,
// alongside Schulte Grid Speed Drill™. Deliberately its own route/folder;
// no collision with any existing V1 route (including the conceptually
// related eye-span, peripheral-flash, and rapid-visual-intelligence
// routes — this mode's sequential single-token flashing + multi-select
// recall mechanic is a distinct design from all of them, see
// rapidVisualSpanExpanderDataset.ts / RapidVisualSpanExpanderCanvas.tsx).
export default function RapidVisualSpanExpanderPage(): React.JSX.Element {
  return <RapidVisualSpanExpanderExperience />
}
