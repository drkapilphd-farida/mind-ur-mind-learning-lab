import type { Metadata } from 'next'
import { VisualActivationSuiteExperience } from '@/components/qsr/visual-activation/VisualActivationSuiteExperience'

export const metadata: Metadata = {
  title: 'Visual Activation Suite™ — Visual Intelligence Lab™',
  description: 'A guided warm-up suite that activates your visual system and nervous system before high-speed reading.',
}

// Visual Activation Suite™ — rebuilt from scratch (see
// src/components/qsr/visual-activation/). This route no longer needs any
// of the old sequence's data fetching (neural evolution score, Image
// Persistence DNA score, Tratak streak) — the new suite's own exercises
// don't reuse the Tratak-family engines those queries fed, so the whole
// data-loading step that used to live here is gone; the orchestrator
// component below is self-contained.
export default function VisualActivationPage(): React.JSX.Element {
  return <VisualActivationSuiteExperience />
}
